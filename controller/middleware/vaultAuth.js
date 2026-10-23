// Client-facing counterpart to controller/middleware/index.js's `authorize`.
// Staff sessions (tblUsers) and vault client sessions (tblClient) are
// intentionally separate token spaces (different secrets, different tables)
// so a staff JWT can never be replayed against client-only vault routes.
const jwt = require("jsonwebtoken");
const { ERROR_CODES, error, getConfigValue } = require("../../utilities/index");
const { findClientByIdQuery } = require("../../repository/TableClient");
const configConstants = require("../../utilities/configConstants");

async function authorizeClient(request, reply, fastify) {
  try {
    let token = request.headers.authorization;
    token = token?.split(" ")[1];
    const secretKey = getConfigValue(configConstants.VAULT_CLIENT_SECRET_KEY_TOKEN);

    if (!token || !secretKey) {
      throw new Error("Token Not Found");
    }

    const decode = jwt.verify(token, secretKey);
    // Purpose tokens (2FA pendingToken, verify-email, reset-password) are
    // signed with this same secret -- without this check the token issued
    // after the password step alone would work as a full session (2FA bypass).
    if (decode.purpose) {
      throw new Error("Invalid Token");
    }

    const client = await findClientByIdQuery(decode.WrClientId, fastify);
    if (!client || !client.isActive) {
      throw new Error("Invalid Token");
    }

    request.clientTokenInfo = { ...decode, ipAdress: request.ip };
  } catch (err) {
    reply.status(200).send(error(err.message, ERROR_CODES.INVALID_TOKEN, 401));
  }
}

module.exports = { authorizeClient };
