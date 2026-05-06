const { errorLogger } = require("../utilities/logger");


const getAllMarketOddsBallByBall = async (fastify, commentaryIds) => {
  try {
    return await fastify.db.query(
      `SELECT 
          mobb."wrId" AS "id",
          mobb."wrCommentaryId" AS "commentaryId",
          mobb."wrCommentaryBallByBallId" AS "commentaryBallByBallId",
          mobb."wrEventMarketId" AS "eventMarketId",
          mobb."wrMarketStatus" AS "marketStatus",
          mobb."wrMarketName" AS "marketName",
          mobb."wrData" AS "data",
          mobb."wrDateTime" AS "dateTime",
          em."wrRateSource" AS "rateSource",
          CASE 
              WHEN em."wrMarketTypeId" IS NULL THEN'0'
              WHEN em."wrMarketTypeId" = 0 THEN '0'
              ELSE em."wrMarketTypeId"::TEXT
          END AS "marketTypeId"
      FROM 
          "tblMarketOddsBallByBall" AS mobb
      LEFT JOIN "tblEventMarkets" em ON mobb."wrEventMarketId" = em."wrID"
      LEFT JOIN "tblMarketTypes" mty ON em."wrMarketTypeId" = mty."wrId"
      WHERE mobb."wrIsDeleted" = false AND em."wrIsDeleted" = false
      AND mobb."wrCommentaryId" IN (${commentaryIds})
    `,
      {
        type: fastify.db.QueryTypes.SELECT,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/getAllMarketOddsBallByBall",
      null
    );
    throw new Error(err.message);
  }
};
const getAllMarketOddsBallByBallByCommentaryId = async (data, fastify) => {
  try {
    let query = `SELECT 
          mobb."wrId" AS "id",
          mobb."wrCommentaryId" AS "commentaryId",
          mobb."wrCommentaryBallByBallId" AS "commentaryBallByBallId",
          mobb."wrEventMarketId" AS "eventMarketId",
          mobb."wrMarketStatus" AS "marketStatus",
          mobb."wrMarketName" AS "marketName",
          mobb."wrData" AS "data",
          mobb."wrDateTime" AS "dateTime",
          em."wrRateSource" AS "rateSource",
          CASE 
              WHEN em."wrMarketTypeId" IS NULL THEN'0'
              WHEN em."wrMarketTypeId" = 0 THEN '0'
              ELSE em."wrMarketTypeId"::TEXT
          END AS "marketTypeId"
      FROM 
          "tblMarketOddsBallByBall" AS mobb
      LEFT JOIN "tblEventMarkets" em ON mobb."wrEventMarketId" = em."wrID"
      LEFT JOIN "tblMarketTypes" mty ON em."wrMarketTypeId" = mty."wrId"
    WHERE mobb."wrIsDeleted" = false AND mobb."wrCommentaryId" = $1 AND em."wrIsDeleted" = false`;
    
    const result = await fastify.db.query(query,
      {
        bind: [data.commentaryId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> repository/TableMarketOddsBallByBall/getAllMarketOddsBallByBallByCommentaryId",
      null
    );
    throw new Error(error.message);
    
  }

}
const getMarketOddsBallByBallById = async (id, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      SELECT 
          mobb."wrId" AS "id",
          mobb."wrCommentaryId" AS "commentaryId",
          mobb."wrCommentaryBallByBallId" AS "commentaryBallByBallId",
          mobb."wrEventMarketId" AS "eventMarketId",
          mobb."wrMarketStatus" AS "marketStatus",
          mobb."wrMarketName" AS "marketName",
          mobb."wrData" AS "data",
          mobb."wrDateTime" AS "dateTime",
          CASE 
              WHEN em."wrMarketTypeId" IS NULL THEN'0'
              WHEN em."wrMarketTypeId" = 0 THEN '0'
              ELSE em."wrMarketTypeId"::TEXT
          END AS "marketTypeId"
      FROM 
          "tblMarketOddsBallByBall" AS mobb
      LEFT JOIN "tblEventMarkets" em ON mobb."wrEventMarketId" = em."wrID"
      LEFT JOIN "tblMarketTypes" mty ON em."wrMarketTypeId" = mty."wrId"
    WHERE mobb."wrIsDeleted" = false AND mobb."wrId" = $1 AND em."wrIsDeleted" = false
      `,
      {
        bind: [id],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/getMarketOddsById",
      request
    );
    throw new Error(err.message);
  }
};

const createMarketOddsBallByBall = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      INSERT INTO public."tblMarketOddsBallByBall" (
        "wrCommentaryId", 
        "wrCommentaryBallByBallId", 
        "wrEventMarketId", 
        "wrRunnerId", 
        "wrMarketStatus", 
        "wrBackPrice", 
        "wrLayPrice", 
        "wrBackSize", 
        "wrLaySize", 
        "wrMarketName", 
        "wrRunnerName", 
        "wrDateTime"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
      ) RETURNING *
      `,
      {
        bind: [
          data.commentaryId,
          data.commentaryBallByBallId,
          data.eventMarketId,
          data.runnerId,
          data.marketStatus,
          data.backPrice,
          data.layPrice,
          data.backSize,
          data.laySize,
          data.marketName,
          data.runnerName,
          data.dateTime
        ],
        type: fastify.db.QueryTypes.INSERT,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/createMarketOdds",
      request
    );
    throw new Error(err.message);
  }
};
const updateMarketOddsBallByBall = async (id, data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      UPDATE "tblMarketOddsBallByBall"
      SET 
        "wrCommentaryId" = $1,
        "wrCommentaryBallByBallId" = $2,
        "wrEventMarketId" = $3,
        "wrRunnerId" = $4,
        "wrMarketStatus" = $5,
        "wrBackPrice" = $6,
        "wrLayPrice" = $7,
        "wrBackSize" = $8,
        "wrLaySize" = $9,
        "wrMarketName" = $10,
        "wrRunnerName" = $11,
        "wrDateTime" = $12
      WHERE 
        "wrId" = $13
      RETURNING *
      `,
      {
        bind: [
          data.commentaryId,
          data.commentaryBallByBallId,
          data.eventMarketId,
          data.runnerId,
          data.marketStatus,
          data.backPrice,
          data.layPrice,
          data.backSize,
          data.laySize,
          data.marketName,
          data.runnerName,
          data.dateTime,
          id
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/updateMarketOdds",
      request
    );
    throw new Error(err.message);
  }
};

const deleteMarketOddsBallByBall = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      UPDATE "tblMarketOddsBallByBall" SET
        "wrIsDeleted" = $3,
        "wrDeletedBy" = $4,
        "wrDeletedAt" = now()
      WHERE 
        "wrCommentaryBallByBallId" = $1
        AND "wrCommentaryId" = $2
      RETURNING *
      `,
      {
        bind: [data.commentaryBallByBallId, data.commentaryId, true, request.userTokenInfo.WrUserId],
        type: fastify.db.QueryTypes.DELETE,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/deleteMarketOdds",
      request
    );
    throw new Error(err.message);
  }
};

const createMarketOddsBallByBallBYID = async (data, fastify, request) => {
  try {
    const insertData = [
      data.commentaryId,
      data.commentaryBallByBallId,
      data.teamId,
      data.EventMarketId,
      data.RunnerId,
      data.MarketStatus,
      data.BackPrice,
      data.LayPrice,
      data.BackSize,
      data.LaySize,
      data.MarketName,
      data.RunnerName,
      new Date(),
      data.selectionId
    ];

    const result = await fastify.db.query(
      `INSERT INTO "tblMarketOddsBallByBall" (
        "wrCommentaryId", 
        "wrCommentaryBallByBallId", 
        "wrTeamId", 
        "wrEventMarketId",
        "wrRunnerId",
        "wrMarketStatus",
        "wrBackPrice",
        "wrLayPrice",
        "wrBackSize",
        "wrLaySize",
        "wrMarketName",
        "wrRunnerName",
        "wrDateTime",
        "wrSelectionId"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING *`,
      {
        bind: insertData,
        type: fastify.db.QueryTypes.INSERT,
      }
    );
    
    return true;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/createMarketOdds",
      null
    );
    console.log(err.message);
    return false;
  }
};

const createMarketOddsBallByBallBYIDFromSocketIo = async (ballbybllId,data, fastify) => {
  try {
    const insertData = [
      data.commentaryId,
      ballbybllId,
      data.teamId,
      data.eventMarketId,
      data.runnerId,
      data.status,
      data.backPrice,
      data.layPrice,
      data.backSize,
      data.laySize,
      data.marketName,
      data.runner,
      new Date(),
      data.selectionId
    ];

    const result = await fastify.db.query(
      `INSERT INTO "tblMarketOddsBallByBall" (
        "wrCommentaryId", 
        "wrCommentaryBallByBallId", 
        "wrTeamId", 
        "wrEventMarketId",
        "wrRunnerId",
        "wrMarketStatus",
        "wrBackPrice",
        "wrLayPrice",
        "wrBackSize",
        "wrLaySize",
        "wrMarketName",
        "wrRunnerName",
        "wrDateTime",
        "wrSelectionId"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      ) RETURNING 
        "wrId" as "id",
        "wrCommentaryId" as "commentaryId",
        "wrCommentaryBallByBallId" as "commentaryBallByBallId",
        "wrEventMarketId" as "eventMarketId",
        "wrRunnerId" as "runnerId",
        "wrMarketStatus" as "marketStatus",
        "wrBackPrice" as "backPrice",
        "wrLayPrice" as "layPrice",
        "wrBackSize" as "backSize",
        "wrLaySize" as "laySize",
        "wrMarketName" as "marketName",
        "wrRunnerName" as "runnerName",
        "wrDateTime" as "dateTime"
      `,
      {
        bind: insertData,
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0]; // Return the inserted record
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/createMarketOdds",
      null
    );
    console.log(err.message);
    return false;
  }
};
const updateLatestMarketOddsBallByBall = async (data, fastify, request) => {
  try {
    // Get the latest wrCommentaryBallByBallId
    const latestEntry = await fastify.db.query(
      `
      SELECT "wrCommentaryBallByBallId","wrId"
      FROM "tblMarketOddsBallByBall"
      WHERE "wrCommentaryId" = $1
      AND "wrIsDeleted" = false
      AND "wrTeamId" = $2
      AND "wrRunnerName" IS NULL
      ORDER BY "wrDateTime" ASC
      LIMIT 1
      `,
      {
        bind: [data.commentaryId,data.teamId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );


    if (!latestEntry.length) {
      return false;
    }

    //const latestWrCommentaryBallByBallId = latestEntry[0].wrCommentaryBallByBallId;
    const latestWrId = latestEntry[0].wrId;

    if (!latestWrId) {
      return false;
    }

    // Update the latest entry
    const result = await fastify.db.query(
      `
      UPDATE "tblMarketOddsBallByBall"
      SET 
        "wrEventMarketId" = $1,
        "wrRunnerId" = $2,
        "wrMarketStatus" = $3,
        "wrBackPrice" = $4,
        "wrLayPrice" = $5,
        "wrBackSize" = $6,
        "wrLaySize" = $7,
        "wrMarketName" = $8,
        "wrRunnerName" = $9,
        "wrDateTime" = $10,
        "wrSelectionId" = $12
      WHERE  
         "wrId" = $11
      RETURNING *
      `,
      {
        bind: [
          data.EventMarketId,
          data.RunnerId,
          data.MarketStatus,
          data.BackPrice,
          data.LayPrice,
          data.BackSize,
          data.LaySize,
          data.MarketName,
          data.RunnerName,
          new Date(),
          latestWrId,
          data.selectionId
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );

    return true;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/updateLatestMarketOdds",
      request
    );
    //console.log(err.message);
    return false;
    //throw new Error(err.message);
  }
};

const createMarketOddsBallByBallBulkInsert = async (dataArray, fastify) => {
  try {
    if (dataArray.length === 0) return false; // No data to insert

    // Initialize arrays to hold the values for the query
    const values = [];
    let placeholders = '';

    // Flatten the array and build placeholders
    let index = 1;
    dataArray.forEach(data => {
      data.runner.forEach(runner => {
        values.push(
          data.commentaryId,
          data.ballByBallId,
          data.teamId,
          data.marketId,
          runner.runnerId,
          data.status,
          runner.backPrice,
          runner.layPrice,
          runner.backSize,
          runner.laySize,
          data.marketName,
          runner.line, // Assuming you want to store `line` from runner
          new Date(),
          data.eventId
        );

        // Append placeholders
        placeholders += `(
          $${index++}, $${index++}, $${index++}, $${index++}, $${index++},
          $${index++}, $${index++}, $${index++}, $${index++}, $${index++},
          $${index++}, $${index++}, $${index++}, $${index++}
        ),`;
      });
    });

    // Remove the trailing comma from the placeholders string
    placeholders = placeholders.slice(0, -1);

    // Construct the bulk insert query
    const query = `
      INSERT INTO "tblMarketOddsBallByBall" (
        "wrCommentaryId", 
        "wrCommentaryBallByBallId", 
        "wrTeamId", 
        "wrEventMarketId",
        "wrRunnerId",
        "wrMarketStatus",
        "wrBackPrice",
        "wrLayPrice",
        "wrBackSize",
        "wrLaySize",
        "wrMarketName",
        "wrRunnerName",
        "wrDateTime",
        "wrSelectionId"
      ) VALUES ${placeholders}
      RETURNING *`;

    // Execute the bulk insert query
    const result = await fastify.db.query(query, {
      bind: values,
      type: fastify.db.QueryTypes.INSERT,
    });

    return result;
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/createMarketOddsBulkInsert",
      null
    );
    console.log(err.message);
    return false;
  }
};
const createMarketOddsBallInSaveDetails = async (data, fastify, request = null) => {
  try {
    const insertData = [
      data.commentaryId,
      data.commentaryBallByBallId,
      data.eventMarketId,
      data.marketStatus,
      data.marketName,
      data.data,
      new Date(),
    ];

    const insertResult  = await fastify.db.query(
      `INSERT INTO "tblMarketOddsBallByBall" (
        "wrCommentaryId", 
        "wrCommentaryBallByBallId",
        "wrEventMarketId",
        "wrMarketStatus",
        "wrMarketName",
        "wrData",
        "wrDateTime"
      ) VALUES 
      ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "wrId" as "id"`,
      {
        bind: insertData,
        type: fastify.db.QueryTypes.INSERT,
      }
    );
    
    const wrId = insertResult[0][0].id;
    const result = await fastify.db.query(
      `SELECT 
          mobb."wrId" AS "id",
          mobb."wrCommentaryId" AS "commentaryId",
          mobb."wrCommentaryBallByBallId" AS "commentaryBallByBallId",
          mobb."wrEventMarketId" AS "eventMarketId",
          mobb."wrMarketStatus" AS "marketStatus",
          mobb."wrMarketName" AS "marketName",
          mobb."wrData" AS "data",
          mobb."wrDateTime" AS "dateTime",
          em."wrRateSource" AS "rateSource",
          CASE 
              WHEN em."wrMarketTypeId" IS NULL THEN '0'
              WHEN em."wrMarketTypeId" = 0 THEN '0'
              ELSE em."wrMarketTypeId"::TEXT
          END AS "marketTypeId"
      FROM 
          "tblMarketOddsBallByBall" AS mobb
      LEFT JOIN "tblEventMarkets" em ON mobb."wrEventMarketId" = em."wrID"
      LEFT JOIN "tblMarketTypes" mty ON em."wrMarketTypeId" = mty."wrId"
      WHERE mobb."wrIsDeleted" = false AND mobb."wrId" = $1 AND em."wrIsDeleted" = false`,
      {
        bind: [wrId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/createMarketOdds",
      null
    );
    console.log(err.message);
    return false;
  }
};

const CheckAndCreateMarketOddsBallInSaveDetails = async (data, fastify, request = null) => {
  try {
    const selectQuery = `
      SELECT "wrId"
      FROM "tblMarketOddsBallByBall"
      WHERE "wrCommentaryId" = $1
        AND "wrIsDeleted" = false
        AND "wrCommentaryBallByBallId" = $2
        AND "wrEventMarketId" = $3
    `;

    // Check if the record exists
    const existingRecord = await fastify.db.query(selectQuery, {
      bind: [data.commentaryId, data.commentaryBallByBallId, data.eventMarketId],
      type: fastify.db.QueryTypes.SELECT,
    });

    let wrId;

    if (existingRecord.length > 0) {
      // Record exists, so update it
      wrId = existingRecord[0].wrId;
      const updateQuery = `
        UPDATE "tblMarketOddsBallByBall"
        SET "wrData" = $1,
            "wrDateTime" = $2
        WHERE "wrId" = $3
      `;

      await fastify.db.query(updateQuery, {
        bind: [data.data, new Date(), wrId],
        type: fastify.db.QueryTypes.UPDATE,
      });
    } else {
      // Record does not exist, so insert it
      const insertData = [
        data.commentaryId,
        data.commentaryBallByBallId,
        data.eventMarketId,
        data.marketStatus,
        data.marketName,
        data.data,
        new Date(),
      ];

      const insertResult = await fastify.db.query(
        `INSERT INTO "tblMarketOddsBallByBall" (
          "wrCommentaryId", 
          "wrCommentaryBallByBallId",
          "wrEventMarketId",
          "wrMarketStatus",
          "wrMarketName",
          "wrData",
          "wrDateTime"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING "wrId" as "id"`,
        {
          bind: insertData,
          type: fastify.db.QueryTypes.INSERT,
        }
      );

      wrId = insertResult[0][0].id; // Assign wrId from the inserted record
    }

    // Fetch the full details and return
    const result = await fastify.db.query(
      `SELECT 
          mobb."wrId" AS "id",
          mobb."wrCommentaryId" AS "commentaryId",
          mobb."wrCommentaryBallByBallId" AS "commentaryBallByBallId",
          mobb."wrEventMarketId" AS "eventMarketId",
          mobb."wrMarketStatus" AS "marketStatus",
          mobb."wrMarketName" AS "marketName",
          mobb."wrData" AS "data",
          mobb."wrDateTime" AS "dateTime",
          em."wrRateSource" AS "rateSource",
          CASE 
              WHEN em."wrMarketTypeId" IS NULL THEN '0'
              WHEN em."wrMarketTypeId" = 0 THEN '0'
              ELSE em."wrMarketTypeId"::TEXT
          END AS "marketTypeId"
      FROM 
          "tblMarketOddsBallByBall" AS mobb
      LEFT JOIN "tblEventMarkets" em ON mobb."wrEventMarketId" = em."wrID"
      LEFT JOIN "tblMarketTypes" mty ON em."wrMarketTypeId" = mty."wrId"
      WHERE mobb."wrIsDeleted" = false AND mobb."wrId" = $1 AND em."wrIsDeleted" = false`,
      {
        bind: [wrId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result[0]; // Return the full details
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/CheckAndCreateMarketOddsBallInSaveDetails",
      null
    );
    console.log(err.message);
    return false;
  }
};

const getAllMarketOddsBallByBallByCommentaryIdV1 = async (data, fastify) => {
  try {
    let query = `SELECT 
          mobb."wrId" AS "moddsid",
          mobb."wrCommentaryId" AS "cid",
          mobb."wrCommentaryBallByBallId" AS "cbalbyid",
          mobb."wrEventMarketId" AS "mid",
          mobb."wrMarketStatus" AS "msta",
          mobb."wrMarketName" AS "mn",
          mobb."wrData" AS "data",
          mobb."wrDateTime" AS "datetime",
          em."wrRateSource" AS "ratesrc",
          CASE 
              WHEN em."wrMarketTypeId" IS NULL THEN'0'
              WHEN em."wrMarketTypeId" = 0 THEN '0'
              ELSE em."wrMarketTypeId"::TEXT
          END AS "mtypid"
      FROM "tblMarketOddsBallByBall" AS mobb
      LEFT JOIN "tblEventMarkets" em ON mobb."wrEventMarketId" = em."wrID"
      LEFT JOIN "tblMarketTypes" mty ON em."wrMarketTypeId" = mty."wrId"
      WHERE mobb."wrIsDeleted" = false AND mobb."wrCommentaryId" = $1 AND em."wrIsDeleted" = false`;
    
    const result = await fastify.db.query(query,
      {
        bind: [data.commentaryId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );
    return result;
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "ERROR --> repository/TableMarketOddsBallByBall/getAllMarketOddsBallByBallByCommentaryIdV1",
      null
    );
    throw new Error(error.message);
  }
}

module.exports = {
  getAllMarketOddsBallByBall,
  createMarketOddsBallByBall,
  getMarketOddsBallByBallById,
  updateMarketOddsBallByBall,
  deleteMarketOddsBallByBall,
  createMarketOddsBallByBallBYID,
  updateLatestMarketOddsBallByBall,
  createMarketOddsBallByBallBYIDFromSocketIo,
  createMarketOddsBallByBallBulkInsert,
  getAllMarketOddsBallByBallByCommentaryId,
  createMarketOddsBallInSaveDetails,
  CheckAndCreateMarketOddsBallInSaveDetails,
  getAllMarketOddsBallByBallByCommentaryIdV1,
};
