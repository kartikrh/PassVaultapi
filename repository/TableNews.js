const { errorLogger } = require("../utilities/logger");

const getAllNewsQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrNewsId" as "newsId",
            "wrTitle" as "title",
            "wrNews" as "news",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrIsPermanent" as "isPermanent",
            "wrStartDate" as "startDate",
            "wrEndDate" as "endDate",
            "wrTags" as "tags",
            "wrViewerCount" as "viewerCount",
            "wrCredit" as "credit"
        from "tblNews"
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
                with insert_data as (
                    insert into "tblNews" (
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
                        "wrCredit"
                    )
                values ($1, $2, $3, $4, $5, $6, $7, $8, now(), $9, $10,$11) returning *
                )
                select 
                    "wrNewsId" as "newsId",
                    "wrTitle" as "title",
                    "wrNews" as "news",
                    "wrImage" as "image",
                    "wrIsActive" as "isActive",
                    "wrIsPermanent" as "isPermanent",
                    "wrStartDate" as "startDate",
                    "wrEndDate" as "endDate",
                    "wrTags" as "tags",
                    "wrViewerCount" as "viewerCount",
                    "wrCredit" as "credit"
                from "insert_data"
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
          data.credit || null
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
                "wrCredit" = $12
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
          data.credit || null
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
                delete from "tblNews" where "wrNewsId" = ANY ($1)
            `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [request.body.newsId],
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
module.exports = {
  insertNewsQuery,
  updateNewsQuery,
  deleteNewsQuery,
  getAllNewsQuery,
  activeInactiveNewsQuery,
  newsViewersCountQuery
};
