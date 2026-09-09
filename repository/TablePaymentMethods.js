const { errorLogger } = require("../utilities/logger");

const PAYMENT_METHOD_SELECT_COLUMNS = `
  "wrId" as "id",
  "wrType" as "type",
  "wrLabel" as "label",
  "wrQrImageUrl" as "qrImageUrl",
  "wrUpiId" as "upiId",
  "wrBankName" as "bankName",
  "wrAccountHolderName" as "accountHolderName",
  "wrAccountNumber" as "accountNumber",
  "wrIfscCode" as "ifscCode",
  "wrBranch" as "branch",
  "wrInstructions" as "instructions",
  "wrIsActive" as "isActive",
  "wrIsDefault" as "isDefault",
  "wrCreatedAt" as "createdAt",
  "wrCreatedBy" as "createdBy",
  "wrUpdatedBy" as "updatedBy",
  "wrUpdatedAt" as "updatedAt"
`;

const getAllPaymentMethodsQuery = async (fastify) => {
  try {
    return await fastify.db.query(
      `SELECT ${PAYMENT_METHOD_SELECT_COLUMNS} FROM "tblPaymentMethods" WHERE "wrIsDeleted" = FALSE;`,
      { type: fastify.db.QueryTypes.SELECT }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePaymentMethods.js/getAllPaymentMethodsQuery", null);
    throw new Error(err.message);
  }
};

const insertPaymentMethodQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `INSERT INTO "tblPaymentMethods" (
        "wrType", "wrLabel", "wrQrImageUrl", "wrUpiId", "wrBankName", "wrAccountHolderName",
        "wrAccountNumber", "wrIfscCode", "wrBranch", "wrInstructions", "wrIsActive", "wrIsDefault",
        "wrCreatedAt", "wrCreatedBy"
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13)
      RETURNING ${PAYMENT_METHOD_SELECT_COLUMNS};`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.type,
          data.label,
          data.qrImageUrl ?? null,
          data.upiId ?? null,
          data.bankName ?? null,
          data.accountHolderName ?? null,
          data.accountNumber ?? null,
          data.ifscCode ?? null,
          data.branch ?? null,
          data.instructions ?? null,
          data.isActive ?? true,
          data.isDefault ?? false,
          request.userTokenInfo.WrUserId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePaymentMethods.js/insertPaymentMethodQuery", request);
    throw new Error(err.message);
  }
};

const updatePaymentMethodQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblPaymentMethods" SET
        "wrType" = $1,
        "wrLabel" = $2,
        "wrQrImageUrl" = $3,
        "wrUpiId" = $4,
        "wrBankName" = $5,
        "wrAccountHolderName" = $6,
        "wrAccountNumber" = $7,
        "wrIfscCode" = $8,
        "wrBranch" = $9,
        "wrInstructions" = $10,
        "wrIsActive" = $11,
        "wrIsDefault" = $12,
        "wrUpdatedBy" = $13,
        "wrUpdatedAt" = now()
      WHERE "wrId" = $14
      RETURNING ${PAYMENT_METHOD_SELECT_COLUMNS};`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.type,
          data.label,
          data.qrImageUrl ?? null,
          data.upiId ?? null,
          data.bankName ?? null,
          data.accountHolderName ?? null,
          data.accountNumber ?? null,
          data.ifscCode ?? null,
          data.branch ?? null,
          data.instructions ?? null,
          data.isActive,
          data.isDefault,
          request.userTokenInfo.WrUserId,
          data.id,
        ],
      }
    );
    // type: QueryTypes.UPDATE + RETURNING gives back [rows, metadata] here
    // (same as TablePackages.js's updatePackagesQuery) -- unwrap to the
    // single updated row rather than pushing that footgun into every caller.
    return result[0]?.[0];
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePaymentMethods.js/updatePaymentMethodQuery", request);
    throw new Error(err.message);
  }
};

const deletePaymentMethodQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblPaymentMethods" SET
        "wrIsDeleted" = $1,
        "wrDeletedBy" = $2,
        "wrDeletedAt" = now()
      WHERE "wrId" = ANY ($3)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, id],
      }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePaymentMethods.js/deletePaymentMethodQuery", request);
    throw new Error(err.message);
  }
};

const activeInactivePaymentMethodQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblPaymentMethods" SET "wrIsActive" = $1 WHERE "wrId" = $2`,
      { bind: [data.isActive, data.id] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePaymentMethods.js/activeInactivePaymentMethodQuery", request);
    throw new Error(err.message);
  }
};

const isDefaultChangeQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblPaymentMethods" SET "wrIsDefault" = $1 WHERE "wrId" = $2`,
      { bind: [data.isDefault, data.id] }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePaymentMethods.js/isDefaultChangeQuery", request);
    throw new Error(err.message);
  }
};

// Unsets every other row's default flag -- copied verbatim from
// TablePackages.js's isDefaultFalseQuery, same "only one default at a time"
// pattern.
const isDefaultFalseQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblPaymentMethods" SET "wrIsDefault" = $1
       WHERE "wrId" != $2
       AND "wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [false, id],
      }
    );
  } catch (err) {
    errorLogger(fastify, err.message, "DB ERROR --> repository/TablePaymentMethods.js/isDefaultFalseQuery", request);
    throw new Error(err.message);
  }
};

module.exports = {
  getAllPaymentMethodsQuery,
  insertPaymentMethodQuery,
  updatePaymentMethodQuery,
  deletePaymentMethodQuery,
  activeInactivePaymentMethodQuery,
  isDefaultChangeQuery,
  isDefaultFalseQuery,
};
