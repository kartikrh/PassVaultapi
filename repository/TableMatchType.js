const { errorLogger } = require("../utilities/logger");

const getAllMatchTypeQuery = async (fastify) => {
  return await fastify.db.query(
    `select
        "wrMatchTypeId" as "matchTypeId",
        "wrMatchType" as "matchType",
        "wrMatchRefType" as "matchRefType",
        "wrNoOfIningsPerSide" as "noOfIningsPerSide",
        "wrNoOfDays" as "noOfDays",
        "wrNoOfPlayer" as "noOfPlayer",
        "wrSubstitutesPlayer" as "substitutesPlayer",
        "wrIsLastManStand" as "isLastManStand",
        "wrIsLimitedOvers" as "isLimitedOvers",
        "wrTakeNewBallAfterOvers" as "takeNewBallAfterOvers",
        "wrOversInLastHour" as "oversInLastHour",
        "wrTotalOversInMatch" as "totalOversInMatch",
        "wrOversPerDay" as "oversPerDay",
        "wrMaxOversInFirstInings" as "maxOversInFirstInings",
        "wrMaxOversInSecondInings" as "maxOversInSecondInings",
        "wrIsBowlersLimitedOvers" as "isBowlersLimitedOvers",
        "wrOversPerBowler" as "oversPerBowler",
        "wrIsPowerPlay" as "isPowerPlay",
        "wrTotalPowerPlay" as "totalPowerPlay",
        "wrIsExtraInings" as "isExtraInings",
        "wrOversPerInings" as "oversPerInings", 
        "wrBatsmenPerInings" as "batsmenPerInings",
        "wrBallsPerOver" as "ballsPerOver",
        "wrValueOfNoBall" as "valueOfNoBall",
        "wrIsExtraBallWhenNoBall" as "isExtraBallWhenNoBall",
        "wrValueOfNoBallInLastOver" as "valueOfNoBallInLastOver",
        "wrIsExtraBallWhenNoBallInLastOver" as "isExtraBallWhenNoBallInLastOver",
        "wrValueOfWideBall" as "valueOfWideBall",
        "wrIsExtraBallWhenWideBall" as "isExtraBallWhenWideBall",
        "wrValueOfWideBallInLastOver" as "valueOfWideBallInLastOver",
        "wrIsExtraBallWhenWideBallInLastOver" as "isExtraBallWhenWideBallInLastOver",
        "wrIsWideBallCountInPartnership" as "isWideBallCountInPartnership",
        "wrIsPenaltyRunsInPartnership" as "isPenaltyRunsInPartnership",
        "wrValueOfFrontFootNoBall" as "valueOfFrontFootNoBall",
        "wrIsStrikeChangeonOverComplete" as "isStrikeChangeonOverComplete"
        from "tblMatchTypes"`,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertMatchTypeQuery = async (data, fastify, request) => {
  try {
    const result = await fastify.db.query(
      `
    with insert_data as (
      insert into "tblMatchTypes" (
        "wrMatchType",
        "wrMatchRefType",
        "wrNoOfIningsPerSide",
        "wrNoOfDays",
        "wrNoOfPlayer",
        "wrSubstitutesPlayer",
        "wrIsLastManStand",
        "wrIsLimitedOvers",
        "wrTakeNewBallAfterOvers",
        "wrOversInLastHour",
        "wrTotalOversInMatch",
        "wrOversPerDay",
        "wrMaxOversInFirstInings",
        "wrMaxOversInSecondInings",
        "wrIsBowlersLimitedOvers",
        "wrOversPerBowler",
        "wrIsPowerPlay",
        "wrTotalPowerPlay",
        "wrIsExtraInings",
        "wrOversPerInings",
        "wrBatsmenPerInings",
        "wrBallsPerOver",
        "wrValueOfNoBall",
        "wrIsExtraBallWhenNoBall",
        "wrValueOfNoBallInLastOver",
        "wrIsExtraBallWhenNoBallInLastOver",
        "wrValueOfWideBall",
        "wrIsExtraBallWhenWideBall",
        "wrValueOfWideBallInLastOver",
        "wrIsExtraBallWhenWideBallInLastOver",
        "wrIsWideBallCountInPartnership",
        "wrIsPenaltyRunsInPartnership",
        "wrValueOfFrontFootNoBall",
        "wrCreatedBy",
        "wrCreatedDate",
        "wrIsStrikeChangeonOverComplete"
      ) values ( 
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,
        $29,$30,$31,$32,$33,$34,$35,$36       
      ) returning *
    )

    select
        "wrMatchTypeId" as "matchTypeId",
        "wrMatchType" as "matchType",
        "wrMatchRefType" as "matchRefType",
        "wrNoOfIningsPerSide" as "noOfIningsPerSide",
        "wrNoOfDays" as "noOfDays",
        "wrNoOfPlayer" as "noOfPlayer",
        "wrSubstitutesPlayer" as "substitutesPlayer",
        "wrIsLastManStand" as "isLastManStand",
        "wrIsLimitedOvers" as "isLimitedOvers",
        "wrTakeNewBallAfterOvers" as "takeNewBallAfterOvers",
        "wrOversInLastHour" as "oversInLastHour",
        "wrTotalOversInMatch" as "totalOversInMatch",
        "wrOversPerDay" as "oversPerDay",
        "wrMaxOversInFirstInings" as "maxOversInFirstInings",
        "wrMaxOversInSecondInings" as "maxOversInSecondInings",
        "wrIsBowlersLimitedOvers" as "isBowlersLimitedOvers",
        "wrOversPerBowler" as "oversPerBowler",
        "wrIsPowerPlay" as "isPowerPlay",
        "wrTotalPowerPlay" as "totalPowerPlay",
        "wrIsExtraInings" as "isExtraInings",
        "wrOversPerInings" as "oversPerInings", 
        "wrBatsmenPerInings" as "batsmenPerInings",
        "wrBallsPerOver" as "ballsPerOver",
        "wrValueOfNoBall" as "valueOfNoBall",
        "wrIsExtraBallWhenNoBall" as "isExtraBallWhenNoBall",
        "wrValueOfNoBallInLastOver" as "valueOfNoBallInLastOver",
        "wrIsExtraBallWhenNoBallInLastOver" as "isExtraBallWhenNoBallInLastOver",
        "wrValueOfWideBall" as "valueOfWideBall",
        "wrIsExtraBallWhenWideBall" as "isExtraBallWhenWideBall",
        "wrValueOfWideBallInLastOver" as "valueOfWideBallInLastOver",
        "wrIsExtraBallWhenWideBallInLastOver" as "isExtraBallWhenWideBallInLastOver",
        "wrIsWideBallCountInPartnership" as "isWideBallCountInPartnership",
        "wrIsPenaltyRunsInPartnership" as "isPenaltyRunsInPartnership",
        "wrValueOfFrontFootNoBall" as "valueOfFrontFootNoBall"
        from "insert_data"
    `,
      {
        bind: [
          data.matchType || null,
          data.matchRefType || null,
          data.noOfIningsPerSide || 0,
          data.noOfDays || 0,
          data.noOfPlayer || 0,
          data.substitutesPlayer || 0,
          data.isLastManStand || false,
          data.isLimitedOvers || false,
          data.takeNewBallAfterOvers || 0,
          data.oversInLastHour || 0,
          data.totalOversInMatch || 0,
          data.oversPerDay || 0,
          data.maxOversInFirstInings || 0,
          data.maxOversInSecondInings || 0,
          data.isBowlersLimitedOvers || false,
          data.oversPerBowler || 0,
          data.isPowerPlay || false,
          data.totalPowerPlay || 0,
          data.isExtraInings || false,
          data.oversPerInings || 0,
          data.batsmenPerInings || 0,
          data.ballsPerOver || 0,
          data.valueOfNoBall || 0,
          data.isExtraBallWhenNoBall || false,
          data.valueOfNoBallInLastOver || 0,
          data.isExtraBallWhenNoBallInLastOver || false,
          data.valueOfWideBall || 0,
          data.isExtraBallWhenWideBall || false,
          data.valueOfWideBallInLastOver || 0,
          data.isExtraBallWhenWideBallInLastOver || false,
          data.isWideBallCountInPartnership || false,
          data.isPenaltyRunsInPartnership || false,
          data.valueOfFrontFootNoBall || 0,
          data.userId,
          new Date(),
          data.isStrikeChangeonOverComplete || true,
        ],
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMatchType/insertMatchTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteMatchTypeQuery = async (matchTypeId, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblMatchTypes" where "wrMatchTypeId" = ANY($1)`,
      {
        bind: [matchTypeId],
        type: fastify.db.QueryTypes.DELETE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMatchType/deleteMatchTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};
const deleteMatchTypePredictorQuery = async (matchTypeId, fastify, request) => {
  try {
    return await fastify.db.query(
      `delete from "tblMatchTypePredictors" where "wrMatchTypeId" = ANY($1)`,
      {
        bind: [matchTypeId],
        type: fastify.db.QueryTypes.DELETE,
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMatchType/deleteMatchTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateMatchTypeQuery = async (data, fastify, request) => {
  try {
    const columnMapping = {
      matchType: "wrMatchType",
      matchRefType: "wrMatchRefType",
      noOfIningsPerSide: "wrNoOfIningsPerSide",
      noOfDays: "wrNoOfDays",
      noOfPlayer: "wrNoOfPlayer",
      substitutesPlayer: "wrSubstitutesPlayer",
      isLastManStand: "wrIsLastManStand",
      isLimitedOvers: "wrIsLimitedOvers",
      takeNewBallAfterOvers: "wrTakeNewBallAfterOvers",
      oversInLastHour: "wrOversInLastHour",
      totalOversInMatch: "wrTotalOversInMatch",
      oversPerDay: "wrOversPerDay",
      maxOversInFirstInings: "wrMaxOversInFirstInings",
      maxOversInSecondInings: "wrMaxOversInSecondInings",
      isBowlersLimitedOvers: "wrIsBowlersLimitedOvers",
      oversPerBowler: "wrOversPerBowler",
      isPowerPlay: "wrIsPowerPlay",
      totalPowerPlay: "wrTotalPowerPlay",
      isExtraInings: "wrIsExtraInings",
      oversPerInings: "wrOversPerInings",
      batsmenPerInings: "wrBatsmenPerInings",
      ballsPerOver: "wrBallsPerOver",
      valueOfNoBall: "wrValueOfNoBall",
      isExtraBallWhenNoBall: "wrIsExtraBallWhenNoBall",
      valueOfNoBallInLastOver: "wrValueOfNoBallInLastOver",
      isExtraBallWhenNoBallInLastOver: "wrIsExtraBallWhenNoBallInLastOver",
      valueOfWideBall: "wrValueOfWideBall",
      isExtraBallWhenWideBall: "wrIsExtraBallWhenWideBall",
      valueOfWideBallInLastOver: "wrValueOfWideBallInLastOver",
      isExtraBallWhenWideBallInLastOver: "wrIsExtraBallWhenWideBallInLastOver",
      isWideBallCountInPartnership: "wrIsWideBallCountInPartnership",
      isPenaltyRunsInPartnership: "wrIsPenaltyRunsInPartnership",
      valueOfFrontFootNoBall: "wrValueOfFrontFootNoBall",
      modifyBy: "wrModifyBy",
      modifyDate: "wrModifyDate",
      isStrikeChangeonOverComplete: "wrIsStrikeChangeonOverComplete",
    };

    const updateColumns = [];
    const updateValues = [];

    for (const key in data) {
      if (columnMapping[key] !== undefined) {
        updateColumns.push(
          `"${columnMapping[key]}" = $${updateColumns.length + 1}`
        );
        updateValues.push(data[key]);
      }
    }

    updateValues.push(data.matchTypeId);

    const result = await fastify.db.query(
      `UPDATE "tblMatchTypes" SET ${updateColumns.join(
        ", "
      )} WHERE "wrMatchTypeId" =$${updateValues.length} returning 
    "wrMatchType" as "matchType",
    "wrMatchRefType" as "matchRefType",
    "wrNoOfIningsPerSide" as "noOfIningsPerSide",
    "wrNoOfDays" as "noOfDays",
    "wrNoOfPlayer" as "noOfPlayer",
    "wrSubstitutesPlayer" as "substitutesPlayer",
    "wrIsLastManStand" as "isLastManStand",
    "wrIsLimitedOvers" as "isLimitedOvers",
    "wrTakeNewBallAfterOvers" as "takeNewBallAfterOvers",
    "wrOversInLastHour" as "oversInLastHour",
    "wrTotalOversInMatch" as "totalOversInMatch",
    "wrOversPerDay" as "oversPerDay",
    "wrMaxOversInFirstInings" as "maxOversInFirstInings",
    "wrMaxOversInSecondInings" as "maxOversInSecondInings",
    "wrIsBowlersLimitedOvers" as "isBowlersLimitedOvers",
    "wrOversPerBowler" as "oversPerBowler",
    "wrIsPowerPlay" as "isPowerPlay",
    "wrTotalPowerPlay" as "totalPowerPlay",
    "wrIsExtraInings" as "isExtraInings",
    "wrOversPerInings" as "oversPerInings", 
    "wrBatsmenPerInings" as "batsmenPerInings",
    "wrBallsPerOver" as "ballsPerOver",
    "wrValueOfNoBall" as "valueOfNoBall",
    "wrIsExtraBallWhenNoBall" as "isExtraBallWhenNoBall",
    "wrValueOfNoBallInLastOver" as "valueOfNoBallInLastOver",
    "wrIsExtraBallWhenNoBallInLastOver" as "isExtraBallWhenNoBallInLastOver",
    "wrValueOfWideBall" as "valueOfWideBall",
    "wrIsExtraBallWhenWideBall" as "isExtraBallWhenWideBall",
    "wrValueOfWideBallInLastOver" as "valueOfWideBallInLastOver",
    "wrIsExtraBallWhenWideBallInLastOver" as "isExtraBallWhenWideBallInLastOver",
    "wrIsWideBallCountInPartnership" as "isWideBallCountInPartnership",
    "wrIsPenaltyRunsInPartnership" as "isPenaltyRunsInPartnership",
    "wrValueOfFrontFootNoBall" as "valueOfFrontFootNoBall",
    "wrIsStrikeChangeonOverComplete" as "isStrikeChangeonOverComplete"
    `,
      {
        bind: updateValues,
        type: fastify.db.QueryTypes.SELECT,
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableMatchType/updateMatchTypeQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllMatchTypeQuery,
  insertMatchTypeQuery,
  deleteMatchTypeQuery,
  updateMatchTypeQuery,
  deleteMatchTypePredictorQuery
};
