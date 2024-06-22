const { errorLogger } = require("../utilities/logger");


const getAllMarketOddsBallByBall = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
          `SELECT 
        "wrCommentaryId" AS "commentaryId",
        "wrCommentaryBallByBallId" AS "commentaryBallByBallId",
        "wrEventMarketId" AS "eventMarketId",
        "wrRunnerId" AS "runnerId",
        "wrMarketStatus" AS "marketStatus",
        "wrBackPrice" AS "backPrice",
        "wrLayPrice" AS "layPrice",
        "wrBackSize" AS "backSize",
        "wrLaySize" AS "laySize",
        "wrMarketName" AS "marketName",
        "wrRunnerName" AS "runnerName",
        "wrDateTime" AS "dateTime"
    FROM 
        "tblMarketOddsBallByBall";
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
const getMarketOddsBallByBallById = async (id, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
      SELECT 
        "wrCommentaryId" AS "commentaryId",
        "wrCommentaryBallByBallId" AS "commentaryBallByBallId",
        "wrEventMarketId" AS "eventMarketId",
        "wrRunnerId" AS "runnerId",
        "wrMarketStatus" AS "marketStatus",
        "wrBackPrice" AS "backPrice",
        "wrLayPrice" AS "layPrice",
        "wrBackSize" AS "backSize",
        "wrLaySize" AS "laySize",
        "wrMarketName" AS "marketName",
        "wrRunnerName" AS "runnerName",
        "wrDateTime" AS "dateTime"
      FROM 
        "tblMarketOddsBallByBall"
      WHERE 
        "wrId" = $1
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
      DELETE FROM "tblMarketOddsBallByBall"
      WHERE 
        "wrCommentaryBallByBallId" = $1
        AND "wrCommentaryId" = $2
      RETURNING *
      `,
      {
        bind: [data.commentaryBallByBallId, data.commentaryId],
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
    const result = await fastify.db.query(
      `INSERT INTO "tblMarketOddsBallByBall" (
        "wrCommentaryId", 
        "wrCommentaryBallByBallId", 
        "wrDateTime"
      ) VALUES (
        $1, $2
      ) RETURNING *
      `,
      {
        bind: [
          data.commentaryId,
          data.commentaryBallByBallId,
          new Date()
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

const updateLatestMarketOddsBallByBall = async (data, fastify, request) => {
  try {
    // Get the latest wrCommentaryBallByBallId
    const latestEntry = await fastify.db.query(
      `
      SELECT "wrCommentaryBallByBallId" 
      FROM "tblMarketOddsBallByBall"
      WHERE "wrCommentaryId" = $1
      ORDER BY "wrDateTime" DESC
      LIMIT 1
      `,
      {
        bind: [data.commentaryId],
        type: fastify.db.QueryTypes.SELECT,
      }
    );


    if (!latestEntry.length) {
      throw new Error('No entries found to update.');
    }

    const latestWrCommentaryBallByBallId = latestEntry[0].wrCommentaryBallByBallId;

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
        "wrDateTime" = $10
      WHERE  
         "wrCommentaryBallByBallId" = $11
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
          latestWrCommentaryBallByBallId
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMarketOddsBallByBall/updateLatestMarketOdds",
      request
    );
    throw new Error(err.message);
  }
};


module.exports = {
  getAllMarketOddsBallByBall,
  createMarketOddsBallByBall,
  getMarketOddsBallByBallById,
  updateMarketOddsBallByBall,
  deleteMarketOddsBallByBall,
  createMarketOddsBallByBallBYID,
  updateLatestMarketOddsBallByBall
};
