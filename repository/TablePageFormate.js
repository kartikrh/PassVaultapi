const { errorLogger } = require("../utilities/logger");

const allPageFormateQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    "wrValue" as "pageFormatId",
    "wrPageFormatName" as "pageFormatName",
    "wrPageName" as "pageName",
    "wrImage" as "image",
    "wrDescription" as "description",
    "wrIsActive" as "isActive",
    "wrImagePath" as "imagePath"
    from "tblPageFormats" tb inner join "tblEncryptedData" te on tb."wrPageFormatId" = te."wrKey"
    where tb."wrIsDeleted" = false`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertPageFormateQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `with insert_data as (
                Insert into "tblPageFormats"("wrPageFormatName","wrPageName","wrImage","wrDescription","wrIsActive","wrCreatedDate","wrCreatedBy", "wrImagePath") 
                select $1,$2,$3,$4,$5,now(),$6, $7 returning *
            )
            select 
            "wrValue" as "pageFormatId",
            "wrPageFormatName" as "pageFormatName",
            "wrPageName" as "pageName",
            "wrImage" as "image",
            "wrDescription" as "description",
            "wrIsActive" as "isActive",
            "wrImagePath" as "imagePath"
             from insert_data tb inner join "tblEncryptedData" te on tb."wrPageFormatId" = te."wrKey"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.pageFormatName,
          body.pageName || null,
          body.image || null,
          body.description || null,
          body.isActive || false,
          body.userId,
          body.imagePath || null,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePageFormate/insertPageFormateQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePageFormateQuery = async (body, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `with update_data as (
                Update "tblPageFormats" set "wrPageFormatName" = $1,"wrPageName" = $2,"wrImage" = $3,"wrDescription" = $4,"wrIsActive" = $5,"wrModifyDate" = now(),"wrModifyBy" = $6, "wrImagePath" = $7 where "wrPageFormatId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $7) returning *
            )
            select 
            "wrValue" as "pageFormatId",
            "wrPageFormatName" as "pageFormatName",
            "wrPageName" as "pageName",
            "wrImage" as "image",
            "wrDescription" as "description",
            "wrIsActive" as "isActive",
            "wrImagePath" as "imagePath"
             from update_data tb inner join "tblEncryptedData" te on tb."wrPageFormatId" = te."wrKey"`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          body.pageFormatName,
          body.pageName,
          body.image,
          body.description,
          body.isActive,
          body.userId,
          body.pageFormatId,
          body.imagePath,
        ],
      }
    );

    return data[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePageFormate/updatePageFormateQuery",
      request
    );
    throw new Error(err.message);
  }
};

const validatePageFormatQuery = async (pageFormatId, fastify, request) => {
  try {
    const data = await fastify.db.query(
      `select tpf.* from "tblPages" tp 
    left join "tblPageFormats" tpf on tp."wrPageFormatId" = tpf."wrPageFormatId"
    where tp."wrPageFormatId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1) AND tp."wrIsDeleted" = false`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [pageFormatId],
      }
    );
    // return !!data.length;
    return data.length ? data[0] : null;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePageFormate/validatePageFormatQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deletePageFormatQuery = async (pageFormatId, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblPageFormats" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
      where "wrPageFormatId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($3))`,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [true, request.userTokenInfo.WrUserId, pageFormatId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePageFormate/deletePageFormatQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  allPageFormateQuery,
  insertPageFormateQuery,
  updatePageFormateQuery,
  validatePageFormatQuery,
  deletePageFormatQuery,
};
