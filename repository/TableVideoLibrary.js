const { errorLogger } = require("../utilities/logger");

const getAllVideoLibraryQuery = async (fastify) => {
  return fastify.db.query(
    `
    SELECT 
      tvb."wrId" AS "id",
      tvb."wrTitle" AS "title",
      tvb."wrIsPermanent" AS "isPermanent",
      tvb."wrFrom" AS "from",
      tvb."wrTo" AS "to",
      tvb."wrTag" AS "tag",
      tvb."wrSEO" AS "SEO",
      tvb."wrDescription" AS "description",
      tvb."wrVideo" AS "video",
      tvb."wrVideoURL" AS "videoURL",
      tvb."wrType" AS "type",
      tvb."wrCommentaryId" AS "commentaryId",
      tvb."wrVideoPath" AS "videoPath",
      tvb."wrIsActive" AS "isActive",
      tvb."wrDisplayOrder" as "displayOrder",
      tvb."wrWhitelabelId" as "whitelabelId",
      ed."wrValue" as "encryptWhitelabelId",
      twl."wrDomain" as "domain",
      tvb."wrViewCount" as "viewCount",
      COALESCE(lc."likeCount", 0) AS "likeCount",
      COALESCE(lc."dislikeCount", 0) AS "dislikeCount"
    FROM "tblVideoLibrary" as tvb
    LEFT JOIN "tblWhitelabel" twl ON tvb."wrWhitelabelId" = twl."wrId"
    LEFT JOIN "tblEncryptedData" ed ON tvb."wrWhitelabelId" = ed."wrKey"
    LEFT JOIN (
      SELECT
        t."wrRefId",
        COUNT(*) FILTER (WHERE t."wrIsLike" = true)::int AS "likeCount",
        COUNT(*) FILTER (WHERE t."wrIsLike" = false)::int AS "dislikeCount"
      FROM "tblClientLikeDislikeActivity" t
      WHERE t."wrType" = 1
      GROUP BY t."wrRefId"
    ) lc ON lc."wrRefId" = tvb."wrId"
    `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertVideoLibraryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
              INSERT INTO "tblVideoLibrary" (
              "wrTitle", "wrIsPermanent", "wrFrom", "wrTo", "wrTag",
              "wrSEO", "wrDescription", "wrVideo", "wrVideoURL", "wrType", "wrCommentaryId", "wrVideoPath", "wrIsActive",
              "wrDisplayOrder", "wrWhitelabelId"
              ) 
              VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                  (SELECT COALESCE((SELECT MAX("wrDisplayOrder") FROM "tblVideoLibrary"),0) + 1),
                  $14
              ) 
              RETURNING *
              )        
              SELECT 
                tvb."wrId" AS "id",
                tvb."wrTitle" AS "title",
                tvb."wrIsPermanent" AS "isPermanent",
                tvb."wrFrom" AS "from",
                tvb."wrTo" AS "to",
                tvb."wrTag" AS "tag",
                tvb."wrSEO" AS "SEO",
                tvb."wrDescription" AS "description",
                tvb."wrVideo" AS "video",
                tvb."wrVideoURL" AS "videoURL",
                tvb."wrType" AS "type",
                tvb."wrCommentaryId" AS "commentaryId",
                tvb."wrVideoPath" AS "videoPath",
                tvb."wrIsActive" AS "isActive",
                tvb."wrDisplayOrder" as "displayOrder",
                tvb."wrWhitelabelId" as "whitelabelId",
                ed."wrValue" as "encryptWhitelabelId",
                twl."wrDomain" as "domain",
                tvb."wrViewCount" as "viewCount",
                COALESCE(lc."likeCount", 0) AS "likeCount",
                COALESCE(lc."dislikeCount", 0) AS "dislikeCount"
              FROM insert_data as tvb
              LEFT JOIN "tblWhitelabel" twl ON tvb."wrWhitelabelId" = twl."wrId"
              LEFT JOIN "tblEncryptedData" ed ON tvb."wrWhitelabelId" = ed."wrKey"
              LEFT JOIN (
                SELECT
                  t."wrRefId",
                  COUNT(*) FILTER (WHERE t."wrIsLike" = true)::int AS "likeCount",
                  COUNT(*) FILTER (WHERE t."wrIsLike" = false)::int AS "dislikeCount"
                FROM "tblClientLikeDislikeActivity" t
                WHERE t."wrType" = 1
                GROUP BY t."wrRefId"
              ) lc ON lc."wrRefId" = tvb."wrId";`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.title,
          data.isPermanent || false,
          data.from || null,
          data.to || null,
          data.tag,
          data.SEO,
          data.description,
          data.video || null,
          data.videoURL || null,
          data.type,
          data.commentaryId || 0,
          data.videoPath || null,
          data.isActive || false,
          data.whitelabelId || null,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVideoLibrary.js/insertVideoLibraryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateVideoLibraryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH updated AS (
        UPDATE "tblVideoLibrary" AS tvb
        SET 
          "wrTitle" = $1,
          "wrIsPermanent" = $2,
          "wrFrom" = $3,
          "wrTo" = $4,
          "wrTag" = $5,
          "wrSEO" = $6,
          "wrDescription" = $7,
          "wrVideo" = $8,
          "wrVideoURL" = $9,
          "wrType" = $10,
          "wrCommentaryId" = $11,
          "wrVideoPath" = $13,
          "wrIsActive" = $14,
          "wrWhitelabelId" = $15
        WHERE "wrId" = $12
        RETURNING *
      )

      SELECT 
        u."wrId" AS "id",
        u."wrTitle" AS "title",
        u."wrIsPermanent" AS "isPermanent",
        u."wrFrom" AS "from",
        u."wrTo" AS "to",
        u."wrTag" AS "tag",
        u."wrSEO" AS "SEO",
        u."wrDescription" AS "description",
        u."wrVideo" AS "video",
        u."wrVideoURL" AS "videoURL",
        u."wrType" AS "type",
        u."wrCommentaryId" AS "commentaryId",
        u."wrVideoPath" AS "videoPath",
        u."wrIsActive" AS "isActive",
        u."wrDisplayOrder" AS "displayOrder",
        u."wrWhitelabelId" AS "whitelabelId",
        ed."wrValue" AS "encryptWhitelabelId",
        twl."wrDomain" AS "domain",
        u."wrViewCount" AS "viewCount",
        lc."likeCount",
        lc."dislikeCount"
      FROM updated u
      LEFT JOIN "tblWhitelabel" twl 
        ON u."wrWhitelabelId" = twl."wrId"
      LEFT JOIN "tblEncryptedData" ed 
        ON u."wrWhitelabelId" = ed."wrKey"
      LEFT JOIN (
        SELECT
          t."wrRefId",
          COUNT(*) FILTER (WHERE t."wrIsLike" = true)::int AS "likeCount",
          COUNT(*) FILTER (WHERE t."wrIsLike" = false)::int AS "dislikeCount"
        FROM "tblClientLikeDislikeActivity" t
        WHERE t."wrType" = 1
        GROUP BY t."wrRefId"
      ) lc 
        ON lc."wrRefId" = u."wrId";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
            data.title,
            data.isPermanent || false,
            data.from || null,
            data.to || null,
            data.tag,
            data.SEO,
            data.description,
            data.video || null,
            data.videoURL || null,
            data.type,
            data.commentaryId || 0,
            data.id,
            data.videoPath,
            data.isActive || false,
            data.whitelabelId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVideoLibrary.js/updateVideoLibraryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteVideoLibraryQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblVideoLibrary" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
        where "wrId" = ANY ($3)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVideoLibrary.js/deleteVideoLibraryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateVideoLibraryStatusQuery = async (body, fastify, request) => {
  try {
    const { id, isActive } = body;
    const result = await fastify.db.query(
      `UPDATE "tblVideoLibrary"
       SET "wrIsActive" = $1
       WHERE "wrId" = $2
       RETURNING
         "wrId" AS "id",
         "wrTitle" AS "title",
         "wrIsActive" AS "isActive"`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [isActive, id],
      }
    );
    return result;
  } catch (err) {
    const { errorLogger } = require("../utilities/logger");
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVideoLibrary.js/updateVideoLibraryStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateDisplayOrder = async (body, request, fastify) => {
  try {
    return await fastify.db.query(
      `update "tblVideoLibrary" set "wrDisplayOrder" = $1 where "wrId" = $2 `,
      {
        bind: [body.displayOrder, body.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVideoLibrary.js/updateDisplayOrder",
      request
    );
    throw new Error(err.message);
  }
}

const updateVideoLibraryViewCountQuery = async (body, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblVideoLibrary" SET
        "wrViewCount" = COALESCE("wrViewCount", 0) + 1
      WHERE "wrId" = $1 `,
      {
        bind: [body.refId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVideoLibrary.js/updateVideoLibraryViewCountQuery",
      request
    );
    throw new Error(err.message);
  }
}

module.exports = {
  getAllVideoLibraryQuery,
  insertVideoLibraryQuery,
  updateVideoLibraryQuery,
  deleteVideoLibraryQuery,
  updateVideoLibraryStatusQuery,
  updateDisplayOrder,
  updateVideoLibraryViewCountQuery
};
