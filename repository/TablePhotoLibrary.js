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
        tpl."wrPhotoLibraryId" AS "photoLibraryId",
        tpl."wrTitle" AS "title",
        tpl."wrSEO" AS "SEO",
        tpl."wrDescription" AS "description",
        tpl."wrIsPermanent" AS "isPermanent",
        tpl."wrStartDate" AS "startDate",
        tpl."wrEndDate" AS "endDate",
        tpl."wrIsActive" AS "isActive",
        tpl."wrDisplayOrder" AS "displayOrder",
        tpl."wrCommentaryId" AS "commentaryId",
        tpl."wrWhitelabelId" AS "whitelabelId",
        tpl."wrViewCount" AS "viewCount"
     FROM "tblPhotoLibrary" tpl
     WHERE tpl."wrIsDeleted" = false
     ORDER BY tpl."wrPhotoLibraryId" ASC`,
    {
      type: fastify.db.QueryTypes.SELECT
    }
  );
};

const getAllLibraryImagesQuery = async (fastify) => {
  return await fastify.db.query(
    `SELECT 
              "wrId" AS "id",
              "wrPhotoLibraryId" AS "photoLibraryId",
              "wrTitle" AS "title",
              "wrImage" AS "image",
              "wrDisplayOrder" AS "displayOrder",
              "wrIsDefault" AS "isDefault",
              "wrImagePath" AS "imagePath"
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
          "wrTitle",
          "wrSEO",
          "wrDescription",
          "wrIsPermanent",
          "wrStartDate",
          "wrEndDate",
          "wrIsActive",
          "wrDisplayOrder",
          "wrCommentaryId",
          "wrWhitelabelId"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          (
            SELECT COALESCE(MAX("wrDisplayOrder"), 0) + 1
            FROM "tblPhotoLibrary"
            WHERE "wrIsDeleted" = false
          ),
          $8, $9
        )
        RETURNING *
      )
      SELECT
        tpl."wrPhotoLibraryId" AS "photoLibraryId",
        tpl."wrTitle" AS "title",
        tpl."wrSEO" AS "SEO",
        tpl."wrDescription" AS "description",
        tpl."wrIsPermanent" AS "isPermanent",
        tpl."wrStartDate" AS "startDate",
        tpl."wrEndDate" AS "endDate",
        tpl."wrIsActive" AS "isActive",
        tpl."wrDisplayOrder" AS "displayOrder",
        tpl."wrCommentaryId" AS "commentaryId",
        tpl."wrWhitelabelId" AS "whitelabelId",
        tpl."wrViewCount" AS "viewCount"
      FROM insert_data tpl;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.title,
          data.SEO,
          data.description,
          data.isPermanent || false,
          data.startDate || null,
          data.endDate || null,
          data.isActive ?? false,
          data.commentaryId || 0,
          data.whitelabelId || null
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
      `WITH update_data AS (
          UPDATE "tblPhotoLibrary"
          SET
            "wrTitle" = $1,
            "wrSEO" = $2,
            "wrDescription" = $3,
            "wrIsPermanent" = $4,
            "wrStartDate" = $5,
            "wrEndDate" = $6,
            "wrIsActive" = $7,
            "wrCommentaryId" = $8,
            "wrDisplayOrder" = $9,
            "wrWhitelabelId" = $10
          WHERE "wrPhotoLibraryId" = $11
          RETURNING *
      )
      SELECT
        upd."wrPhotoLibraryId" AS "photoLibraryId",
        upd."wrTitle" AS "title",
        upd."wrSEO" AS "SEO",
        upd."wrDescription" AS "description",
        upd."wrIsPermanent" AS "isPermanent",
        upd."wrStartDate" AS "startDate",
        upd."wrEndDate" AS "endDate",
        upd."wrIsActive" AS "isActive",
        upd."wrDisplayOrder" AS "displayOrder",
        upd."wrCommentaryId" AS "commentaryId",
        upd."wrWhitelabelId" AS "whitelabelId",
        upd."wrViewCount" AS "viewCount"
      FROM update_data upd;`,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [
          data.title,
          data.SEO,
          data.description,
          data.isPermanent ?? false,
          data.startDate ?? null,
          data.endDate ?? null,
          data.isActive ?? false,
          data.commentaryId ?? 0,
          data.displayOrder ?? 0,
          data.whitelabelId ?? null,
          data.photoLibraryId
        ]
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
            INSERT INTO "tblLibraryImages" ("wrPhotoLibraryId", "wrTitle", "wrImage", "wrDisplayOrder", "wrIsDefault", "wrImagePath")
            SELECT 
              $1, 
              $2, 
              $3, 
              (SELECT count FROM count_parent) + 1, 
              $4,
              $5
            RETURNING *
          )
          SELECT 
            "wrId" AS "id",
            "wrPhotoLibraryId" AS "photoLibraryId",
            "wrTitle" AS "title",
            "wrImage" AS "image",
            "wrDisplayOrder" AS "displayOrder",
            "wrIsDefault" AS "isDefault",
            "wrImagePath" AS "imagePath"
          FROM add_data;`,
        {
          type: fastify.db.QueryTypes.SELECT,
          bind: [
            data.photoLibraryId,
            data.title,
            data.image || null,
            data.isDefault || false,
            data.imagePath || null,
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
              "wrPhotoLibraryId" = $1,"wrTitle" = $2,"wrImage" = $3, "wrIsDefault" = $4, "wrImagePath" = $6
              where "wrId" = $5
          RETURNING 
            "wrId" AS "id",
            "wrPhotoLibraryId" AS "photoLibraryId",
            "wrTitle" AS "title",
            "wrImage" AS "image",
            "wrDisplayOrder" AS "displayOrder",
            "wrIsDefault" AS "isDefault",
            "wrImagePath" AS "imagePath";`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.photoLibraryId,
          data.title,
          data.image || null,
          data.isDefault || false,
          data.id,
          data.imagePath || null,
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

const updatePhotoLibraryStatusQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblPhotoLibrary"
       SET "wrIsActive" = $1
       WHERE "wrPhotoLibraryId" = $2
       RETURNING
         "wrPhotoLibraryId" AS "photoLibraryId",
         "wrIsActive" AS "isActive"
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.isActive, data.photoLibraryId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/updatePhotoLibraryStatusQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePhotoLibraryDisplayOrderQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblPhotoLibrary"
       SET "wrDisplayOrder" = $1
       WHERE "wrPhotoLibraryId" = $2`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [
          data.displayOrder,
          data.photoLibraryId
        ],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/updatePhotoLibraryDisplayOrderQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updatePhotoLibraryViewCountQuery = async (body, request, fastify) => {
  try {
    return await fastify.db.query(
      `UPDATE "tblPhotoLibrary" SET
        "wrViewCount" = COALESCE("wrViewCount", 0) + 1
      WHERE "wrPhotoLibraryId" = $1 `,
      {
        bind: [body.refId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TablePhotoLibrary.js/updatePhotoLibraryViewCountQuery",
      request
    );
    throw new Error(err.message);
  }
}

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
  updatePhotoLibraryStatusQuery,
  updatePhotoLibraryDisplayOrderQuery,
  updatePhotoLibraryViewCountQuery
};
