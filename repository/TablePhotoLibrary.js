const { errorLogger } = require("../utilities/logger");

// const getAllPhotoLibraryQuery = async (fastify) => {
//   return await fastify.db.query(
//     `SELECT
//             tpl."wrPhotoLibraryId" AS "photoLibraryId",
//             tpl."wrTitle" AS "title",
//             tpl."wrSEO" AS "SEO",
//             tpl."wrDescription" AS "description",
//             tpl."wrIsPermanent" AS "isPermanent",
//             tpl."wrStartDate" AS "startDate",
//             tpl."wrEndDate" AS "endDate",
//             COALESCE(
//                 JSON_AGG(
//                     JSONB_BUILD_OBJECT(
//                         'id', tli."wrId",
//                         'photoLibraryId', tli."wrPhotoLibraryId",
//                         'title', tli."wrTitle",
//                         'image', tli."wrImage",
//                         'displayOrder', tli."wrDisplayOrder",
//                         'isDefault', tli."wrIsDefault"
//                     )
//                     ORDER BY tli."wrDisplayOrder" ASC
//                 ) FILTER (WHERE tli."wrIsDeleted" = FALSE),
//                 '[]'
//             ) AS "libraryImages"
//         FROM "tblPhotoLibrary" AS tpl
//         LEFT JOIN "tblLibraryImages" AS tli
//             ON tli."wrPhotoLibraryId" = tpl."wrPhotoLibraryId"
//         WHERE tpl."wrIsDeleted" = FALSE
//         GROUP BY tpl."wrPhotoLibraryId", tpl."wrTitle", tpl."wrSEO", tpl."wrDescription", tpl."wrIsPermanent", tpl."wrStartDate", tpl."wrEndDate"
//         ;`,
//     { type: fastify.db.QueryTypes.SELECT }
//   );
// };

const getAllPhotoLibraryQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
              "wrPhotoLibraryId" AS "photoLibraryId",
              "wrTitle" AS "title",
              "wrSEO" AS "SEO",
              "wrDescription" AS "description",
              "wrIsPermanent" AS "isPermanent",
              "wrStartDate" AS "startDate",
              "wrEndDate" AS "endDate"
          FROM "tblPhotoLibrary"
          WHERE "wrIsDeleted" = FALSE;`,
    { type: fastify.db.QueryTypes.SELECT }
  );
};

const getAllLibraryImagesQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
              "wrId" AS "id",
              "wrPhotoLibraryId" AS "photoLibraryId",
              "wrTitle" AS "title",
              "wrImage" AS "description",
              "wrDisplayOrder" AS "displayOrder",
              "wrIsDefault" AS "isDefault"
            FROM "tblLibraryImages"
          WHERE "wrIsDeleted" = FALSE
          ORDER BY "wrDisplayOrder" ASC
          ;`,
    { type: fastify.db.QueryTypes.SELECT }
  );
};

const insertPhotoLibraryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `WITH insert_data AS (
              INSERT INTO "tblPhotoLibrary" (
              "wrTitle", "wrSEO", "wrDescription", "wrIsPermanent", "wrStartDate", "wrEndDate"
              ) 
              VALUES (
                  $1, $2, $3, $4, $5, $6
              ) 
              RETURNING *
              )        
              SELECT 
              "wrPhotoLibraryId" AS "photoLibraryId",
              "wrTitle" AS "title",
              "wrSEO" AS "SEO",
              "wrDescription" AS "description",
              "wrIsPermanent" AS "isPermanent",
              "wrStartDate" AS "startDate",
              "wrEndDate" as "endDate"
              FROM insert_data;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.title,
          data.SEO,
          data.description,
          data.isPermanent || false,
          data.startDate || null,
          data.endDate || null,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/insertPhotoLibraryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePhotoLibraryQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `Update "tblPhotoLibrary" set 
            "wrTitle" = $1,"wrSEO" = $2,"wrDescription" = $3,"wrIsPermanent" = $4,
            "wrStartDate" = $5, "wrEndDate" = $6
            where "wrPhotoLibraryId" = $7
            RETURNING 
              "wrPhotoLibraryId" AS "photoLibraryId",
              "wrTitle" AS "title",
              "wrSEO" AS "SEO",
              "wrDescription" AS "description",
              "wrIsPermanent" AS "isPermanent",
              "wrStartDate" AS "startDate",
              "wrEndDate" as "endDate"`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.title,
          data.SEO,
          data.description,
          data.isPermanent || false,
          data.startDate || null,
          data.endDate || null,
          data.photoLibraryId,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/updatePhotoLibraryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const insertLibraryImageQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
        `WITH count_parent AS (
            SELECT COUNT(*) AS count
            FROM "tblLibraryImages"
            WHERE "wrPhotoLibraryId" = $1 AND "wrIsDeleted" = false
          ),
          add_data AS (
            INSERT INTO "tblLibraryImages" ("wrPhotoLibraryId", "wrTitle", "wrImage", "wrDisplayOrder", "wrIsDefault")
            SELECT 
              $1, 
              $2, 
              $3, 
              (SELECT count FROM count_parent) + 1, 
              $4
            RETURNING *
          )
          SELECT 
            "wrId" AS "id",
            "wrPhotoLibraryId" AS "photoLibraryId",
            "wrTitle" AS "title",
            "wrImage" AS "image",
            "wrDisplayOrder" AS "displayOrder",
            "wrIsDefault" AS "isDefault"
          FROM add_data;`,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            data.photoLibraryId,
            data.title,
            data.image || null,
            data.isDefault || false,
          ],
        }
      );
      return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/insertLibraryImageQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateLibraryImageQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `Update "tblLibraryImages" set 
              "wrPhotoLibraryId" = $1,"wrTitle" = $2,"wrImage" = $3, "wrIsDefault" = $4
              where "wrId" = $5
          RETURNING 
            "wrId" AS "id",
            "wrPhotoLibraryId" AS "photoLibraryId",
            "wrTitle" AS "title",
            "wrImage" AS "image",
            "wrDisplayOrder" AS "displayOrder",
            "wrIsDefault" AS "isDefault";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.photoLibraryId,
          data.title,
          data.image || null,
          data.isDefault || false,
          data.id,
        ],
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/updateLibraryImageQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deletePhotoLibraryQuery = async (photoLibraryId, fastify, request) => {
  try {
    await fastify.db.query(
      `update "tblPhotoLibrary" set
         "wrIsDeleted" = $1,
         "wrDeletedBy" = $2,
         "wrDeletedAt" = now()
        where "wrPhotoLibraryId" = ANY ($3)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, photoLibraryId],
      }
    );

    await fastify.db.query(
        `update "tblLibraryImages" set
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
          where "wrPhotoLibraryId" = ANY ($3)`,
        {
          type: fastify.db.QueryTypes.UPDATE,
          bind: [true, request.userTokenInfo.WrUserId, photoLibraryId],
        }
      );

      return `Photo library data deleted successfully`;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/deletePhotoLibraryQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteLibraryImagesQuery = async (id, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblLibraryImages" set
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
      "DB ERROR --> repository/TablePhotoLibrary.js/deleteLibraryImagesQuery",
      request
    );
    throw new Error(err.message);
  }
};

async function changeDisplayOrderQuery(body, request, fastify) {
  try {
    return await fastify.db.query(
      `update "tblLibraryImages" set "wrDisplayOrder" = $1 where "wrId" = $2 `,
      {
        bind: [body.displayOrder, body.id],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/changeDisplayOrderQuery",
      request
    );
    throw new Error(err.message);
  }
}

const isDefaultChangeQuery = async (data, fastify, request) => {
  try {
      return await fastify.db.query(
          `UPDATE "tblLibraryImages" SET "wrIsDefault" = $1 where "wrId" = $2 AND "wrIsDeleted" = false`,
          {
              type: fastify.db.QueryTypes.UPDATE,
              bind: [data.isDefault, data.id],
          }
      );
  } catch (err) {
      errorLogger(
          fastify,
          err.message,
          "DB ERROR --> repository/TablePhotoLibrary.js/isDefaultChangeQuery",
          request
      );
      throw new Error(err.message);
  }
};

const isDefaultFalseQuery = async (data, fastify, request) => {
  try {
      return await fastify.db.query(
          `UPDATE "tblLibraryImages" SET "wrIsDefault" = $1 WHERE "wrId" != $2 AND "wrPhotoLibraryId" = $3 AND "wrIsDeleted" = false`,
          {
              type: fastify.db.QueryTypes.UPDATE,
              bind: [false, data.id, data.photoLibraryId],
          }
      );
  } catch (err) {
      errorLogger(
          fastify,
          err.message,
          "DB ERROR --> repository/TablePhotoLibrary.js/isDefaultFalseQuery",
          request
      );
      throw new Error(err.message);
  }
};

module.exports = {
  getAllPhotoLibraryQuery,
  getAllLibraryImagesQuery,
  insertPhotoLibraryQuery,
  updatePhotoLibraryQuery,
  insertLibraryImageQuery,
  updateLibraryImageQuery,
  deletePhotoLibraryQuery,
  deleteLibraryImagesQuery,
  changeDisplayOrderQuery,
  isDefaultChangeQuery,
  isDefaultFalseQuery,
};
