// Thin REST wrapper around Google Drive v3, scoped to a single per-client file
// living in the client's own hidden "appDataFolder" (drive.appdata scope) --
// matches the spec's "one encrypted JSON file in that client's own Google Drive".
// Built on axios + google-auth-library (both already dependencies) instead of
// pulling in the full googleapis package for what is a handful of calls.
const axios = require("axios");
const { OAuth2Client } = require("google-auth-library");

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const VAULT_FILE_NAME = "passvault-vault.json.enc";

// The client-side popup consent (DriveConnectionStatus.js's useGoogleLogin
// with flow: "auth-code", default ux_mode "popup") never redirects the
// browser anywhere -- Google's token endpoint still requires a redirect_uri
// param on the exchange, and for this GIS popup flow it must be exactly the
// literal string "postmessage", not a real URL.
const REDIRECT_URI = "postmessage";

// clientId/clientSecret are the calling whitelabel's own Google OAuth client
// (tblWhitelabel.wrGoogle_Key / wrGoogle_Secret) -- Drive access reuses the
// same per-domain client as Google Sign-In instead of one global app-wide client.
const getOAuthClient = (clientId, clientSecret) => {
  if (!clientId || !clientSecret) {
    throw new Error("Google Drive is not configured for this domain");
  }
  return new OAuth2Client(clientId, clientSecret, REDIRECT_URI);
};

// code: the one-time authorization code the client obtained from Google's
// consent screen (requesting the drive.appdata scope, access_type=offline, prompt=consent).
const exchangeAuthCodeForTokens = async (code, clientId, clientSecret) => {
  const oauth2Client = getOAuthClient(clientId, clientSecret);
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new Error("Google did not return a refresh token -- request access_type=offline and prompt=consent");
  }
  return tokens;
};

const getAccessTokenFromRefreshToken = async (refreshToken, clientId, clientSecret) => {
  const oauth2Client = getOAuthClient(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken = accessTokenResponse?.token;
  if (!accessToken) {
    throw new Error("Failed to obtain a Google Drive access token");
  }
  return accessToken;
};

const findVaultFile = async (accessToken) => {
  const { data } = await axios.get(DRIVE_FILES_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: {
      spaces: "appDataFolder",
      q: `name = '${VAULT_FILE_NAME}' and trashed = false`,
      fields: "files(id, headRevisionId)",
    },
  });
  return data.files?.[0] || null;
};

const getVaultFileContent = async (accessToken, fileId) => {
  const { data } = await axios.get(`${DRIVE_FILES_URL}/${fileId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    params: { alt: "media" },
    responseType: "text",
    transformResponse: (res) => res, // the blob is opaque ciphertext -- never JSON.parse it
  });
  return data;
};

const createVaultFile = async (accessToken, blob) => {
  const { data: created } = await axios.post(
    DRIVE_FILES_URL,
    { name: VAULT_FILE_NAME, parents: ["appDataFolder"] },
    { headers: { Authorization: `Bearer ${accessToken}` }, params: { fields: "id" } }
  );
  const { data: updated } = await axios.patch(`${DRIVE_UPLOAD_URL}/${created.id}`, blob, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
    },
    params: { uploadType: "media", fields: "headRevisionId" },
  });
  return { fileId: created.id, headRevisionId: updated.headRevisionId };
};

const updateVaultFile = async (accessToken, fileId, blob) => {
  const { data } = await axios.patch(`${DRIVE_UPLOAD_URL}/${fileId}`, blob, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/octet-stream",
    },
    params: { uploadType: "media", fields: "headRevisionId" },
  });
  return { fileId, headRevisionId: data.headRevisionId };
};

module.exports = {
  exchangeAuthCodeForTokens,
  getAccessTokenFromRefreshToken,
  findVaultFile,
  getVaultFileContent,
  createVaultFile,
  updateVaultFile,
};
