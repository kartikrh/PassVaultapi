const { newsType } = require("../utilities");
const { errorLogger } = require("../utilities/logger");
const getAllNewsQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
            tn."wrNewsId" as "newsId",
            tn."wrTitle" as "title",
            tn."wrNews" as "news",
            tn."wrImage" as "image",
            tn."wrIsActive" as "isActive",
            tn."wrIsPermanent" as "isPermanent",
            tn."wrStartDate" as "startDate",
            tn."wrEndDate" as "endDate",
            tn."wrTags" as "tags",
            tn."wrViewerCount" as "viewerCount",
            tn."wrCredit" as "credit",
            tn."wrSEO" as "SEO",
            tn."wrType" as "type",
            tn."wrSEODescription" as "SEODescription",
            tn."wrImagePath" as "imagePath",
            tn."wrDisplayOrder" as "displayOrder",
            tn."wrWhitelabelId" as "whitelabelId",
            ed."wrValue" as "encryptWhitelabelId",
            twl."wrDomain" as "domain",
            tn."wrCommentaryId" as "commentaryId"
        FROM "tblNews" as tn
        LEFT JOIN "tblWhitelabel" twl 
            ON tn."wrWhitelabelId" = twl."wrId"
        LEFT JOIN "tblEncryptedData" ed 
            ON tn."wrWhitelabelId" = ed."wrKey"
        WHERE tn."wrIsDeleted" = false
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const insertNewsQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
      WITH insert_data AS (
        INSERT INTO "tblNews" (
          "wrTitle",
          "wrNews",
          "wrImage",
          "wrIsActive",
          "wrIsPermanent",
          "wrStartDate",
          "wrEndDate",
          "wrCreatedBy",
          "wrCreatedDate",
          "wrTags",
          "wrViewerCount",
          "wrCredit",
          "wrSEO",
          "wrSEODescription",
          "wrType",
          "wrImagePath",
          "wrWhitelabelId",
          "wrDisplayOrder",
          "wrCommentaryId"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, now(),
          $9, $10, $11, $12, $13, $14, $15, $16,
          (SELECT COALESCE(MAX("wrDisplayOrder"), 0) + 1 FROM "tblNews" WHERE "wrIsDeleted" = false),
          $17
        )
        RETURNING *
      )
      SELECT 
        tn."wrNewsId" as "newsId",
        tn."wrTitle" as "title",
        tn."wrNews" as "news",
        tn."wrImage" as "image",
        tn."wrIsActive" as "isActive",
        tn."wrIsPermanent" as "isPermanent",
        tn."wrStartDate" as "startDate",
        tn."wrEndDate" as "endDate",
        tn."wrTags" as "tags",
        tn."wrViewerCount" as "viewerCount",
        tn."wrCredit" as "credit",
        tn."wrSEO" as "SEO",
        tn."wrSEODescription" as "SEODescription",
        tn."wrType" as "type",
        tn."wrImagePath" as "imagePath",
        tn."wrWhitelabelId" as "whitelabelId",
        tn."wrDisplayOrder" as "displayOrder",
        ed."wrValue" as "encryptWhitelabelId",
        twl."wrDomain" as "domain",
        tn."wrCommentaryId" as "commentaryId"
      FROM insert_data tn
      LEFT JOIN "tblWhitelabel" twl 
        ON tn."wrWhitelabelId" = twl."wrId"
      LEFT JOIN "tblEncryptedData" ed 
        ON tn."wrWhitelabelId" = ed."wrKey"
      `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.title,
          data.news,
          data.image || null,
          data.isActive || false,
          data.isPermanent || false,
          data.startDate ? new Date(data.startDate) : null,
          data.endDate ? new Date(data.endDate) : null,
          data.userId,
          data.tags,
          data.viewerCount || null,
          data.credit || null,
          data.SEO || null,
          data.SEODescription || null,
          data.type === "news"
            ? newsType.news
            : data.type === "article"
              ? newsType.article
              : Number(data.type) || newsType.news,

          data.imagePath || null,
          data.whitelabelId || null,
          data.commentaryId || null,
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableNews/insertNewsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateNewsQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
      update "tblNews" set
        "wrTitle" = $1,
        "wrNews" = $2,
        "wrImage" = $3,
        "wrIsActive" = $4,
        "wrIsPermanent" = $5,
        "wrStartDate" = $6,
        "wrEndDate" = $7,
        "wrModifyBy" = $8,
        "wrModifyDate" = now(),
        "wrTags" = $10,
        "wrViewerCount" = $11,
        "wrCredit" = $12,
        "wrSEO" = $13,
        "wrSEODescription" = $14,
        "wrType" = $15,
        "wrImagePath" = $16,
        "wrWhitelabelId" = $17,
        "wrCommentaryId" = $18
      where "wrNewsId" = $9
      `,
      {
        bind: [
          data.title,
          data.news,
          data.image || null,
          data.isActive || false,
          data.isPermanent || false,
          data.startDate,
          data.endDate,
          data.userId,
          data.newsId,
          data.tags,
          data.viewerCount || null,
          data.credit || null,
          data.SEO || null,
          data.SEODescription || null,
          data.type,
          data.imagePath,
          data.whitelabelId || null,
          data.commentaryId || null,
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableNews/updateNewsQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteNewsQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
            update "tblNews" set
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
            where "wrNewsId" = ANY ($3)
            `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, request.body.newsId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableNews/deleteNewsQuery",
      request
    );
    throw new Error(err.message);
  }
};
const activeInactiveNewsQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblNews" set
                "wrIsActive" = $1,
                "wrModifyBy" = $2,
                "wrModifyDate" = now()
                where "wrNewsId" = $3
            `,
      {
        bind: [data.isActive, data.userId, data.newsId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableNews/activeInactiveNewsQuery",
      request
    );
    throw new Error(err.message);
  }
};
const newsViewersCountQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblNews" set
                "wrViewerCount" = COALESCE("wrViewerCount", 0) + 1
                where "wrNewsId" = $1
            `,
      {
        bind: [data.refId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableNews/newsViewersCountQuery",
      request
    );
    throw new Error(err.message);
  }
}

const changeeDisplayOrderQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
      UPDATE "tblNews"
      SET "wrDisplayOrder" = $1
      WHERE "wrNewsId" = $2
      `,
      {
        bind: [data.displayOrder, data.newsId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableNews/updateDisplayOrderNewsQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  insertNewsQuery,
  updateNewsQuery,
  deleteNewsQuery,
  getAllNewsQuery,
  activeInactiveNewsQuery,
  newsViewersCountQuery,
  changeeDisplayOrderQuery
};
