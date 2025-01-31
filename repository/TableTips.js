const { errorLogger } = require("../utilities/logger");

const getAllTipsQuery = async (fastify) => {
  const result = await fastify.db.query(
    `SELECT 
          tt."wrId" AS "id",
          tt."wrCommentaryId" AS "commentaryId",
          tt."wrEventRefId" AS "eventRefId",
          tt."wrTipsRefId" AS "tipsRefId",
          tt."wrTips" AS "tips",
          tt."wrIsActive" AS "isActive",
          tt."wrStartDate" AS "startDate",
          tt."wrEndDate" AS "endDate",
          tt."wrCreatedBy" AS "createdBy",
          tt."wrCreatedAt" AS "createdAt"
      FROM "tblTips" AS tt
      LEFT JOIN "tblCommentaries" AS tc1 
          ON tc1."wrCommentaryId" = tt."wrCommentaryId" 
          AND tc1."wrIsDelete" = FALSE
          AND (tc1."wrCommentaryStatus" IS NULL OR tc1."wrCommentaryStatus" <> 4)
      LEFT JOIN "tblCommentaries" AS tc2 
          ON tc2."wrEventRefId" = tt."wrEventRefId" 
          AND tc2."wrIsDelete" = FALSE
          AND (tc2."wrCommentaryStatus" IS NULL OR tc2."wrCommentaryStatus" <> 4)
      WHERE tt."wrIsActive" = TRUE 
      AND tt."wrIsDeleted" = FALSE
      AND (
          (tt."wrCommentaryId" IS NOT NULL AND tc1."wrCommentaryId" IS NOT NULL) OR
          (tt."wrEventRefId" IS NOT NULL AND tc2."wrEventRefId" IS NOT NULL)
      );`,
    { type: fastify.db.QueryTypes.SELECT }
  );
  return result;
};

const allCommentaryTipsQuery = async (fastify, request) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
        "wrId" as "id",
        "wrCommentaryId" as "commentaryId",
        "wrEventRefId" as "eventRefId",
        "wrTipsRefId" as "tipsRefId",
        "wrTips" as "tips",
        "wrIsActive" as "isActive",
        "wrStartDate" as "startDate",
        "wrEndDate" as "endDate",
        "wrCreatedBy" as "createdBy",
        "wrCreatedAt" as "createdAt"
     FROM "tblTips"
     WHERE "wrIsDeleted" = FALSE;`
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/allCommentaryTipsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const commentaryTipsByIdQuery = async (id, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
        "wrId" as "id",
        "wrCommentaryId" as "commentaryId",
        "wrEventRefId" as "eventRefId",
        "wrTipsRefId" as "tipsRefId",
        "wrTips" as "tips",
        "wrIsActive" as "isActive",
        "wrStartDate" as "startDate",
        "wrEndDate" as "endDate",
        "wrCreatedBy" as "createdBy",
        "wrCreatedAt" as "createdAt"
     FROM "tblTips"
     WHERE "wrIsDeleted" = FALSE AND "wrId" = $1;`,
     {
      type: fastify.db.QueryTypes.SELECT,
      bind: [id],
    }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/allCommentaryTipsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertTipsQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
            INSERT INTO "tblTips" (
            "wrCommentaryId", "wrEventRefId", "wrTipsRefId", "wrTips", "wrIsActive", "wrStartDate",
            "wrEndDate", "wrCreatedBy", "wrCreatedAt"
            ) 
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, now()
            ) 
            RETURNING *
            )        
            SELECT 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrEventRefId" as "eventRefId",
                "wrTipsRefId" as "tipsRefId",
                "wrTips" as "tips",
                "wrIsActive" as "isActive",
                "wrStartDate" as "startDate",
                "wrEndDate" as "endDate",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt"
            FROM insert_data;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.commentaryId || null,
          data.eventRefId || null,
          data.tipsRefId,
          data.tips,
          data.isActive || false,
          data.startDate || null,
          data.endDate || null,
          request?.userTokenInfo?.WrUserId === undefined ||
          request?.userTokenInfo?.WrUserId === null
            ? 0
            : request.userTokenInfo.WrUserId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    console.log("error", err);
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/insertTipsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateTipsQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblTips" SET 
            "wrCommentaryId" = $1,
            "wrEventRefId" = $2,
            "wrTipsRefId" = $3,
            "wrTips" = $4,
            "wrIsActive" = $5,
            "wrStartDate" = $6,
            "wrEndDate" = $7
            WHERE "wrId" = $8
            RETURNING 
                "wrId" as "id",
                "wrCommentaryId" as "commentaryId",
                "wrEventRefId" as "eventRefId",
                "wrTipsRefId" as "tipsRefId",
                "wrTips" as "tips",
                "wrIsActive" as "isActive",
                "wrStartDate" as "startDate",
                "wrEndDate" as "endDate",
                "wrCreatedBy" as "createdBy",
                "wrCreatedAt" as "createdAt";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.commentaryId,
          data.eventRefId,
          data.tipsRefId,
          data.tips,
          data.isActive || false,
          data.startDate,
          data.endDate,
          data.id,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/updateTipsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteTipsQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTips" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      WHERE "wrId" = ANY($3);`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/deleteTipsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveTipsQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblTips" SET
        "wrIsActive" = $1
        WHERE "wrId" = $2
        RETURNING 
          "wrId" as "id",
          "wrCommentaryId" as "commentaryId",
          "wrEventRefId" as "eventRefId",
          "wrTipsRefId" as "tipsRefId",
          "wrTips" as "tips",
          "wrIsActive" as "isActive",
          "wrStartDate" as "startDate",
          "wrEndDate" as "endDate",
          "wrCreatedBy" as "createdBy",
          "wrCreatedAt" as "createdAt";`,
      {
        bind: [data.isActive, data.id],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/activeInactiveTipsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const getCommentaryStatusQuery = async (
  whereCondition = null,
  fastify,
  request
) => {
  try {
    const result = await fastify.db.query(
      `SELECT 
            "wrCommentaryId" AS "commentaryId",
            "wrEventRefId" AS "eventRefId",
            "wrCommentaryStatus" AS "commentaryStatus"
        FROM "tblCommentaries"
        ${whereCondition ? `WHERE ${whereCondition}` : ""};`,
      { type: fastify.db.QueryTypes.SELECT }
    );
    return result[0];
  } catch (err) {
    console.log("errorrrrrr", err);
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/getCommentaryStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};


const deleteTipsByCommentaryIdQuery = async (commentaryId, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblTips" SET
          "wrIsDeleted" = $1,
          "wrDeletedBy" = $2,
          "wrDeletedAt" = now()
      WHERE "wrCommentaryId" = $3;`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, commentaryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTips.js/deleteTipsByCommentaryIdQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllTipsQuery,
  allCommentaryTipsQuery,
  commentaryTipsByIdQuery,
  insertTipsQuery,
  updateTipsQuery,
  deleteTipsQuery,
  activeInactiveTipsQuery,
  getCommentaryStatusQuery,
  deleteTipsByCommentaryIdQuery,
};
