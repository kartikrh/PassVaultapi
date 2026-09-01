// VPN/proxy detection for the vault client's login/signup surface and its
// periodic signed-in re-check (see services/vaultAuth.js's requireNoVpn and
// routes/vault/auth's GET /vpnStatus). Backed by proxycheck.io (free tier:
// 1,000 checks/day) -- config lives in tblConfigs, same URL+key+enabled-flag
// shape as the existing FRAUDDETECTIONAPI/ISFRAUDDETDECTIONAPI pair, edited
// via PassVaultpanel's Config admin screen, not hardcoded here.
const axios = require("axios");
const configConstants = require("./configConstants");

// Loopback/private ranges never resolve to anything meaningful for
// proxycheck.io (dev/localhost, or a client behind a corporate/home NAT
// hitting this API server directly) -- skip the call entirely rather than
// let it error out on every local request.
const isPrivateIp = (ip) => {
  if (!ip) return true;
  const stripped = ip.replace(/^::ffff:/, "");
  return (
    stripped === "127.0.0.1" ||
    stripped === "::1" ||
    /^10\./.test(stripped) ||
    /^192\.168\./.test(stripped) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(stripped)
  );
};

const getConfig = () => {
  const configs = global.tblConfigs || [];
  const find = (key) => configs.find((item) => item.key === key && item.isActive)?.value;
  return {
    enabled: (find(configConstants.IS_VPN_CHECK_ENABLED) || "").toLowerCase() === "true",
    apiUrl: find(configConstants.VPN_CHECK_API_URL),
    apiKey: find(configConstants.VPN_CHECK_API_KEY),
  };
};

// Resolves to { checked: boolean, isVpn: boolean }. checked is false
// whenever the check was skipped or failed (feature off, no key, private
// IP, network error, non-ok API response) -- callers should treat
// checked:false the same as isVpn:false (fail OPEN, not closed: a
// third-party outage must never lock every client out of the app).
const checkVpn = async (ip) => {
  const { enabled, apiUrl, apiKey } = getConfig();
  if (!enabled || !apiUrl || !apiKey || isPrivateIp(ip)) {
    return { checked: false, isVpn: false };
  }

  try {
    const cleanIp = ip.replace(/^::ffff:/, "");
    const url = `${apiUrl.replace(/\/$/, "")}/${cleanIp}`;
    const { data } = await axios.get(url, {
      params: { key: apiKey, vpn: 1 },
      timeout: 5000,
    });
    if (data?.status !== "ok") {
      return { checked: false, isVpn: false };
    }
    const entry = data[cleanIp];
    return { checked: true, isVpn: entry?.proxy === "yes" };
  } catch (err) {
    console.log("checkVpn error (failing open):", err.message);
    return { checked: false, isVpn: false };
  }
};

module.exports = { checkVpn };
