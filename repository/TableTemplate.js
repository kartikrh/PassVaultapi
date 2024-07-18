const { errorLogger } = require("../utilities/logger");

const getAllTemplateQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrId" as "templateId",
            "wrTemplateType" as "templateType",
            "wrType" as "type",
            "wrTitle" as "title",
            "wrDescription" as "description",
            "wrIsActive" as "isActive"
        from "tblTemplate"
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const deleteTemplateQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                delete from "tblTemplate" where "wrId" = ANY ($1)
            `,
      {
        type: fastify.db.QueryTypes.DELETE,
        bind: [request.body.templateId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTemplate/deleteTemplateQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertTemplateQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `
                with insert_data as (
                    insert into "tblTemplate" (
                        "wrTemplateType",
                        "wrType",
                        "wrTitle",
                        "wrDescription",
                        "wrIsActive",
                        "wrCreatedBy",
                        "wrCreatedDate"
                    )
                values ($1, $2, $3, $4, $5, $6, now()) returning *
                )
                select 
                    "wrId" as "templateId",
                    "wrTemplateType" as "templateType",
                    "wrType" as "type",
                    "wrTitle" as "title",
                    "wrDescription" as "description",
                    "wrIsActive" as "isActive"
                from "insert_data"
            `,
      {
        type: fastify.db.QueryTypes.INSERT,
        bind: [
          data.templateType,
          data.type,
          data.title,
          data.description,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTemplate/insertTemplateQuery",
      request
    );
    throw new Error(err.message);
  }
};
const updateTemplateQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblTemplate" set
                "wrTemplateType" = $1,
                "wrType" = $2,
                "wrTitle" = $3,
                "wrDescription" = $4,
                "wrIsActive" = $5, 
                "wrModifyBy" = $6,
                "wrModifyDate" = now()
                where "wrId" = $7
            `,
      {
        bind: [
          data.templateType,
          data.type,
          data.title,
          data.description,
          data.isActive || false,
          request.userTokenInfo.WrUserId,
          data.templateId
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTemplate/updateTemplateQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveTemplateQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
      `
                update "tblTemplate" set
                "wrIsActive" = $1
                where "wrId" = $2
            `,
      {
        bind: [data.isActive, data.templateId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableTemplate/activeInactiveTemplateQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  getAllTemplateQuery,
  insertTemplateQuery,
  updateTemplateQuery,
  deleteTemplateQuery,
  activeInactiveTemplateQuery
};