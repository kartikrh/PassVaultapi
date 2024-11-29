const { errorLogger } = require("../utilities/logger");

const getAllVideoLibraryQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
              "wrId" AS "id",
              "wrTitle" AS "title",
              "wrIsPermanent" AS "isPermanent",
              "wrFrom" AS "from",
              "wrTo" AS "to",
              "wrTag" AS "tag",
              "wrSEO" AS "SEO",
              "wrDescription" AS "description",
              "wrVideoURL" AS "videoURL",
              "wrType" AS "type",
              "wrCommentaryId" AS "commentaryId"
          FROM "tblVideoLibrary"
          WHERE "wrIsDeleted" = FALSE;`,
    { type: fastify.db.QueryTypes.SELECT }
  );
};

const insertVideoLibraryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
              INSERT INTO "tblVideoLibrary" (
              "wrTitle", "wrIsPermanent", "wrFrom", "wrTo", "wrTag",
              "wrSEO", "wrDescription", "wrVideoURL", "wrType", "wrCommentaryId"
              ) 
              VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
              ) 
              RETURNING *
              )        
              SELECT 
                "wrId" AS "id",
                "wrTitle" AS "title",
                "wrIsPermanent" AS "isPermanent",
                "wrFrom" AS "from",
                "wrTo" AS "to",
                "wrTag" AS "tag",
                "wrSEO" AS "SEO",
                "wrDescription" AS "description",
                "wrVideoURL" AS "videoURL",
                "wrType" AS "type",
                "wrCommentaryId" AS "commentaryId"
              FROM insert_data;`,
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
          data.videoURL,
          data.type,
          data.commentaryId || 0
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
      `Update "tblVideoLibrary" set 
              "wrTitle" = $1, "wrIsPermanent" = $2, "wrFrom" = $3, "wrTo" = $4, "wrTag" = $5,
              "wrSEO" = $6, "wrDescription" = $7, "wrVideoURL" = $8, "wrType" = $9, "wrCommentaryId" = $10
            where "wrId" = $11
            RETURNING 
                "wrId" AS "id",
                "wrTitle" AS "title",
                "wrIsPermanent" AS "isPermanent",
                "wrFrom" AS "from",
                "wrTo" AS "to",
                "wrTag" AS "tag",
                "wrSEO" AS "SEO",
                "wrDescription" AS "description",
                "wrVideoURL" AS "videoURL",
                "wrType" AS "type",
                "wrCommentaryId" AS "commentaryId"`,
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
            data.videoURL,
            data.type,
            data.commentaryId || 0,
            data.id,
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

module.exports = {
  getAllVideoLibraryQuery,
  insertVideoLibraryQuery,
  updateVideoLibraryQuery,
  deleteVideoLibraryQuery,
};
