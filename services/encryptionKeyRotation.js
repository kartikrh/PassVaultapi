// Rotates configConstants.ENCRYPTION_KEY (tblConfigs "APPENCRYPTIONKEY") --
// the AES-256-ECB key used throughout utilities/index.js encrypt()/decrypt().
// This key protects data in 4 different tables (listed below), all of which
// must be decrypted with the OLD key and re-encrypted with the NEW key in
// the same all-or-nothing transaction, or staff/vault-client logins and
// every whitelabel/mail/drive secret break the moment the config changes.
//
// Gated on the same LOADDATAPASSWORD config the Config screen's reveal-eye
// and "reload data" actions use.
const crypto = require("crypto");
const configConstants = require("../utilities/configConstants");

const ALGORITHM = "aes-256-ecb";

const toKeyBuffer = (str) => {
  const buf = Buffer.alloc(32);
  buf.write(str, "utf-8");
  return buf;
};

const encryptWith = (input, keyBuffer) => {
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, Buffer.alloc(0));
  let encrypted = cipher.update(input, "utf-8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decryptWith = (encrypted, keyBuffer) => {
  const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, Buffer.alloc(0));
  let decrypted = decipher.update(encrypted, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};

const rotateEncryptionKeyService = async (request, fastify) => {
  const { newKey, password } = request.body || {};
  if (!newKey || typeof newKey !== "string" || !newKey.trim()) {
    throw new Error("A new key value is required");
  }

  const loadDataPassword = global.tblConfigs.find(
    (item) => item.key === configConstants.LOADDATAPASSWORD
  )?.value;
  if (!loadDataPassword || password !== loadDataPassword) {
    throw new Error("Invalid password");
  }

  const oldKeyValue = global.tblConfigs.find(
    (item) => item.key === configConstants.ENCRYPTION_KEY
  )?.value;
  if (!oldKeyValue) {
    throw new Error(`Current encryption key config ("${configConstants.ENCRYPTION_KEY}") is not set`);
  }
  if (newKey === oldKeyValue) {
    throw new Error("New key is the same as the current key");
  }

  const oldKey = toKeyBuffer(oldKeyValue);
  const newKeyBuffer = toKeyBuffer(newKey);
  const reencrypt = (value) => {
    if (!value) return value;
    return encryptWith(decryptWith(value, oldKey), newKeyBuffer);
  };

  await fastify.db.transaction(async (t) => {
    // 1. Staff panel passwords + TOTP secrets (tblUsers)
    const users = await fastify.db.query(
      `SELECT "WrUserId", "WrPassword", "WrUuid" FROM "tblUsers" WHERE "WrIsDelete" = false`,
      { type: fastify.db.QueryTypes.SELECT, transaction: t }
    );
    for (const u of users) {
      await fastify.db.query(
        `UPDATE "tblUsers" SET "WrPassword" = $1, "WrUuid" = $2 WHERE "WrUserId" = $3`,
        {
          type: fastify.db.QueryTypes.UPDATE,
          bind: [reencrypt(u.WrPassword), reencrypt(u.WrUuid), u.WrUserId],
          transaction: t,
        }
      );
    }

    // 2. Mail Settings SMTP passwords (tblMailSettings)
    const mailSettings = await fastify.db.query(
      `SELECT "wrId", "wrPassword" FROM "tblMailSettings" WHERE "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, transaction: t }
    );
    for (const m of mailSettings) {
      await fastify.db.query(
        `UPDATE "tblMailSettings" SET "wrPassword" = $1 WHERE "wrId" = $2`,
        {
          type: fastify.db.QueryTypes.UPDATE,
          bind: [reencrypt(m.wrPassword), m.wrId],
          transaction: t,
        }
      );
    }

    // 3. White Label Google OAuth + reCAPTCHA secrets (tblWhitelabel)
    const whitelabels = await fastify.db.query(
      `SELECT "wrId", "wrGoogle_Secret", "wrRecatchSecret" FROM "tblWhitelabel" WHERE "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, transaction: t }
    );
    for (const w of whitelabels) {
      await fastify.db.query(
        `UPDATE "tblWhitelabel" SET "wrGoogle_Secret" = $1, "wrRecatchSecret" = $2 WHERE "wrId" = $3`,
        {
          type: fastify.db.QueryTypes.UPDATE,
          bind: [reencrypt(w.wrGoogle_Secret), reencrypt(w.wrRecatchSecret), w.wrId],
          transaction: t,
        }
      );
    }

    // 4. Vault client Drive refresh tokens + TOTP secrets (tblClient)
    const clients = await fastify.db.query(
      `SELECT "wrClientId", "wrDriveRefreshToken", "WrUuid" FROM "tblClient" WHERE "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, transaction: t }
    );
    for (const c of clients) {
      await fastify.db.query(
        `UPDATE "tblClient" SET "wrDriveRefreshToken" = $1, "WrUuid" = $2 WHERE "wrClientId" = $3`,
        {
          type: fastify.db.QueryTypes.UPDATE,
          bind: [reencrypt(c.wrDriveRefreshToken), reencrypt(c.WrUuid), c.wrClientId],
          transaction: t,
        }
      );
    }

    // 5. The config value itself, last -- so if anything above throws, the
    // whole transaction (including this) rolls back and the old key stays
    // in place and still matches everything on disk.
    await fastify.db.query(
      `UPDATE "tblConfigs" SET "wrValue" = $1, "wrModifiedDate" = now() WHERE "wrKey" = $2 AND "wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [newKey, configConstants.ENCRYPTION_KEY],
        transaction: t,
      }
    );
  });

  // Update the in-memory cache too, so encrypt()/decrypt() (which always
  // read global.tblConfigs live) are correct immediately -- closes the
  // window where a login between "DB committed" and "API restarted" would
  // otherwise hash against the wrong key. A restart is still recommended
  // as a safety net for any other in-memory state this rotation didn't
  // account for.
  const configEntry = global.tblConfigs.find((item) => item.key === configConstants.ENCRYPTION_KEY);
  if (configEntry) configEntry.value = newKey;

  return {
    rotated: true,
    message: "Encryption key rotated successfully. Please restart PassVaultapi to ensure all state is fully consistent.",
  };
};

module.exports = {
  rotateEncryptionKeyService,
};
