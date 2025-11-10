const { getAutoUpdatePlayerStatisticsDataQuery, insertCommentaryPlayerBattingHistoryQuery, insertCommentaryPlayerBowlingHistoryQuery, getCommentaryPlayerBattingHistoryByCommentaryPlayerCountQuery, getCommentaryPlayerBowlingHistoryByCommentaryPlayerCountQuery } = require("../repository/TableAutoUpdatePlayerStatisticsData");
const { updateAutoUpdatePlayerStatisticsDataService } = require("../services/autoUpdatePlayerStatisticsData");
const { errorLogger } = require("./logger");

const autoUpdatePlayerStatisticsDataProcess = async (fastify) => {
    let updateDataId = 0;
    try {
        const whereCondition = `"wrStartTime" IS NULL`;
        const orderType = `ASC`;
        const limit = 1;
        const getAutoUpdatePlayerStatisticsData = await getAutoUpdatePlayerStatisticsDataQuery(fastify, null, whereCondition, orderType, limit);
        if (getAutoUpdatePlayerStatisticsData?.[0]) {
            const { id, commentaryId, commentaryPlayerId, playerId } = getAutoUpdatePlayerStatisticsData?.[0];
            updateDataId = id;

            await updateAutoUpdatePlayerStatisticsDataService({
                body: {
                    id,
                    startTime: new Date()
                }
            }, fastify);

            const getPlayerId = global.tblPlayers.find(item => item.playerId === playerId)?.playerId;
            const getCommentaryPlayerId = global.tblCommentaryPlayers.find(item => item.commentaryPlayerId === commentaryPlayerId)?.playerId;
            const getCommentaryData = global.tblCommentaries.find(item => item.commentaryId === commentaryId);

            if (!getPlayerId || !getCommentaryPlayerId || !getCommentaryData) {
                await updateAutoUpdatePlayerStatisticsDataService({
                    body: {
                        id,
                        endTime: new Date()
                    }
                }, fastify);
                errorLogger(fastify, `PlayerId or CommentaryPlayerId or CommentaryData not found of ID: ${id}`, `utilities/autoUpdatePlayerStatisticsData.js/autoUpdatePlayerStatisticsData`, null);
                return;
            }

            // Batting stats
            const batPlayer = global.tblCommentaryPlayers.filter(
                item => item.playerId === playerId &&
                    item.commentaryId === commentaryId &&
                    item.batBall !== null
            );

            if (batPlayer.length > 0) {
                const getCommentaryPlayerBattingHistoryCount = await getCommentaryPlayerBattingHistoryByCommentaryPlayerCountQuery({
                    body: {
                        matchTypeId: getCommentaryData.matchTypeId,
                        playerId,
                        commentaryId
                    }
                }, fastify);

                if (getCommentaryPlayerBattingHistoryCount === 0) {
                    const batInningCount = batPlayer.filter(it => it.isInPlayingEleven).length;
                    const totalRuns = batPlayer.reduce((acc, it) => acc + (it.batRun || 0), 0);
                    const ballsFaced = batPlayer.reduce((acc, it) => acc + (it.batBall || 0), 0);
                    const notOut = batPlayer.filter(it => !it.isBatterOut).length;
                    const outs = Math.max(batInningCount - notOut, 0);

                    const average = outs > 0 ? totalRuns / outs : totalRuns;
                    const strikeRate = ballsFaced > 0 ? (totalRuns / ballsFaced) * 100 : 0;

                    const countOf4 = batPlayer.reduce((acc, it) => acc + (it.batFour || 0), 0);
                    const countOf6 = batPlayer.reduce((acc, it) => acc + (it.batSix || 0), 0);
                    const countOf50 = totalRuns >= 50 && totalRuns < 100 ? 1 : 0;
                    const countOf100 = totalRuns >= 100 ? 1 : 0;

                    const highestScore = notOut ? `${totalRuns}*` : `${totalRuns}`;

                    // const fiftyBallsArray = batPlayer
                    //     .filter(it => it.batRun >= 50)
                    //     .map(it => it.batBall)
                    //     .filter(Boolean);
                    // const hundredBallsArray = batPlayer
                    //     .filter(it => it.batRun >= 100)
                    //     .map(it => it.batBall)
                    //     .filter(Boolean);

                    const commBatHist = {
                        matchTypeId: getCommentaryData.matchTypeId,
                        matchTypeName: getCommentaryData.matchType,
                        playerId,
                        commentaryId,
                        commentaryPlayerId: batPlayer[0]?.commentaryPlayerId,
                        matchCount: 1,
                        inningsCount: batInningCount,
                        notOut,
                        totalRuns,
                        highestScore,
                        average,
                        ballsFacedCount: ballsFaced,
                        strikeRate,
                        countOf100,
                        countOf50,
                        countOf4,
                        countOf6,
                        catchCount: 0,
                        stumpCount: 0,
                        outCount: outs,
                        createdBy: -3,
                        // fastest50Balls: fiftyBallsArray.length > 0 ? Math.min(...fiftyBallsArray) : 0,
                        // fastest100Balls: hundredBallsArray.length > 0 ? Math.min(...hundredBallsArray) : 0
                    };

                    await insertCommentaryPlayerBattingHistoryQuery(commBatHist, fastify);
                }


                await fastify.db.query(
                    `CALL sp_calculate_and_upsert_player_batting_history(:playerId, :matchTypeId)`,
                    {
                        replacements: {
                            playerId: playerId,
                            matchTypeId: getCommentaryData.matchTypeId,
                        },
                        type: fastify.db.QueryTypes.RAW,
                    }
                );
            }

            // Bowling stats
            const bowlPlayer = global.tblCommentaryPlayers.filter(
                item => item.playerId === playerId &&
                    item.commentaryId === commentaryId &&
                    item.bowlerTotalBall !== null
            );

            if (bowlPlayer.length > 0) {
                const getCommentaryPlayerBowlingHistoryCount = await getCommentaryPlayerBowlingHistoryByCommentaryPlayerCountQuery({
                    body: {
                        matchTypeId: getCommentaryData.matchTypeId,
                        playerId,
                        commentaryId
                    }
                }, fastify);

                if (getCommentaryPlayerBowlingHistoryCount === 0) {
                    const comPlayerIds = bowlPlayer.map(it => it.commentaryPlayerId);
                    const overs = global.tblOvers.filter(
                        o => o.commentaryId === commentaryId && comPlayerIds.includes(o.bowlerId)
                    );

                    const totalWickets = overs.reduce((a, o) => a + (o.totalWicket || 0), 0);
                    const totalRuns = overs.reduce((a, o) => a + (o.totalRun || 0), 0);
                    const totalBalls = overs.reduce((a, o) => a + (o.ballCount || 0), 0);

                    const oversCount = totalBalls > 0 ? Math.floor(totalBalls / 6) + ((totalBalls % 6) / 10) : 0;
                    const economy = oversCount > 0 ? totalRuns / oversCount : 0;
                    const average = totalWickets > 0 ? totalRuns / totalWickets : 0;
                    const strikeRate = totalWickets > 0 ? totalBalls / totalWickets : 0;

                    const innings = [1, 2].map(inn => {
                        const filtered = overs.filter(o => o.currentInnings === inn);
                        return {
                            wickets: filtered.reduce((a, o) => a + (o.totalWicket || 0), 0),
                            runs: filtered.reduce((a, o) => a + (o.totalRun || 0), 0),
                        };
                    });

                    const [i1, i2] = innings;
                    let bestInInnings = "";
                    if (i1.wickets || i2.wickets) {
                        if (!i1.wickets) bestInInnings = `${i2.wickets}/${i2.runs}`;
                        else if (!i2.wickets) bestInInnings = `${i1.wickets}/${i1.runs}`;
                        else bestInInnings =
                            (i1.wickets > i2.wickets || (i1.wickets === i2.wickets && i1.runs < i2.runs))
                                ? `${i1.wickets}/${i1.runs}`
                                : `${i2.wickets}/${i2.runs}`;
                    }

                    const bestInMatch = totalWickets > 0 ? `${totalWickets}/${totalRuns}` : "0";

                    const commBowlHist = {
                        matchTypeId: getCommentaryData.matchTypeId,
                        matchTypeName: getCommentaryData.matchType,
                        playerId,
                        commentaryId,
                        commentaryPlayerId: bowlPlayer[0]?.commentaryPlayerId,
                        matchCount: 1,
                        inningsCount: bowlPlayer.filter(it => it.isInPlayingEleven).length,
                        ballCount: totalBalls,
                        runsFromBowler: totalRuns,
                        wicketsCount: totalWickets,
                        bowlerAverage: average,
                        bestBowlingInInnings: bestInInnings,
                        bestBowlingInMatch: bestInMatch,
                        economy,
                        bowlerStrikeRate: strikeRate,
                        wickets4: totalWickets === 4 ? 1 : 0,
                        wickets5: totalWickets === 5 ? 1 : 0,
                        wickets10: totalWickets >= 10 ? 1 : 0,
                        catchCount: 0,
                        createdBy: -3,
                        overCount: oversCount
                    };

                    await insertCommentaryPlayerBowlingHistoryQuery(commBowlHist, fastify);
                }

                await fastify.db.query(
                    `CALL sp_calculate_and_upsert_player_bowling_history(:playerId, :matchTypeId)`,
                    {
                        replacements: {
                            playerId: playerId,
                            matchTypeId: getCommentaryData.matchTypeId,
                        },
                        type: fastify.db.QueryTypes.RAW,
                    }
                );
            }

            await updateAutoUpdatePlayerStatisticsDataService({
                body: {
                    id,
                    endTime: new Date(),
                    status: true
                }
            }, fastify);
        }
    } catch (error) {
        const errorData = {
            id: updateDataId,
            endTime: new Date(),
            status: false
        }
        await updateAutoUpdatePlayerStatisticsDataService({
            body: errorData
        }, fastify);
        errorLogger(fastify, error.message, `utilities/autoUpdatePlayerStatisticsData.js/autoUpdatePlayerStatisticsData`, null, errorData);
    }
}

module.exports = {
    autoUpdatePlayerStatisticsDataProcess
}