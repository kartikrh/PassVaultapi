const { errorLogger } = require("../utilities/logger");

const virtualOverQuery = async (data, request, fastify) => {
  try {
    const query = `
    INSERT INTO "tblOvers" (
        "wrCommentaryId", "wrTeamId", "wrOver", "wrBowlerId", "wrBallCount", "wrTotalRun",
        "wrTotalFour", "wrTotalSix", "wrTotalWideBall", "wrTotalWideRun", "wrTotalNoball", "wrTotalNoBallRun",
        "wrTotalByesRun", "wrTotalLegByesRun", "wrTotalPanelty", "wrTotalWicket", "wrDotBall", "wrIsComplete",
        "wrIsOverInPowerplay", "wrPowerplayType", "wrIsMaiden", "wrDate", "wrCurrentInnings", "wrTeamScore",
        "wrIsPowerPlay", "wrPowerPlayName", "wrOverType", "wrOverTypeName"
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19,
        $20, $21, $22, $23, $24, $25, $26, $27, $28
    )
    RETURNING 
        "wrOverId" AS "overId",
        "wrCommentaryId" AS "commentaryId",
        "wrTeamId" AS "teamId",
        "wrOver" AS "over",
        "wrBowlerId" AS "bowlerId",
        "wrBallCount" AS "ballCount",
        "wrTotalRun" AS "totalRun",
        "wrTotalFour" AS "totalFour",
        "wrTotalSix" AS "totalSix",
        "wrTotalWideBall" AS "totalWideBall",
        "wrTotalWideRun" AS "totalWideRun",
        "wrTotalNoball" AS "totalNoball",
        "wrTotalNoBallRun" AS "totalNoBallRun",
        "wrTotalByesRun" AS "totalByesRun",
        "wrTotalLegByesRun" AS "totalLegByesRun",
        "wrTotalPanelty" AS "totalPanelty",
        "wrTotalWicket" AS "totalWicket",
        "wrDotBall" AS "dotBall",
        "wrIsComplete" AS "isComplete",
        "wrIsOverInPowerplay" AS "isOverInPowerplay",
        "wrPowerplayType" AS "powerplayType",
        "wrIsMaiden" AS "isMaiden",
        "wrDate" AS "date",
        "wrCurrentInnings" AS "currentInnings",
        "wrTeamScore" AS "teamScore",
        "wrIsPowerPlay" AS "isPowerPlay",
        "wrOverType" as "overType",
        "wrOverTypeName" as "overTypeName",
        "wrPowerPlayName" AS "powerPlayName"
    `;

    const result = await fastify.db.query(query, {
      bind: [
        data.commentaryId,
        data.teamId,
        data.over,
        data.bowlerId || null,
        data.ballCount,
        data.totalRun,
        data.totalFour,
        data.totalSix,
        data.totalWideBall,
        data.totalWideRun,
        data.totalNoball,
        data.totalNoBallRun,
        data.totalByesRun,
        data.totalLegByesRun,
        data.totalPanelty,
        data.totalWicket,
        data.dotBall,
        data.isComplete,
        data.isOverInPowerplay,
        data.powerplayType,
        data.isMaiden,
        new Date(), // wrDate
        data.currentInnings,
        data.teamScore,
        data.isPowerPlay ?? false,
        data.powerPlayName ?? null,
        data.overType ?? null,
        data.overTypeName ?? null
      ],
      type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (error) {
    console.log(error);
    errorLogger(
      fastify,
      error.message,
      "DB ERROR ->> repository/TableVirtual.js ->> virtualOverQuery",
      request
    );
    throw new Error(error.message);
  }
};
const virtualBallByBallQuery = async (data, request, fastify) => {
  try {
    const query = `
        INSERT INTO "tblCommentaryBallByBalls" 
        (
            "wrCommentaryId",
            "wrTeamId",
            "wrOverId",
            "wrOverCount",
            "wrCurrentOverBalls",
            "wrBowler_ID",
            "wrBat_StrikeID",
            "wrBat_NONStrikeID",
            "wrBall_IsCount",
            "wrBall_Type",
            "wrBall_IsDot",
            "wrBall_Run",
            "wrBall_ExtraRun",
            "wrBall_isBoundry",
            "wrBall_FOUR",
            "wrBall_SIX",
            "wrBall_IsWicket",
            "wrBall_WicketType",
            "wrBall_PlayerID",
            "wrBall_BowlerID",
            "wrBall_FielderID1",
            "wrBall_FielderID2",
            "wrOver_isMaiden",
            "wrNextBat_StrikeID",
            "wrNextBat_NONStrikeID",
            "wrIsDelete",
            "wrCurrentInnings",
            "wrAutoStrikeBallCount",
            "wrCommentaryPartnershipId",
            "wrTeamScore",
            "wrTeamWicket",
            "wrCardKey",
            "wrCardType",
            "wrTpId"
        )
        VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20,
            $21, $22, $23, $24, $25,
            $26, $27, $28, $29, $30,
            $31 ,$32 ,$33 ,$34
        )
        RETURNING
            "wrCommentaryBallByBallId" AS "commentaryBallByBallId",
            "wrCommentaryId" AS "commentaryId",
            "wrTeamId" AS "teamId",
            "wrOverId" AS "overId",
            "wrOverCount" AS "overCount",
            "wrCurrentOverBalls" AS "currentOverBalls",
            "wrBowler_ID" AS "bowlerId",
            "wrBat_StrikeID" AS "batStrikeId",
            "wrBat_NONStrikeID" AS "batNonStrikeId",
            "wrBall_IsCount" AS "ballIsCount",
            "wrBall_Type" AS "ballType",
            "wrBall_IsDot" AS "ballIsDot",
            "wrBall_Run" AS "ballRun",
            "wrBall_ExtraRun" AS "ballExtraRun",
            "wrBall_isBoundry" AS "ballIsBoundry",
            "wrBall_FOUR" AS "ballFour",
            "wrBall_SIX" AS "ballSix",
            "wrBall_IsWicket" AS "ballIsWicket",
            "wrBall_WicketType" AS "ballWicketType",
            "wrBall_PlayerID" AS "ballPlayerId",
            "wrBall_BowlerID" AS "ballBowlerId",
            "wrBall_FielderID1" AS "ballFielderId1",
            "wrBall_FielderID2" AS "ballFielderId2",
            "wrOver_isMaiden" AS "overIsMaiden",
            "wrNextBat_StrikeID" AS "nextBatStrikeId",
            "wrNextBat_NONStrikeID" AS "nextBatNonStrikeId",
            "wrIsDelete" AS "isDelete",
            "wrCurrentInnings" AS "currentInnings",
            "wrAutoStrikeBallCount" AS "autoStrikeBallCount",
            "wrCommentaryPartnershipId" AS "commentaryPartnershipId",
            "wrTeamScore" AS "teamScore",
            "wrTeamWicket" AS "teamWicket",
            "wrCardKey" AS "cardKey",
            "wrCardType" AS "cardType",
            "wrTpId" AS "tpId"
            ;`;

    const result = await fastify.db.query(query, {
        bind : [
            data.commentaryId,
            data.teamId,
            data.overId,
            data.overCount,
            data.currentOverBalls,
            data.bowlerId,
            data.batStrikeId,
            data.batNonStrikeId ?? 0,
            data.ballIsCount,
            data.ballType,
            data.ballIsDot,
            data.ballRun,
            data.ballExtraRun,
            data.ballIsBoundry,
            data.ballFour,
            data.ballSix,
            data.ballIsWicket,
            data.ballWicketType,
            data.ballPlayerId,
            data.ballBowlerId,
            data.ballFielderId1,
            data.ballFielderId2,
            data.overIsMaiden,
            data.nextBatStrikeId ?? 0,
            data.nextBatNonStrikeId ?? 0,
            data.isDelete ?? false,
            data.currentInnings,
            data.autoStrikeBallCount ?? null,
            data.commentaryPartnershipId ?? null,
            data.teamScore ?? null,
            data.teamWicket ?? null,
            data.cardKey ?? null,
            data.cardType ?? null,
            data.tpId ?? null
          ],
        type: fastify.db.QueryTypes.SELECT,
    });

    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR ->> repository/TableVirtual.js ->> virtualOverQuery",
      request
    );
    throw new Error(error.message);
  }
};
const virtualPartnershipQuery = async (data, request, fastify) => {
  try {
    const query = `
        INSERT INTO "tblCommentaryPartnerships" (
        "wrCommentaryId",
        "wrTeamId",
        "wrBatter1Id",
        "wrBatter2Id",
        "wrBatter1Name",
        "wrBatter2Name",
        "wrTotalRuns",
        "wrTotalBalls",
        "wrExtras",
        "wrCommentaryBallByBallId",
        "wrCurrentInnings",
        "wrBatter1Balls",
        "wrBatter2Balls",
        "wrBatter1Runs",
        "wrBatter2Runs",
        "wrTotalFour",
        "wrTotalSix",
        "wrTotalExtra",
        "wrTotalWide",
        "wrTotalNoBall",
        "wrOrder",
        "wrIsActive",
        "wrP1Ball",
        "wrP2Ball",
        "wrP1Run",
        "wrP2Run"
    )
    VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25,
        $26
    )
    RETURNING
        "wrCommentaryPartnershipId" AS "commentaryPartnershipId",
        "wrCommentaryId" AS "commentaryId",
        "wrTeamId" AS "teamId",
        "wrBatter1Id" AS "batter1Id",
        "wrBatter2Id" AS "batter2Id",
        "wrBatter1Name" AS "batter1Name",
        "wrBatter2Name" AS "batter2Name",
        "wrTotalRuns" AS "totalRuns",
        "wrTotalBalls" AS "totalBalls",
        "wrExtras" AS "extras",
        "wrCommentaryBallByBallId" AS "commentaryBallByBallId",
        "wrCurrentInnings" AS "currentInnings",
        "wrBatter1Balls" AS "batter1Balls",
        "wrBatter2Balls" AS "batter2Balls",
        "wrBatter1Runs" AS "batter1Runs",
        "wrBatter2Runs" AS "batter2Runs",
        "wrTotalFour" AS "totalFour",
        "wrTotalSix" AS "totalSix",
        "wrTotalExtra" AS "totalExtra",
        "wrTotalWide" AS "totalWide",
        "wrTotalNoBall" AS "totalNoBall",
        "wrOrder" AS "order",
        "wrIsActive" AS "isActive",
        "wrP1Ball" AS "p1Ball",
        "wrP2Ball" AS "p2Ball",
        "wrP1Run" AS "p1Run",
        "wrP2Run" AS "p2Run",
        "wrTeamScore" as "teamScore",
        "wrTeamWicket" as "teamWicket"
    `;
    const result = await fastify.db.query(query, {
        bind : [
            data.commentaryId,
            data.teamId,
            data.batter1Id,
            data.batter2Id,
            data.batter1Name,
            data.batter2Name,
            data.totalRuns || 0,
            data.totalBalls || 0,
            data.extras || 0,
            data.commentaryBallByBallId,
            data.currentInnings,
            data.batter1Balls || 0,
            data.batter2Balls || 0,
            data.batter1Runs || 0,
            data.batter2Runs || 0,
            data.totalFour || 0,
            data.totalSix || 0,
            data.totalExtra || 0,
            data.totalWide || 0,
            data.totalNoBall || 0,
            data.order ?? null,
            data.isActive,
            data.p1Ball || 0,
            data.p2Ball || 0,
            data.p1Run || 0,
            data.p2Run || 0,
          ],
        type: fastify.db.QueryTypes.SELECT,
    });
    return result[0];
  } catch (error) {
    errorLogger(
      fastify,
      error.message,
      "DB ERROR ->> repository/TableVirtual.js ->> virtualPartnershipQuery",
      request
    );
    throw new Error(error.message);
  }
};
const comStatusUpdateQuery = async (data, request, fastify) => {
  try {
    const result = await fastify.db.query(
      `UPDATE "tblCommentaries" SET 
        "wrCommentaryStatus" = $1
      WHERE "wrCommentaryId" = $2 AND "wrIsDelete" = false
      RETURNING
        "wrCommentaryId" as "commentaryId",
        "wrTossWonBy" as "tossWonBy",
        "wrChoseTo" as "choseTo",
        "wrDisplayStatus" as "displayStatus",
        "wrRmk" as "rmk",
        "wrCommentaryStatus" as "commentaryStatus"`,
      {
        bind: [
          data.commentaryStatus,
          data.commentaryId,
        ],
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableCommentary.js/virtualEventTossQuery",
      request
    );
    throw new Error(err.message);
  }
};
const saveComCardQuery = async (data, request, fastify) => {
  try {
    let values = data.cards.map((item) => {
      return `(${data.commentaryId}, '${item.key}', '${item.value}', ${item.count})`;
    }).join(", ");
    // console.log("values", values);
    const result = await fastify.db.query(
      `
        INSERT INTO "tblCommentaryCards"
        (
          "wrCommentaryId",
          "wrKey",
          "wrValue",
          "wrCount"
        )
        VALUES ${values}
      `,
      {
        type: fastify.db.QueryTypes.UPDATE,
      }
    );
    return result[0];
  } catch (err) {
    console.log(err);
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableVirtual.js/saveComCardQuery",
      request
    );
    throw new Error(err.message);
  }
};
module.exports = {
  virtualOverQuery,
  virtualBallByBallQuery,
  virtualPartnershipQuery,
  comStatusUpdateQuery,
  saveComCardQuery
};
