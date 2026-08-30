const { encrypt, decrypt } = require("../utilities/index");
const { exchangeAuthCodeForTokens } = require("../utilities/googleDrive");
const { resolveWhitelabelFromRequest } = require("./vaultAuth");
const {
  setClientDriveRefreshTokenQuery,
  getClientDriveRefreshTokenQuery,
} = require("../repository/TableClient");

// Completes Drive OAuth consent (POST /vault/auth/drive/connect) -- the client
// runs the Google OAuth screen itself (drive.appdata scope, access_type=offline,
// prompt=consent) using this domain's own White Label Google client
// (tblWhitelabel.wrGoogle_Key/wrGoogle_Secret -- same client Sign-In uses),
// and hands the resulting one-time code to the server, which exchanges it
// for a refresh token and stores it app-layer encrypted.
const connectDriveService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const { code } = request.body || {};
  if (!code) {
    throw new Error("code is required");
  }

  const whitelabel = resolveWhitelabelFromRequest(request);
  if (!whitelabel?.googleKey || !whitelabel?.googleSecret) {
    throw new Error("Google Drive is not configured for this domain");
  }
  const clientSecret = decrypt(whitelabel.googleSecret);

  const tokens = await exchangeAuthCodeForTokens(code, whitelabel.googleKey, clientSecret);
  const encryptedRefreshToken = encrypt(tokens.refresh_token);
  await setClientDriveRefreshTokenQuery(WrClientId, encryptedRefreshToken, fastify);

  return { driveConnected: true };
};

// Tells the client whether it has completed Drive consent yet (GET
// /vault/auth/drive/status) -- just a presence check on the stored refresh
// token, never decrypted here since the token value itself isn't needed.
const getDriveStatusService = async (request, fastify) => {
  const { WrClientId } = request.clientTokenInfo;
  const encryptedRefreshToken = await getClientDriveRefreshTokenQuery(WrClientId, fastify);
  return { driveConnected: !!encryptedRefreshToken };
};

module.exports = { connectDriveService, getDriveStatusService };
