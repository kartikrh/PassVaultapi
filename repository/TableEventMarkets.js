const { MarketUpdateType, EventMarketStatus } = require("../utilities");
const { errorLogger, marketDataLogger } = require("../utilities/logger");

const getAllEventMarketsQuery = async (fastify) => {
    return await fastify.db.query(
        `SELECT
        "wrID" AS "eventMarketId",
        tem."wrCommentaryId" AS "commentaryId",
        tem."wrEventRefID" AS "eventRefId",
        tc."wrEventName" AS "eventName",
        tc."wrEventDate" AS "eventDate",
        tcom."wrCompetition" AS "competitionName",
        tet."wrEventType" AS "eventTypeName",
        "wrTeamID" AS "teamId",
        "wrInningsID" AS "inningsId",
        "wrMarketName" AS "marketName",
        "wrMargin" AS "margin",
        "wrStatus" AS "status",
        "wrIsPredefineMarket" as "isPredefineMarket",
        "wrIsPreMatchOnly" as "isPreMatchOnly",
        "wrIsPreMatchMarket" as "isPreMatchMarket",
        "wrIsOver" as "isOver",
        "wrOver" as "over",
        "wrIsPlayer" as "isPlayer",
        "wrPlayerID" as "playerId",
        "wrIsAutoCancel" as "isAutoCancel",
        "wrAutoOpenType" as "autoOpenType", 
        "wrAutoOpen" as "autoOpen",
        "wrAutoCloseType" as "autoCloseType",
        "wrBeforeAutoClose" as "beforeAutoClose",
        "wrAutoSuspendType" as "autoSuspendType",
        "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
        "wrIsBallStart" as "isBallStart",
        "wrIsAutoResultSet" as "isAutoResultSet",
        "wrAutoResultType" as "autoResultType",
        "wrAutoResultafterBall" as "autoResultafterBall",	
        "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",	
        "wrAfterWicketNotCreated" as "afterWicketNotCreated",
        tem."wrIsActive" as "isActive",	
        "wrIsAllow" as "isAllow",
        "wrCloseTime" as "closeTime",
        "wrOpenTime" as "openTime",
        "wrSettledTime" as "settledTime",
        "wrResult" as "result",
        "wrIsResult" as "isResult",
        "wrData" as "data",
        tem."wrLastUpdate" as "lastUpdate",
        "wrIsSendData" as "isSendData",
        tr."wrRunnerId" as "runnerId",
        tr."wrRunner" as "runner",
        tr."wrLine" as "line",
        tr."wrOverRate" as "overRate",
        tr."wrUnderRate" as "underRate",
        tr."wrYesRate" as "yesRate",
        tr."wrYesPoint" as "yesPoint",
        tr."wrNoRate" as "noRate",
        tr."wrNoPoint" as "noPoint",
        tr."wrLastUpdate" as "runnerLastUpdate",
        tr."wrSelectionId" as "selectionId",
        tr."wrSelectionStatus" as "selectionStatus"
    FROM "tblEventMarkets" tem
    LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
    LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
    LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId"
   LEFT JOIN "tblMarketRunners" tr ON tr."wrEventMarketId" = tem."wrID"`,
        {
            type: fastify.db.QueryTypes.SELECT,
        }
    );
};

const createManyEventMarketQuery = async (data,request,fastify) => {
    try {
        const values = data.map((item) => {
            return `(
                ${item.commentaryId},
                '${item.eventRefId}',
                ${item.teamId},
                ${item.inningsId},
                '${item.marketName}',
                ${item.margin},
                ${item.status},
                ${item.isPredefineMarket},
                ${item.isPreMatchOnly},
                ${item.isPreMatchMarket},
                ${item.isOver},
                ${item.over},
                ${item.isPlayer},
                ${item.playerId},
                ${item.isAutoCancel},
                ${item.autoOpenType},
                ${item.autoOpen},
                ${item.autoCloseType},
                ${item.beforeAutoClose},
                ${item.autoSuspendType},
                ${item.beforeAutoSuspend},
                ${item.isBallStart},
                ${item.isAutoResultSet},
                ${item.autoResultType},
                ${item.autoResultafterBall},
                ${item.afterWicketAutoSuspend},
                ${item.afterWicketNotCreated},
                ${item.isActive},
                ${item.isAllow},
                now()::timestamp,
                '${item.data}',
                now()::timestamp
            )`;
        }).join(',');

        const query = `INSERT INTO "tblEventMarkets"(
            "wrCommentaryId",
            "wrEventRefID",
            "wrTeamID",
            "wrInningsID",
            "wrMarketName",
            "wrMargin",
            "wrStatus",
            "wrIsPredefineMarket",
            "wrIsPreMatchOnly",
            "wrIsPreMatchMarket",
            "wrIsOver",
            "wrOver",
            "wrIsPlayer",
            "wrPlayerID",
            "wrIsAutoCancel",
            "wrAutoOpenType",
            "wrAutoOpen",
            "wrAutoCloseType",
            "wrBeforeAutoClose",
            "wrAutoSuspendType",
            "wrBeforeAutoSuspend",
            "wrIsBallStart",
            "wrIsAutoResultSet",
            "wrAutoResultType",
            "wrAutoResultafterBall",
            "wrAfterWicketAutoSuspend",
            "wrAfterWicketNotCreated",
            "wrIsActive",
            "wrIsAllow",
            "wrOpenTime",
            "wrData",
            "wrLastUpdate"
        ) VALUES ${values} 
        RETURNING "wrID" as "eventMarketId"`;


        // create market runners for each market


    
        return await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });
    } catch (err) {
        console.log(err);
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableEventmarket.js/createManyEventMarketQuery",
            request
          );
        throw new Error(err.message);
    }
}
const updateEventMarketQuery = async (data,request,fastify ) => {
    try {
        const eventMarket = await fastify.db.query(
            `
            UPDATE "tblEventMarkets"
            SET
            "wrCommentaryId" = $1,
            "wrEventRefID" = $2,
            "wrTeamID" = $3,
            "wrInningsID" = $4,
            "wrMarketName" = $5,
            "wrMargin" = $6,
            "wrStatus" = $7,
            "wrIsPredefineMarket" = $8,
            "wrIsPreMatchOnly" = $9,
            "wrIsPreMatchMarket" = $10,
            "wrIsOver" = $11,
            "wrOver" = $12,
            "wrIsPlayer" = $13,
            "wrPlayerID" = $14,
            "wrIsAutoCancel" = $15,
            "wrAutoOpenType" = $16,
            "wrAutoOpen" = $17,
            "wrAutoCloseType" = $18,
            "wrBeforeAutoClose" = $19,
            "wrAutoSuspendType" = $20,
            "wrBeforeAutoSuspend" = $21,
            "wrIsBallStart" = $22,
            "wrIsAutoResultSet" = $23,
            "wrAutoResultType" = $24,
            "wrAutoResultafterBall" = $25,
            "wrAfterWicketAutoSuspend" = $26,
            "wrAfterWicketNotCreated" = $27,
            "wrIsActive" = $28,
            "wrIsAllow" = $29,
            "wrData" = $30,
            "wrLastUpdate" = now()::timestamp
            WHERE "wrID" = $31`,
            {
                bind: [
                    data.commentaryId,
                    data.eventRefId,
                    data.teamId,
                    data.inningsId,
                    data.marketName,
                    data.margin,
                    data.status,
                    data.isPredefineMarket,
                    data.isPreMatchOnly,
                    data.isPreMatchMarket,
                    data.isOver,
                    data.over,
                    data.isPlayer,
                    data.playerId,
                    data.isAutoCancel,
                    data.autoOpenType,
                    data.autoOpen,
                    data.autoCloseType,
                    data.beforeAutoClose,
                    data.autoSuspendType,
                    data.beforeAutoSuspend,
                    data.isBallStart,
                    data.isAutoResultSet,
                    data.autoResultType,
                    data.autoResultafterBall,
                    data.afterWicketAutoSuspend,
                    data.afterWicketNotCreated,
                    data.isActive,
                    data.isAllow,
                    data.data,
                    data.eventMarketId
                ],
                type: fastify.db.QueryTypes.SELECT
        });
        // update market runners for this market
        const query2 = `UPDATE "tblMarketRunners" SET
            "wrRunner" = $1,
            "wrLine" = $2,
            "wrOverRate" = $3,
            "wrUnderRate" = $4,
            "wrYesRate" = $5,
            "wrYesPoint" = $6,
            "wrNoRate" = $7,
            "wrNoPoint" = $8,
            "wrLastUpdate" = now()::timestamp,
            "wrSelectionStatus" = $9,
            "wrSelectionId" = $10
            WHERE "wrEventMarketId" = $11
            RETURNING 
                "wrRunnerId" as "runnerId",
                "wrEventMarketId" as "eventMarketId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrYesRate" as "yesRate",
                "wrYesPoint" as "yesPoint",
                "wrNoRate" as "noRate",
                "wrNoPoint" as "noPoint",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "selectionStatus"
        `;

        const marketRunner =  await fastify.db.query(query2, {
            bind: [
                `${data.marketName} Bet`,
                data.line || 0,
                data.overRate || 0,
                data.underRate || 0,
                data.yesRate || 0,
                data.yesPoint || 0,
                data.noRate || 0,
                data.noPoint || 0,
                data.status,
                `${data.eventMarketId}01`,
                data.eventMarketId
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        // update wrData using runnertable
        const dataToStore = marketRunner[0];

        const query3 = `UPDATE "tblEventMarkets" SET "wrData" = $1 WHERE "wrID" = $2`;
        await fastify.db.query(query3, {
            bind: [
                JSON.stringify(dataToStore),
                data.eventMarketId
            ],
            type: fastify.db.QueryTypes.SELECT
        });
        marketDataLogger(
            {
                eventMarketId : data.eventMarketId,
                commentaryId: data.commentaryId,
                dataTosave: dataToStore,
                updateType: MarketUpdateType.marketInitilization
            },
            request,
            fastify
        );
        return eventMarket;


    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/updateEventMarketQuery",
            request
          );
        throw new Error(error.message);
        
    }
}
const createEventMarketQuery = async (data,request,fastify) => {
    try {
        const query = `INSERT INTO "tblEventMarkets"(
            "wrCommentaryId",
            "wrEventRefID",
            "wrTeamID",
            "wrInningsID",
            "wrMarketName",
            "wrMargin",
            "wrStatus",
            "wrIsPredefineMarket",
            "wrIsPreMatchOnly",
            "wrIsPreMatchMarket",
            "wrIsOver",
            "wrOver",
            "wrIsPlayer",
            "wrPlayerID",
            "wrIsAutoCancel",
            "wrAutoOpenType",
            "wrAutoOpen",
            "wrAutoCloseType",
            "wrBeforeAutoClose",
            "wrAutoSuspendType",
            "wrBeforeAutoSuspend",
            "wrIsBallStart",
            "wrIsAutoResultSet",
            "wrAutoResultType",
            "wrAutoResultafterBall",
            "wrAfterWicketAutoSuspend",
            "wrAfterWicketNotCreated",
            "wrIsActive",
            "wrIsAllow",
            "wrOpenTime",
            "wrData",
            "wrLastUpdate"
        ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,
            $16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,now()::timestamp,$30,now()::timestamp
        ) RETURNING "wrID" as "eventMarketId"
        `;
     
        const eventMarket =  await fastify.db.query(query, {
            bind: [
                data.commentaryId,
                data.eventRefId,
                data.teamId,
                data.inningsId,
                data.marketName,
                data.margin,
                data.status,
                data.isPredefineMarket,
                data.isPreMatchOnly,
                data.isPreMatchMarket,
                data.isOver,
                data.over,
                data.isPlayer,
                data.playerId,
                data.isAutoCancel,
                data.autoOpenType,
                data.autoOpen,
                data.autoCloseType,
                data.beforeAutoClose,
                data.autoSuspendType,
                data.beforeAutoSuspend,
                data.isBallStart,
                data.isAutoResultSet,
                data.autoResultType,
                data.autoResultafterBall,
                data.afterWicketAutoSuspend,
                data.afterWicketNotCreated,
                data.isActive,
                data.isAllow,
                data.data
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        const eventMarketId = eventMarket[0].eventMarketId;

        // create market runners for each market
        const query2 = `INSERT INTO "tblMarketRunners"(
            "wrEventMarketId",
            "wrRunner",
            "wrLine",
            "wrOverRate",
            "wrUnderRate",
            "wrYesRate",
            "wrYesPoint",
            "wrNoRate",
            "wrNoPoint",
            "wrLastUpdate",
            "wrSelectionId",
            "wrSelectionStatus"
        ) VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,now(),$10,$11
        )
        RETURNING "wrRunnerId" as "runnerId",
            "wrEventMarketId" as "eventMarketId",
            "wrRunner" as "runner",
            "wrLine" as "line",
            "wrOverRate" as "overRate",
            "wrUnderRate" as "underRate",
            "wrYesRate" as "yesRate",
            "wrYesPoint" as "yesPoint",
            "wrNoRate" as "noRate",
            "wrNoPoint" as "noPoint",
            "wrLastUpdate" as "lastUpdate",
            "wrSelectionId" as "selectionId",
            "wrSelectionStatus" as "selectionStatus"    
        `;

        let marketRunner = await fastify.db.query(query2, {
            bind: [
                eventMarketId,
                `${data.marketName} Bet`,
                data.line || 0,
                data.overRate || 0,
                data.underRate || 0,
                data.yesRate || 0,
                data.yesPoint || 0,
                data.noRate || 0,
                data.noPoint || 0,
                `${eventMarketId}01`,
                data.status
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        // update wrData using runnertable

        const dataToStore = marketRunner[0];

        const query3 = `UPDATE "tblEventMarkets" SET "wrData" = $1 WHERE "wrID" = $2`;
        await fastify.db.query(query3, {
            bind: [
                JSON.stringify(dataToStore),
                eventMarketId
            ],
            type: fastify.db.QueryTypes.SELECT
        });

        // add log for market creation
        marketDataLogger(
            {
                eventMarketId,
                commentaryId: data.commentaryId,
                dataTosave: dataToStore,
                updateType: MarketUpdateType.marketInitilization
            },
            request,
            fastify
        );

        return eventMarket;
    }catch (error) {
        console.log(error);
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/createEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }   
}
const deleteEventMarketQuery = async (data,request,fastify) => {
    try {
        return await fastify.db.query(
            `DELETE FROM "tblEventMarkets" WHERE "wrID" = ANY($1)`,
            {
                bind: [data],
                type: fastify.db.QueryTypes.SELECT
            });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/deleteEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }
}
const changeIsActiveEventMarketQuery = async (data,request,fastify) => {
    try {
        const query = `UPDATE "tblEventMarkets" SET "wrIsActive" = $1 WHERE "wrID" = $2`;
        return await fastify.db.query(query, {
            bind: [data.isActive, data.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
        });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/changeIsActiveEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }
}
const changeIsAllowEventMarketQuery = async (data,request,fastify) => {
    try {
        const query = `UPDATE "tblEventMarkets" SET "wrIsAllow" = $1 WHERE "wrID" = $2`;
        return await fastify.db.query(query, {
            bind: [data.isAllow, data.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
        });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/changeIsAllowEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }
}
const changeIsResultEventMarketQuery = async (data,request,fastify) => {
    try {
        const query = `UPDATE "tblEventMarkets" SET "wrIsResult" = $1 WHERE "wrID" = $2`;
        return await fastify.db.query(query, {
            bind: [data.isResult, data.eventMarketId],
            type: fastify.db.QueryTypes.SELECT
        });
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/changeIsResultEventMarketQuery",
            request
          );
        throw new Error(error.message);
    }
}
const getMarketListByCIdQuery = async (data,request,fastify) => {
    try {
        const {commentaryId} = data;

        const query = `WITH "MarketRunners_CTE" AS (
            SELECT 
                "wrEventMarketId" as "eventMarketId",
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrYesRate" as "yesRate",
                "wrYesPoint" as "yesPoint",
                "wrNoRate" as "noRate",
                "wrNoPoint" as "noPoint",
                "wrLastUpdate" as "lastUpdate",
                "wrSelectionId" as "selectionId",
                "wrSelectionStatus" as "selectionStatus"
            FROM "tblMarketRunners"
        )
        SELECT
            "wrID" AS "eventMarketId",
            tem."wrCommentaryId" AS "commentaryId",
            tem."wrEventRefID" AS "eventRefId",
            tc."wrEventName" AS "eventName",
            tc."wrEventDate" AS "eventDate",
            tcom."wrCompetition" AS "competitionName",
            tet."wrEventType" AS "eventTypeName",
            "wrTeamID" AS "teamId",
            "wrInningsID" AS "inningsId",
            "wrMarketName" AS "marketName",
            "wrMargin" AS "margin",
            "wrStatus" AS "status",
            "wrIsPredefineMarket" as "isPredefineMarket",
            "wrIsPreMatchOnly" as "isPreMatchOnly",
            "wrIsPreMatchMarket" as "isPreMatchMarket",
            "wrIsOver" as "isOver",
            "wrOver" as "over",
            "wrIsPlayer" as "isPlayer",
            "wrPlayerID" as "playerId",
            "wrIsAutoCancel" as "isAutoCancel",
            "wrAutoOpenType" as "autoOpenType", 
            "wrAutoOpen" as "autoOpen",
            "wrAutoCloseType" as "autoCloseType",
            "wrBeforeAutoClose" as "beforeAutoClose",
            "wrAutoSuspendType" as "autoSuspendType",
            "wrBeforeAutoSuspend"  as "beforeAutoSuspend",
            "wrIsBallStart" as "isBallStart",
            "wrIsAutoResultSet" as "isAutoResultSet",
            "wrAutoResultType" as "autoResultType",
            "wrAutoResultafterBall" as "autoResultafterBall",   
            "wrAfterWicketAutoSuspend" as "afterWicketAutoSuspend",   
            "wrAfterWicketNotCreated" as "afterWicketNotCreated",
            tem."wrIsActive" as "isActive", 
            "wrIsAllow" as "isAllow",
            "wrCloseTime" as "closeTime",
            "wrOpenTime" as "openTime",
            "wrSettledTime" as "settledTime",
            "wrResult" as "result",
            "wrIsResult" as "isResult",
            "wrData" as "data",
            (
                SELECT json_agg("MarketRunners_CTE".*)
                FROM "MarketRunners_CTE"
                WHERE "MarketRunners_CTE"."eventMarketId" = tem."wrID"
            ) as "marketRunners"
        FROM "tblEventMarkets" tem
        LEFT JOIN "tblCommentaries" tc ON tc."wrCommentaryId" = tem."wrCommentaryId"
        LEFT JOIN "tblCompetitions" tcom ON tcom."wrCompetitionId" = tc."wrCompetitionId"
        LEFT JOIN "tblEventTypes" tet ON tet."wrEventTypeId" = tc."wrEventTypeId" 

        WHERE tem."wrCommentaryId" = $1
        AND tem."wrStatus" NOT IN ($2 ,$3,$4)
        `;
        return await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind: [commentaryId ,
                EventMarketStatus.Close,
                EventMarketStatus.Settled,
                EventMarketStatus.Cancel
            ]
        });


        
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/getMarketListByCIdQuery",
            request
          );
        throw new Error(error.message);
    }
}
const updateEventMarketRateQuery = async (data,request,fastify) => {
    try {
        const eventMarket = await fastify.db.query(
            `
            UPDATE "tblEventMarkets"
            SET
                "wrCommentaryId" = $1,
                "wrEventRefID" = $2,
                "wrTeamID" = $3,
                "wrInningsID" = $4,
                "wrMarketName" = $5,
                "wrMargin" = $6,
                "wrStatus" = $7,
                "wrIsPredefineMarket" = $8,
                "wrIsPreMatchOnly" = $9,
                "wrIsPreMatchMarket" = $10,
                "wrIsOver" = $11,
                "wrOver" = $12,
                "wrIsPlayer" = $13,
                "wrPlayerID" = $14,
                "wrIsAutoCancel" = $15,
                "wrAutoOpenType" = $16,
                "wrAutoOpen" = $17,
                "wrAutoCloseType" = $18,
                "wrBeforeAutoClose" = $19,
                "wrAutoSuspendType" = $20,
                "wrBeforeAutoSuspend" = $21,
                "wrIsBallStart" = $22,
                "wrIsAutoResultSet" = $23,
                "wrAutoResultType" = $24,
                "wrAutoResultafterBall" = $25,
                "wrAfterWicketAutoSuspend" = $26,
                "wrAfterWicketNotCreated" = $27,
                "wrIsActive" = $28,
                "wrIsAllow" = $29,
                "wrData" = $30,
                "wrLastUpdate" = now()::timestamp
            WHERE "wrID" = $31
            RETURNING "wrID" as "eventMarketId"`,
            {
                bind: [
                    data.commentaryId,
                    data.eventRefId,
                    data.teamId,
                    data.inningsId,
                    data.marketName,
                    data.margin,
                    data.status,
                    data.isPredefineMarket,
                    data.isPreMatchOnly,
                    data.isPreMatchMarket,
                    data.isOver,
                    data.over,
                    data.isPlayer,
                    data.playerId,
                    data.isAutoCancel,
                    data.autoOpenType,
                    data.autoOpen,
                    data.autoCloseType,
                    data.beforeAutoClose,
                    data.autoSuspendType,
                    data.beforeAutoSuspend,
                    data.isBallStart,
                    data.isAutoResultSet,
                    data.autoResultType,
                    data.autoResultafterBall,
                    data.afterWicketAutoSuspend,
                    data.afterWicketNotCreated,
                    data.isActive,
                    data.isAllow,
                    data.data,
                    data.eventMarketId
                ],
                type: fastify.db.QueryTypes.SELECT
        });

        // update market runners for this market
        for(let runner of data.marketRunners){
            // update market runners for this market
            await fastify.db.query(
                `UPDATE "tblMarketRunners" SET
                "wrRunner" = $1,
                "wrLine" = $2,
                "wrOverRate" = $3,
                "wrUnderRate" = $4,
                "wrYesRate" = $5,
                "wrYesPoint" = $6,
                "wrNoRate" = $7,
                "wrNoPoint" = $8,
                "wrLastUpdate" = now()::timestamp,
                "wrSelectionStatus" = $9,
                "wrSelectionId" = $10
                WHERE "wrRunnerId" = $11
                `,
                {
                    bind: [
                        runner.runner,
                        runner.line || 0,
                        runner.overRate || 0,
                        runner.underRate || 0,
                        runner.yesRate || 0,
                        runner.yesPoint || 0,
                        runner.noRate || 0,
                        runner.noPoint || 0,
                        runner.selectionStatus,
                        runner.selectionId,
                        runner.runnerId
                    ],
                    type: fastify.db.QueryTypes.SELECT
                }
            );
        }

        return eventMarket;
    } catch (error) {
        console.log(error);
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableEventmarket.js/updateEventMarketRateQuery",
            request
          );
        throw new Error(error.message);
    }
}
module.exports = {
    getAllEventMarketsQuery,
    createManyEventMarketQuery,
    updateEventMarketQuery,
    deleteEventMarketQuery,
    changeIsActiveEventMarketQuery,
    changeIsAllowEventMarketQuery,
    changeIsResultEventMarketQuery,
    createEventMarketQuery,
    getMarketListByCIdQuery,
    updateEventMarketRateQuery
};
