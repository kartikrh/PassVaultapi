const { errorLogger } = require("../utilities/logger");

const getAllArticlesQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrId" as "id",
            "wrTitle" as "title",
            "wrArticle" as article,
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrIsPermanent" as "isPermanent",
            "wrStartDate" as "startDate",
            "wrEndDate" as "endDate",
            "wrTags" as "tags",
            "wrViewerCount" as "viewerCount",
            "wrCredit" as "credit",
            "wrSEO" as "SEO",
            "wrSEODescription" as "SEODescription",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy",
            "wrModifyDate" as "modifyDate",
            "wrModifyBy" as "modifyBy"
        from "tblArticles"
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertArticleQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                with insert_data as (
                    insert into "tblArticles" (
                        "wrTitle",
                        "wrArticle",
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
                        "wrSEODescription"
                    )
                values ($1, $2, $3, $4, $5, $6, $7, $8, now(), $9, $10, $11, $12, $13) returning *
                )
                select 
                    "wrId" as "id",
                    "wrTitle" as "title",
                    "wrArticle" as article,
                    "wrImage" as "image",
                    "wrIsActive" as "isActive",
                    "wrIsPermanent" as "isPermanent",
                    "wrStartDate" as "startDate",
                    "wrEndDate" as "endDate",
                    "wrTags" as "tags",
                    "wrViewerCount" as "viewerCount",
                    "wrCredit" as "credit",
                    "wrSEO" as "SEO",
                    "wrSEODescription" as "SEODescription",
                    "wrCreatedDate" as "createdDate",
                    "wrCreatedBy" as "createdBy",
                    "wrModifyDate" as "modifyDate",
                    "wrModifyBy" as "modifyBy"
                from "insert_data"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.title,
          data.article,
          data.image || null,
          data.isActive || false,
          data.isPermanent || false,
          data.startDate ? new Date(data.startDate) : null,
          data.endDate ? new Date(data.endDate) : null,
          data.userId,
          data.tags || null,
          data.viewerCount || null,
          data.credit || null,
          data.SEO || null,
          data.SEODescription || null,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableArticles/insertArticleQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateArticleQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
          UPDATE "tblArticles" SET 
            "wrTitle" = $1,
            "wrArticle" = $2,
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
            "wrSEODescription" = $14
          WHERE "wrId" = $9
          RETURNING
            "wrId" as "id",
            "wrTitle" as "title",
            "wrArticle" as article,
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrIsPermanent" as "isPermanent",
            "wrStartDate" as "startDate",
            "wrEndDate" as "endDate",
            "wrTags" as "tags",
            "wrViewerCount" as "viewerCount",
            "wrCredit" as "credit",
            "wrSEO" as "SEO",
            "wrSEODescription" as "SEODescription",
            "wrCreatedDate" as "createdDate",
            "wrCreatedBy" as "createdBy",
            "wrModifyDate" as "modifyDate",
            "wrModifyBy" as "modifyBy"
        `,
      {
        bind: [
          data.title,
          data.article,
          data.image || null,
          data.isActive || false,
          data.isPermanent || false,
          data.startDate,
          data.endDate,
          data.userId,
          data.id,
          data.tags,
          data.viewerCount || null,
          data.credit || null,
          data.SEO || null,
          data.SEODescription || null,
        ],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableArticles/updateArticleQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteArticleQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
        delete from "tblArticles" where "wrId" = ANY ($1)
        `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [request.body.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableArticles/deleteArticleQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveArticleQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
        update "tblArticles" set
        "wrIsActive" = $1,
        "wrModifyBy" = $2,
        "wrModifyDate" = now()
        where "wrId" = $3
        `,
      {
        bind: [data.isActive, data.userId, data.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableArticles/activeInactiveArticleQuery",
      request
    );
    throw new Error(err.message);
  }
};
const articleViewersCountQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
            update "tblArticles" set
            "wrViewerCount" = COALESCE("wrViewerCount", 0) + 1
            where "wrId" = $1
        `,
      {
        bind: [data.refId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableArticles/articleViewersCountQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  insertArticleQuery,
  updateArticleQuery,
  deleteArticleQuery,
  getAllArticlesQuery,
  activeInactiveArticleQuery,
  articleViewersCountQuery,
};
