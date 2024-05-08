const { errorLogger } = require("../utilities/logger");

const getAllBannerQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrId" as "bannerId",
            "wrBannerType" as "bannerType",
            "wrTitle" as "title",
            "wrImage" as "image",
            "wrIsActive" as "isActive",
            "wrIsPermanent" as "isPermanent",
            "wrStartDate" as "startDate",
            "wrEndDate" as "endDate",
            "wrLink" as "link",
            "wrViewerCount" as "viewerCount"
        from "tblBanner"
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};
const insertBannerQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                with insert_data as (
                    insert into "tblBanner" (
                        "wrTitle",
                        "wrBannerType",
                        "wrImage",
                        "wrIsActive",
                        "wrIsPermanent",
                        "wrStartDate",
                        "wrEndDate",
                        "wrCreatedBy",
                        "wrCreatedDate",
                        "wrLink",
                        "wrViewerCount"
                    )
                values ($1, $2, $3, $4, $5, $6, $7, $8, now(), $9, $10) returning *
                )
                select 
                    "wrId" as "bannerId",
                    "wrTitle" as "title",
                    "wrBannerType" as "bannerType",
                    "wrImage" as "image",
                    "wrIsActive" as "isActive",
                    "wrIsPermanent" as "isPermanent",
                    "wrStartDate" as "startDate",
                    "wrEndDate" as "endDate",
                    "wrLink" as "link",
                    "wrViewerCount" as "viewerCount"
                from "insert_data"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.title || null,
          data.bannerType,
          data.image,
          data.isActive || false,
          data.isPermanent || false,
          data.startDate ? new Date(data.startDate) : null,
          data.endDate ? new Date(data.endDate) : null,
          data.userId,
          data.link || null,
          data.viewerCount || null
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBanner/insertBannerQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateBannerQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblBanner" set
                "wrTitle" = $1,
                "wrBannerType" = $2,
                "wrImage" = $3,
                "wrIsActive" = $4,
                "wrIsPermanent" = $5,
                "wrStartDate" = $6,
                "wrEndDate" = $7,
                "wrCreatedBy" = $8,
                "wrCreatedDate" = now(),
                "wrLink" = $10,
                "wrViewerCount" = $11
                where "wrId" = $9
            `,
      {
        bind: [
          data.title || null,
          data.bannerType,
          data.image,
          data.isActive || false,
          data.isPermanent || false,
          data.startDate,
          data.endDate,
          data.userId,
          data.bannerId,
          data.link || null,
          data.viewerCount || null
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBanner/updateBannerQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteBannerQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                delete from "tblBanner" where "wrId" = ANY ($1)
            `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [request.body.bannerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBanner/deleteBannerQuery",
      request
    );
    throw new Error(err.message);
  }
};
const activeInactiveBannerQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblBanner" set
                "wrIsActive" = $1
                where "wrId" = $2
            `,
      {
        bind: [data.isActive, data.bannerId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableBanner/activeInactiveBannerQuery",
      request
    );
    throw new Error(err.message);
  }
};
const bannerViewersCountQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblBanner" set
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
      "DB ERROR --> repository/TableBanner/bannerViewersCountQuery",
      request
    );
    throw new Error(err.message);
  }
}
module.exports = {
  insertBannerQuery,
  updateBannerQuery,
  deleteBannerQuery,
  getAllBannerQuery,
  activeInactiveBannerQuery,
  bannerViewersCountQuery
};