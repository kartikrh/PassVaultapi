const allPageFormateQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
    "wrValue" as "pageFormatId",
    "wrPageFormatName" as "pageFormatName",
    "wrPageName" as "pageName",
    "wrImage" as "image",
    "wrDescription" as "description",
    "wrIsActive" as "isActive"
    from "tblPageFormats" tb inner join "tblEncryptedData" te on tb."wrPageFormatId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const pageFormateQueryById = async (id, fastify) => {
  const data = await fastify.db.query(
    `select 
        "wrKey" as "id",
        "wrValue" as "pageFormatId",
        "wrPageFormatName" as "pageFormatName",
        "wrPageName" as "pageName",
        "wrImage" as "image",
        "wrDescription" as "description",
        "wrIsActive" as "isActive"
        from "tblPageFormats" tb inner join "tblEncryptedData" te on tb."wrPageFormatId" = te."wrKey" where te."wrValue" = $1`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [id],
    }
  );

  return data[0];
};

const checkPageFormateByName = async (body, fastify, option) => {
  let query = `SELECT * FROM "tblPageFormats" WHERE "wrPageFormatName" ilike $1`;
  let params = [body.pageFormatName];

  if (option === "update") {
    query += ` and not "wrPageFormatId" = $2`;
    params.push(body.pageFormatId);
  }

  const data = await fastify.db.query(query, {
    type: fastify.db.QueryTypes.SELECT,
    bind: params,
  });

  return !!data.length;
};

const insertPageFormateQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `with insert_data as (
                Insert into "tblPageFormats"("wrPageFormatName","wrPageName","wrImage","wrDescription","wrIsActive","wrCreatedDate","wrCreatedBy") 
                select $1,$2,$3,$4,$5,$6,$7 returning *
            )
            select 
            "wrValue" as "pageFormatId",
            "wrPageFormatName" as "pageFormatName",
            "wrPageName" as "pageName",
            "wrImage" as "image",
            "wrDescription" as "description",
            "wrIsActive" as "isActive"
             from insert_data tb inner join "tblEncryptedData" te on tb."wrPageFormatId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.pageFormatName,
        body.pageName || null,
        body.image || null,
        body.description || null,
        body.isActive || false,
        new Date(),
        body.userId,
      ],
    }
  );

  return data[0];
};

const updatePageFormateQuery = async (body, fastify) => {
  const data = await fastify.db.query(
    `with update_data as (
                Update "tblPageFormats" set "wrPageFormatName" = $1,"wrPageName" = $2,"wrImage" = $3,"wrDescription" = $4,"wrIsActive" = $5,"wrModifyDate" = $6,"wrModifyBy" = $7 where "wrPageFormatId" = (select "wrKey" from "tblEncryptedData" where "wrValue" = $8) returning *
            )
            select 
            "wrValue" as "pageFormatId",
            "wrPageFormatName" as "pageFormatName",
            "wrPageName" as "pageName",
            "wrImage" as "image",
            "wrDescription" as "description",
            "wrIsActive" as "isActive"
             from update_data tb inner join "tblEncryptedData" te on tb."wrPageFormatId" = te."wrKey"`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [
        body.pageFormatName,
        body.pageName,
        body.image,
        body.description,
        body.isActive,
        new Date(),
        body.userId,
        body.pageFormatId,
      ],
    }
  );

  return data[0];
};

const validatePageFormatQuery = async (pageFormatId, fastify) => {
  const data = await fastify.db.query(
    `select tpf.* from "tblPages" tp 
    left join "tblPageFormats" tpf on tp."wrPageFormatId" = tpf."wrPageFormatId"
    where tp."wrPageFormatId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = $1)`,
    {
      type: fastify.db.QueryTypes.SELECT,
      bind: [pageFormatId],
    }
  );

  return !!data.length;
};

const deletePageFormatQuery = async (pageFormatId, fastify) => {
  return await fastify.db.query(
    `delete from "tblPageFormats" where "wrPageFormatId" in (select "wrKey" from "tblEncryptedData" where "wrValue" = ANY($1))`,
    {
      type: fastify.db.QueryTypes.DELETE,
      bind: [pageFormatId],
    }
  );
};

module.exports = {
  allPageFormateQuery,
  pageFormateQueryById,
  checkPageFormateByName,
  insertPageFormateQuery,
  updatePageFormateQuery,
  validatePageFormatQuery,
  deletePageFormatQuery,
};
