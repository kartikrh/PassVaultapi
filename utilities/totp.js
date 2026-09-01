// Google Authenticator (TOTP) helpers shared by the panel (services/user.js)
// and vault client (services/vaultAuth.js) 2FA flows. The generated secret
// is stored app-layer encrypted in WrUuid (utilities/index.js encrypt/
// decrypt) -- callers decrypt it right before verifyTotpCode.
const { authenticator } = require("otplib");
const QRCode = require("qrcode");

const ISSUER = "PassVault";

const generateTotpSecret = () => authenticator.generateSecret();

const buildTotpKeyUri = (accountLabel, secret) =>
  authenticator.keyuri(accountLabel, ISSUER, secret);

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
