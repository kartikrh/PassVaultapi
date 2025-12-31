const { errorLogger } = require("../utilities/logger");

const getAllBannerQuery = async (fastify) => {
  
  return await fastify.db.query(
    `select 
            tb."wrId" as "bannerId",
            tb."wrBannerType" as "bannerType",
            tb."wrTitle" as "title",
            tb."wrImage" as "image",
            tb."wrIsActive" as "isActive",
            tb."wrIsPermanent" as "isPermanent",
            tb."wrStartDate" as "startDate",
            tb."wrEndDate" as "endDate",
            tb."wrLink" as "link",
            tb."wrViewerCount" as "viewerCount",
            tb."wrImagePath" as "imagePath",
            tb."wrDeviceTypeId" as "deviceTypeId",
            tb."wrWhitelabelId" as "whitelabelId",
            ed."wrValue" as "encryptWhitelabelId",
            twl."wrDomain" as "domain"
        from "tblBanner" tb
        LEFT JOIN "tblWhitelabel" twl ON tb."wrWhitelabelId" = twl."wrId"
        LEFT JOIN "tblEncryptedData" ed ON tb."wrWhitelabelId" = ed."wrKey"
        where tb."wrIsDeleted" = false
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
                        "wrViewerCount",
                        "wrImagePath",
                        "wrDeviceTypeId",
                        "wrWhitelabelId"
                    )
                values ($1, $2, $3, $4, $5, $6, $7, $8, now(), $9, $10, $11, $12, $13) returning *
                )
                select 
                    tb."wrId" as "bannerId",
                    tb."wrTitle" as "title",
                    tb."wrBannerType" as "bannerType",
                    tb."wrImage" as "image",
                    tb."wrIsActive" as "isActive",
                    tb."wrIsPermanent" as "isPermanent",
                    tb."wrStartDate" as "startDate",
                    tb."wrEndDate" as "endDate",
                    tb."wrLink" as "link",
                    tb."wrViewerCount" as "viewerCount",
                    tb."wrImagePath" as "imagePath",
                    tb."wrDeviceTypeId" as "deviceTypeId",
                    tb."wrWhitelabelId" as "whitelabelId",
                    ed."wrValue" as "encryptWhitelabelId",
                    twl."wrDomain" as "domain"
                from "insert_data" as tb
                LEFT JOIN "tblWhitelabel" twl ON tb."wrWhitelabelId" = twl."wrId"
                LEFT JOIN "tblEncryptedData" ed ON tb."wrWhitelabelId" = ed."wrKey"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.title || null,
          data.bannerType,
          data.image || null,
          data.isActive || false,
          data.isPermanent || false,
          data.startDate ? new Date(data.startDate) : null,
          data.endDate ? new Date(data.endDate) : null,
          data.userId,
          data.link || null,
          data.viewerCount || null,
          data.imagePath || null,
          data?.deviceTypeId ?? null,
          data?.whitelabelId ?? null
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
                "wrViewerCount" = $11,
                "wrImagePath" = $12,
                "wrDeviceTypeId" = $13,
                "wrWhitelabelId" = $14
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
          data.viewerCount || null,
          data.imagePath,
          data?.deviceTypeId ?? null,
          data?.whitelabelId ?? null
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
           UPDATE "tblBanner" SET
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
           WHERE "wrId" = ANY ($3)
            `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, request.body.bannerId],
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