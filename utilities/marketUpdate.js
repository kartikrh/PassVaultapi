const { EventMarketStatus } = require(".");
const configConstants = require("./configConstants");
const { errorLogger } = require("./logger");


const updateMarket = async (fastify) => {
    // create interval and get market from db
    let intervalId;
    let getInterval = global.tblConfigs.find((config) => config.key === configConstants.GETMARKETINTERVALMIN)?.value;
    if(!getInterval){
        errorLogger(
            fastify,
            "GETMARKETINTERVAL is not defined in tblConfig",
            "utilities/marketUpdate.js",
            null
        )
    }
    getInterval = parseInt(getInterval);
    setInterval(async () => {
        try {
            // console.log('Updating market');
            let market = await fastify.db.query(
            `
                SELECT 
                    "wrID" as "eventMarketId",
                    "wrAfterSuspendTime" as "afterSuspendTime",
                    "wrAfterCloseTime" as "afterCloseTime"
                FROM "tblEventMarkets"
                WHERE "wrStatus" NOT IN ($1,$2,$3)
                AND ("wrAfterSuspendTime" is not null
                OR "wrAfterCloseTime" is not null)
                ORDER BY "wrID" ASC
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [EventMarketStatus.Cancel, EventMarketStatus.Close, EventMarketStatus.Settled]
            });
            if(market.length > 0){
                // console.log('Market to update', market);
        
                // change the market status as per time and update in db
                let intervalForCheck = global.tblConfigs.find((config) => config.key === configConstants.MARKETUPDATEINTERVALMIN)?.value;
                if(!intervalForCheck){
                    errorLogger(
                        fastify,
                        "MARKETUPDATEINTERVALMIN is not defined in tblConfig",
                        "utilities/marketUpdate.js",
                        null
                    )
                }
                intervalForCheck = parseInt(intervalForCheck);
                clearInterval(intervalId);
                intervalId = setInterval(async () => {
                    // console.log('Checking market for update');
                    if(market.length === 0){
                        clearInterval(intervalId);
                    }
                   let currentTime = new Date();
                   const marketToSuspend = market?.filter((m) => m.afterSuspendTime && new Date(m.afterSuspendTime) <= currentTime);
                   const marketToClose = market?.filter((m) => m.afterCloseTime && new Date(m.afterCloseTime) <= currentTime);
                    if(marketToSuspend.length > 0){
                          const result = await fastify.db.query(
                            `
                             UPDATE "tblEventMarkets" SET
                              "wrStatus" = $1 ,
                              "wrAfterSuspendTime" = null,
                              "wrLastUpdate" = now(),
                              "wrData" = jsonb_set(
                                    jsonb_set("wrData"::jsonb, '{status}', '3'::jsonb, false),
                                    '{runner}', (
                                    SELECT jsonb_agg(
                                        jsonb_set(runner_elem, '{status}', '3'::jsonb, false)
                                    )
                                    FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
                                    ),
                                    false
                              )::json
                             WHERE "wrID" IN (${marketToSuspend.map((m) => m.eventMarketId).join(",")})
                             AND "wrStatus" NOT IN ($2,$3,$4,$5) 
                             RETURNING 
                                "wrID" as "eventMarketId",
                                "wrStatus" as "status",
                                "wrLastUpdate" as "lastUpdate",
                                "wrData" as "data"
                            `,
                            {
                                 type: fastify.db.QueryTypes.UPDATE,
                                 bind: [EventMarketStatus.Suspend, 
                                        EventMarketStatus.Cancel,
                                        EventMarketStatus.Close,
                                        EventMarketStatus.Settled,
                                        EventMarketStatus.Suspend 
                                 ]
                            }
                          );
                          await fastify.db.query(
                            `UPDATE "tblMarketRunners"
                             SET "wrSelectionStatus" = $1
                             WHERE "wrEventMarketId" IN (${marketToSuspend.map((m) => m.eventMarketId).join(",")})`,
                            {
                                type: fastify.db.QueryTypes.UPDATE,
                                bind: [EventMarketStatus.Suspend]
                            }
                          )

                          if(result.length > 0){
                            // result.forEach((updatedItem) => {
                              for (const updatedItem of result) {
                                let index = global.tblEventMarketsV2.findIndex(
                                  (item) => item.eventMarketId === updatedItem.eventMarketId
                                );
                                if (index !== -1) {
                                  global.tblEventMarketsV2[index] = {
                                    ...global.tblEventMarketsV2[index],
                                    ...updatedItem,
                                  };
                                }
                              };
                              // });
                          }
                          const suspendedMarketIds = new Set(marketToSuspend.map((m) => m.eventMarketId));
                          // global.tblMarketRunnerV2.forEach(elem => {
                          //   if (suspendedMarketIds.has(elem.eventMarketId)) {
                          //       elem.selectionStatus = EventMarketStatus.Suspend;
                          //   }
                          // });
                          for (const elem of global.tblMarketRunnerV2) {
                            if (suspendedMarketIds.has(elem.eventMarketId)) {
                              elem.selectionStatus = EventMarketStatus.Suspend;
                            }
                          }
                        
                    }
                    if(marketToClose.length > 0){
                        const eventMarketData = await fastify.db.query(
                            `
                             UPDATE "tblEventMarkets" SET
                              "wrStatus" = $1 ,
                              "wrAfterCloseTime" = null,
                              "wrCloseTime" = now(),
                              "wrLastUpdate" = now(),
                              "wrData" = jsonb_set(
                                    jsonb_set("wrData"::jsonb, '{status}', '4'::jsonb, false),
                                    '{runner}', (
                                    SELECT jsonb_agg(
                                        jsonb_set(runner_elem, '{status}', '4'::jsonb, false)
                                    )
                                    FROM jsonb_array_elements("wrData"::jsonb->'runner') AS runner(runner_elem)
                                    ),
                                    false
                              )::json
                             WHERE "wrID" IN (${marketToClose.map((m) => m.eventMarketId).join(",")})
                             AND "wrStatus" NOT IN ($2,$3,$4)
                             RETURNING 
                                "wrID" as "eventMarketId",
                                "wrStatus" as "status",
                                "wrAfterCloseTime" as "afterCloseTime",
                                "wrCloseTime" as "closeTime",
                                "wrLastUpdate" as "lastUpdate",
                                "wrData" as "data"
                            `,
                            {
                                 type: fastify.db.QueryTypes.UPDATE,
                                 bind: [EventMarketStatus.Close,
                                        EventMarketStatus.Cancel,
                                        EventMarketStatus.Close,
                                        EventMarketStatus.Settled
                                 ]
                            }
                          );
                          await fastify.db.query(
                            `UPDATE "tblMarketRunners"
                             SET "wrSelectionStatus" = $1
                             WHERE "wrEventMarketId" IN (${marketToClose.map((m) => m.eventMarketId).join(",")})`,
                            {
                                type: fastify.db.QueryTypes.UPDATE,
                                bind: [EventMarketStatus.Close]
                            }
                          )

                          if(eventMarketData.length > 0){
                            // eventMarketData.forEach((updatedItem) => {
                              for (const updatedItem of eventMarketData) {
                                let index = global.tblEventMarketsV2.findIndex(
                                  (item) => item.eventMarketId === updatedItem.eventMarketId
                                );
                                if (index !== -1) {
                                  global.tblEventMarketsV2[index] = {
                                    ...global.tblEventMarketsV2[index],
                                    ...updatedItem,
                                  };
                                }
                              };
                              // });
                          }

                          const suspendedMarketIds = new Set(marketToSuspend.map((m) => m.eventMarketId));
                          // global.tblMarketRunnerV2.forEach(elem => {
                          //   if (suspendedMarketIds.has(elem.eventMarketId)) {
                          //       elem.selectionStatus = EventMarketStatus.Close;
                          //   }
                          // });
                          for (const elem of global.tblMarketRunnerV2) {
                            if (suspendedMarketIds.has(elem.eventMarketId)) {
                              elem.selectionStatus = EventMarketStatus.Suspend;
                            }
                          }
                    }
                    // remove updae market from market array
                    market = market.filter((m) => !marketToSuspend.map((m) => m.eventMarketId).includes(m.eventMarketId) && !marketToClose.map((m) => m.eventMarketId).includes(m.eventMarketId));
                },intervalForCheck * 60 * 1000);
            }
            else {
                // console.log('No market found to update');
                // errorLogger(
                //     fastify,
                //     "No market found to update",
                //     "utilities/marketUpdate.js",
                //     null
                // )
                // return;
            }
        } catch (error) {
            /// console.log('Error in market update', error);
            errorLogger(
                fastify,
                error.message,
                "utilities/marketUpdate.js",
                error
            )
        }
    },getInterval * 60 * 1000);    

}

module.exports = {updateMarket};