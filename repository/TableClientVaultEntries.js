// Opaque per-entry ledger backing quota enforcement (see technical spec section 2,
// "why a ledger table, not just a counter"). Wiring this into /vault/data PUT is
// Phase 02 (Drive integration); these queries are ready for that phase to consume.
const { errorLogger } = require("../utilities/logger");

const countActiveEntriesByTypeQuery = async (clientId, entryType, fastify) => {
  try {
    const result = await fastify.db.query(
      `SELECT COUNT(*)::int as "count" FROM "tblClientVaultEntries"
       WHERE "wrClientId" = $1 AND "wrEntryType" = $2 AND "wrIsDeleted" = false`,
      { type: fastify.db.QueryTypes.SELECT, bind: [clientId, entryType] }
    );
    return result[0]?.count || 0;
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultEntries/countActiveEntriesByTypeQuery");
    throw new Error(err.message);
  }
};

const upsertEntryQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblClientVaultEntries" ("wrEntryId", "wrClientId", "wrEntryType")
       VALUES ($1, $2, $3)
       ON CONFLICT ("wrEntryId") DO UPDATE SET "wrUpdatedAt" = now()
       RETURNING "wrEntryId" as "entryId", "wrClientId" as "clientId", "wrEntryType" as "entryType"`,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [data.entryId, data.clientId, data.entryType],
      }
    );
    return result[0][0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultEntries/upsertEntryQuery");
    throw new Error(err.message);
  }
};

const softDeleteEntryQuery = async (entryId, clientId, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblClientVaultEntries" SET "wrIsDeleted" = true, "wrUpdatedAt" = now()
       WHERE "wrEntryId" = $1 AND "wrClientId" = $2`,
      { type: fastify.db.QueryTypes.UPDATE, bind: [entryId, clientId] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TableClientVaultEntries/softDeleteEntryQuery");
    throw new Error(err.message);
  }
};

module.exports = {
  countActiveEntriesByTypeQuery,
  upsertEntryQuery,
  softDeleteEntryQuery,
};
