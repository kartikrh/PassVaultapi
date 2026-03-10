const { errorLogger } = require("../utilities/logger");

const getAllVideoLibraryQuery = async (fastify) => {
  return fastify.db.query(
    `
    SELECT 
       "wrId" AS "id",
      "wrTitle" AS "title",
      "wrIsPermanent" AS "isPermanent",
      "wrFrom" AS "from",
      "wrTo" AS "to",
      "wrTag" AS "tag",
      "wrSEO" AS "SEO",
      "wrDescription" AS "description",
      "wrVideo" AS "video",
      "wrVideoURL" AS "videoURL",
      "wrType" AS "type",
      "wrCommentaryId" AS "commentaryId",
      "wrVideoPath" AS "videoPath",
      "wrIsActive" AS "isActive"
    FROM "tblVideoLibrary"
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
              "wrSEO", "wrDescription", "wrVideo", "wrVideoURL", "wrType", "wrCommentaryId", "wrVideoPath", "wrIsActive"
              ) 
              VALUES (
                  $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
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
                "wrVideo" AS "video",
                "wrVideoURL" AS "videoURL",
                "wrType" AS "type",
                "wrCommentaryId" AS "commentaryId",
                "wrVideoPath" AS "videoPath",
                "wrIsActive" AS "isActive"
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
          data.video || null,
          data.videoURL || null,
          data.type,
          data.commentaryId || 0,
          data.videoPath || null,
          data.isActive || false
        ],
      }
    );
    return result[0];
  } catch (err) {
    console.log("insert", err)
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
              "wrSEO" = $6, "wrDescription" = $7, "wrVideo" = $8, "wrVideoURL" = $9, "wrType" = $10, "wrCommentaryId" = $11, "wrVideoPath" = $13, "wrIsActive" = $14
            where "wrId" = $12
            RETURNING 
                "wrId" AS "id",
                "wrTitle" AS "title",
                "wrIsPermanent" AS "isPermanent",
                "wrFrom" AS "from",
                "wrTo" AS "to",
                "wrTag" AS "tag",
                "wrSEO" AS "SEO",
                "wrDescription" AS "description",
                "wrVideo" AS "video",
                "wrVideoURL" AS "videoURL",
                "wrType" AS "type",
                "wrCommentaryId" AS "commentaryId",
                "wrVideoPath" AS "videoPath",
                "wrIsActive" AS "isActive"`,
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
        ],
      }
    );
    return result[0];
  } catch (err) {
    console.log("update", err)
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
    console.log("updateStatusQuery", err);
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

module.exports = {
  getAllVideoLibraryQuery,
  insertVideoLibraryQuery,
  updateVideoLibraryQuery,
  deleteVideoLibraryQuery,
  updateVideoLibraryStatusQuery,
};
