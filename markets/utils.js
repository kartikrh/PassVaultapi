const { errorLogger } = require("../utilities/logger");
const { processLotteryMarkets } = require("./oddEven.js");
// const { generateExtraMarketFromTemplate } = require("./oddEven");
function updateMarketToDB(commentaryId, marketName, marketValue) {
    console.log(`[DB] Update for ${marketName}:`, marketValue, `(commentary_id: ${commentaryId})`);
    // TODO: Replace with actual DB logic
}

function sendSocketData(eventId, payload) {
    console.log(`[SOCKET] Sending to event ${eventId}:`, payload);
    // TODO: Replace with actual socket.emit() logic
}

const processMarketAndRunners = (market, teamId, keyPrefix, processedMarketsObj , commentary) => {
    const baseKey = `${keyPrefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;

    if (!processedMarketsObj[baseKey]) {
        processedMarketsObj[baseKey] = [];
    }
    let marketArrObj = global.marketData[commentary.commentaryId].markets;
    // Special handling for marketTypeId=5 and marketTypeCategoryId=6
    let marketRunners = [];
    if (market.marketTypeId === 5 && market.marketTypeCategoryId === 6) {
        // Get team names from commentary object instead of marketData
        const team1Name = commentary?.team1Name || 'Team1';
        const team2Name = commentary?.team2Name || 'Team2';

        // For each template runner, create two runners (one for each team)
        if (market.runners && market.runners.length > 0) {
            market.runners.forEach(templateRunner => {
                // Create runner for team 1
                const team1Runner = {
                    ...templateRunner,
                    marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
                    runnerId: templateRunner.runnerId || 0,
                    marketTemplateId: market.marketTemplateId,
                    runner: templateRunner.runner.replace("{team}", team1Name),
                    line: templateRunner.line,
                    overRate: templateRunner.overRate,
                    underRate: templateRunner.underRate,
                    lastUpdate: new Date().toISOString(),
                    selectionId: `${templateRunner.selectionId}_1`,
                    order: templateRunner.order * 2 - 1,
                    backPrice: templateRunner.backPrice,
                    layPrice: templateRunner.layPrice,
                    backSize: templateRunner.backSize || market.defaultBackSize,
                    laySize: templateRunner.laySize || market.defaultLaySize,
                };

                // Create runner for team 2
                const team2Runner = {
                    ...templateRunner,
                    marketTemplateRunnerId: templateRunner.marketTemplateRunnerId,
                    runnerId: templateRunner.runnerId || 0,
                    marketTemplateId: market.marketTemplateId,
                    runner: templateRunner.runner.replace("{team}", team2Name),
                    line: templateRunner.line,
                    overRate: templateRunner.overRate,
                    underRate: templateRunner.underRate,
                    lastUpdate: new Date().toISOString(),
                    selectionId: `${templateRunner.selectionId}_2`,
                    order: templateRunner.order * 2,
                    backPrice: templateRunner.backPrice,
                    layPrice: templateRunner.layPrice,
                    backSize: templateRunner.backSize || market.defaultBackSize,
                    laySize: templateRunner.laySize || market.defaultLaySize,
                };

                marketRunners.push(team1Runner, team2Runner);
            });
        }
    }
    else if (market.marketTypeCategoryId === 28) {
        marketRunners = market.runners?.map(runner => ({
            marketTemplateRunnerId: runner.marketTemplateRunnerId,
            marketTemplateId: runner.marketTemplateId,
            runner: runner.runner,
            line: runner.line,
            overRate: runner.overRate,
            underRate: runner.underRate,
            lastUpdate: new Date().toISOString(),
            selectionId: runner.selectionId,
            order: runner.order,
            backPrice: runner.backPrice,
            layPrice: runner.layPrice,
            backSize: runner.backSize,
            laySize: runner.laySize,
            predefinedValue: runner.predefinedValue,
            runnerId: runner.runnerId || 0
        })) || [];
    }
    else if (market.marketTypeCategoryId === 26) {
        // Handle LDO and Lottery markets
        marketRunners = market.runners?.map(runner => ({
            ...runner,  // Spread the original runner properties
            runnerId: runner.runnerId || 0,
            // Make sure each property is explicitly copied
            marketTemplateRunnerId: runner.marketTemplateRunnerId,
            marketTemplateId: market.marketTemplateId,
            runner: runner.runner,
            line: runner.line,
            overRate: runner.overRate,
            underRate: runner.underRate,
            lastUpdate: new Date().toISOString(),
            selectionId: runner.selectionId,
            order: runner.order,
            backPrice: runner.backPrice,
            layPrice: runner.layPrice,
            backSize: market?.isPredefineRunnerValue ? runner?.backSize : market?.defaultBackSize,
            laySize: market?.isPredefineRunnerValue ? runner?.laySize : market?.defaultLaySize,
            predefinedValue: runner.predefinedValue
        })) || [];
    } else {
        // Default runner handling for other market types
        if (!market.runners || market.runners.length === 0) {
            marketRunners = [{
                marketTemplateRunnerId: 0,
                runnerId: 0,
                marketTemplateId: market.marketTemplateId,
                runner: market?.marketName,
                line: market.defaultLine || null,
                overRate: null,
                underRate: null,
                lastUpdate: new Date().toISOString(),
                selectionId: `${market.marketTemplateId}01`,
                order: 1,
                backPrice: null,
                layPrice: null,
                backSize: market?.defaultBackSize,
                laySize: market?.defaultLaySize,
            }];
        } else {
            marketRunners = market.runners;
        }
    }

    global.marketData[commentary.commentaryId].markets.push({
        ...market,
        teamId,
        eventMarketId: market.eventMarketId || 0,
        isCreate: market.isCreate !== undefined ? market.isCreate : true,
        status: market.status || 1,
        margin: parseFloat(market.margin) || 3,
        data: market.data || "",
        playerId: market.playerId || null,
        isActive: market.isActive !== undefined ? market.isActive : true,
        isAllow: market.isAllow !== undefined ? market.isAllow : false,
        inningsId: market.inningsId || 1,
        index: market.index || 0,
        commentaryId: market.commentaryId,
        eventRefId: market.eventRefId,
        isPredefineRunnerValue: market.isPredefineRunnerValue !== undefined ? market.isPredefineRunnerValue : true,
        runners: marketRunners
    });

    return global.marketData[commentary.commentaryId].markets;
};
const generateExtraMarketFromTemplate = (template, team, commentary) => {
    return {
        eventMarketId: 0,
        isCreate: true,
        status: 1,
        margin: template.margin,
        data: "",
        playerId: null,
        ...template,
        commentaryId: commentary.commentaryId,
        eventRefId: commentary.eventRefId,
        marketName: `${template.templateName} - ${team.shortName}`,
        defaultBackSize: template?.defaultBackSize,
        defaultLaySize: template?.defaultLaySize,
        lineType: template?.lineType,
        teamId: null,
        inningsId: 1,
        isActive: template?.isDefaultMarketActive || false,
        isAllow: template.isDefaultBetAllowed || false,
        index: 0,
        rateDiff: template?.rateDiff,
        runners: template.runners?.map(runner => ({
            ...runner,
            runnerId: runner.runnerId || 0,
            backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
            laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
        })) || []
    };
};
const generateMarketFromTemplate = (template, teams, commentary) => {
    // Default market name without any changes
    let marketName = template.templateName;

    // Apply specific logic only when isPerEvent is true
    if (template.isPerEvent && teams.length >= 2) {
        const team1Name = teams[0]?.shortName || 'Team1';
        const team2Name = teams[1]?.shortName || 'Team2';
        marketName = `${template.templateName} (${team1Name} vs ${team2Name}) ADV`;
    }

    return {
        eventMarketId: 0, // Default to 0 for new markets
        isCreate: true,  // Default to true for new markets
        status: "1",
        margin: template.margin,
        data: "",
        playerId: null,
        ...template,
        commentaryId: commentary.commentaryId,
        eventRefId: commentary.eventRefId,
        marketName, // Use the newly formatted market name only when isPerEvent is true
        defaultBackSize: template?.defaultBackSize,
        defaultLaySize: template?.defaultLaySize,
        lineType: template?.lineType,
        teamId: null,
        inningsId: 1,
        isActive: template?.isDefaultMarketActive || false,
        isAllow: template.isDefaultBetAllowed || false,
        index: 0,
        beforeSuspendMin: template.beforeSuspendMin,
        beforeCloseMin: template.beforeCloseMin,
        rateDiff: template?.rateDiff,
        runners: template.runners?.map(runner => ({
            ...runner,
            runnerId: runner.runnerId ||0,
            backSize: template?.isPredefineRunnerValue ? runner?.backSize : template?.defaultBackSize,
            laySize: template?.isPredefineRunnerValue ? runner?.laySize : template?.defaultLaySize,
        })) || []
    };
};
const getMarketKey = (market) => {
    const prefix = market.teamId || 'oneTimeMarket';
    return `${prefix}_##_${market.marketTypeId}_##_${market.marketTypeCategoryId}`;
};
const mergeRunners = (templateRunners, apiRunners, marketName, marketPredefinedValue) => {
    if (apiRunners.length > 0) {
        return apiRunners.map(apiRunner => ({
            ...apiRunner,
            runner: apiRunner.runner || marketName,
            runnerId: apiRunner.runnerId || apiRunner.selectionId || apiRunner.runner || marketName,
            predefinedValue: marketPredefinedValue, // Copy market level predefinedValue to runner
            line: apiRunner.line,
            overRate: apiRunner.overRate,
            underRate: apiRunner.underRate,
            backPrice: apiRunner.backPrice,
            layPrice: apiRunner.layPrice,
            backSize: apiRunner.backSize,
            laySize: apiRunner.laySize,
            order: apiRunner.order,
            selectionId: apiRunner.selectionId
        }));
    }
    return templateRunners;
};
const createMarketAndRunner = async (data, request, fastify) => {
    const processedMarketsObj = {};
    const {templates , teams , matchType , commentary ,existingMarkets} = data;
    const commentaryId = commentary.commentaryId;
    templates.forEach((template) => {
       if(template.isPerEvent){
         return true;
       }
       else {
         if(template.marketTypeCategoryId == 35 || template.marketTypeCategoryId == 28){
            let baseMar = generateMarketFromTemplate(template, teams, commentary);
            processLotteryMarkets(baseMar, teams, processedMarketsObj, matchType,commentary);
         }
        //  else {
        //     teams.forEach(team => {
        //         // processMarketAndRunners(generateExtraMarketFromTemplate(template, team, commentary), team.teamId, team.teamId.toString(), processedMarketsObj);
        //         let baseMar = generateExtraMarketFromTemplate(template, teams, commentary);
        //         processMarketAndRunners(baseMar, team.teamId, team.teamId.toString(), processedMarketsObj, commentary);
        //     });
        // }
       }
    })
    // return mar;
    // Now update with existing markets from API
    const globalEntry = global.marketData[commentaryId];
    // Safety check just in case
    if (!globalEntry) {
        global.marketData[commentaryId] = { existingMarket: [], markets: [] };
    }
    globalEntry.existingMarket = existingMarkets;
    existingMarkets.forEach(apiMarket => {
        const index = globalEntry.markets.findIndex(m =>
            m.teamId === apiMarket.teamId &&
            m.marketTypeId === apiMarket.marketTypeId &&
            m.marketTypeCategoryId === apiMarket.marketTypeCategoryId &&
            m.marketName === apiMarket.marketName
        );
        if(index !== -1){
           const existingMarket = globalEntry.markets[index];
           const updatedMarket = {
                ...existingMarket,
                ...apiMarket,
                isCreate: false,
                runners: mergeRunners(
                    existingMarket.runners,
                    apiMarket.runners,
                    apiMarket.marketName,
                    apiMarket.predefinedValue // Pass market level predefinedValue
                )
            };
            globalEntry.markets[index] = updatedMarket;
        }
        else {
            globalEntry.markets.push({
                ...apiMarket,
                isCreate: false,
                runners: mergeRunners(
                    [],
                    apiMarket.runners,
                    apiMarket.marketName,
                    apiMarket.predefinedValue // Pass market level predefinedValue
                )
            });
        }
    })
    // Sort the markets within each key to maintain order
    // global.marketData[commentary.commentaryId].markets.sort((a, b) => {
    //     if (a.over && b.over) {
    //       return a.over - b.over;
    //     }
    //     return 0;
    // });   

    global.marketData[commentary.commentaryId].markets.sort((a, b) => {
        if (a.over && b.over) {
          return a.over - b.over;
        }
        return 0;
      });
      
    return true; 
}
// Process templates first to ensure all markets are generated
const fun1 = async ()=>{
    templates.forEach(template => {
        if (template.isPerEvent) {
            if (template.marketTypeCategoryId === 37) {
                processTopBowlerRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
            } else {
                processMarketAndRunners(generateMarketFromTemplate(template, teams, commentary), null, 'oneTimeMarket', processedMarketsObj);
            }
        } else if (template.marketTypeCategoryId === 11 && template.isOver) {
            processOnlyOverMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.maxOversInFirstInings, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 13) {
            processWicketMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.noOfPlayer, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 12) {
            processPlayerRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 29) {
            processPlayerBoundaryMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 26) {
            processFancyLDOMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.maxOversInFirstInings, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 30) {
            processPlayerBallMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 23 || template.marketTypeCategoryId === 26 || template.marketTypeCategoryId === 27) {
            processMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 28 || template.marketTypeCategoryId === 35) {
            processLotteryMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj, matchType);
        } else if (template.marketTypeCategoryId === 31) {
            processFallOfWicketMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 32) {
            processPartnershipBoundariesMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 33) {
            processWicketLostBallsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 38) {
            processTopBatsManRunsMarkets(generateMarketFromTemplate(template, teams, commentary), teams, processedMarketsObj);
        } else if (template.marketTypeCategoryId === 39) {
            processOnlyOverMarkets(generateMarketFromTemplate(template, teams, commentary), teams, matchType.maxOversInFirstInings, processedMarketsObj);
        } else {
            teams.forEach(team => {
                processMarketAndRunners(generateExtraMarketFromTemplate(template, team, commentary), team.teamId, team.teamId.toString(), processedMarketsObj);
            });
        }
    });
}

module.exports = { updateMarketToDB, sendSocketData ,createMarketAndRunner ,processMarketAndRunners ,generateMarketFromTemplate ,generateExtraMarketFromTemplate ,getMarketKey ,mergeRunners };
