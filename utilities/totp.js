// Google Authenticator (TOTP) helpers shared by the panel (services/user.js)
// and vault client (services/vaultAuth.js) 2FA flows. The generated secret
// is stored app-layer encrypted in WrUuid (utilities/index.js encrypt/
// decrypt) -- callers decrypt it right before verifyTotpCode.
const { authenticator } = require("otplib");
const QRCode = require("qrcode");
const configConstants = require("./configConstants");

const DEFAULT_ISSUER = "PassVault";

// Google Authenticator's "service name" (the label shown above the account
// name once scanned) -- sourced from the same tblConfigs PROJECTCODE row
// admins already set for the project's name elsewhere, so it stays in sync
// without a code change. Read fresh on every call (not cached) since
// global.tblConfigs can be reloaded at runtime; falls back to PassVault if
// that row is missing/inactive.
const getIssuer = () => {
  const configRow = (global.tblConfigs || []).find(
    (item) => item.key?.toLowerCase() === configConstants.PROJECT_NAME.toLowerCase()
  );
  return (configRow?.isActive && configRow.value) || DEFAULT_ISSUER;
};

const generateTotpSecret = () => authenticator.generateSecret();

const buildTotpKeyUri = (accountLabel, secret) =>
  authenticator.keyuri(accountLabel, getIssuer(), secret);

const generateQrCodeDataUrl = async (keyUri) => QRCode.toDataURL(keyUri);

const verifyTotpCode = (code, secret) => {
  try {
    return authenticator.check(String(code || ""), secret);
  } catch (err) {
    return false;
  }
};

module.exports = {
  generateTotpSecret,
  buildTotpKeyUri,
  generateQrCodeDataUrl,
  verifyTotpCode,
};
