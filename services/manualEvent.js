const {
  updateEventQuery,
  insertEventTypeQuery,
  updateEventTypeQuery,
  insertCompetitionQuery,
  updateCompititionQuery,
  insertEventQuery,
} = require("../repository/TableImportMarket");

const {
  createEventMarketMaunalQuery,
  updateEventMarketMaunalQuery,
  createOrUpdateEventRunnerMarketManualQuery,
  getEventMarketByIdsQuery,
  getAllEventMarketsV2ByIdQuery
} = require("../repository/TableEventMarkets");
const { getAllMarketRunnersV2ByIdQuery } = require("../repository/TableMarketRunner");
const configConstants = require("../utilities/configConstants");

const ImportMarketService = async (request, fastify) => {
  if (request.userTokenInfo.WrUserId) {
    //EventType Add/Update
    let eventtypeobj = global.tblEventTypes.find(
      (item) => item.refId === request.body.eventTypeId
    );
    let setEventtype;
    if (!eventtypeobj) {
      request.body.isActive = true;
      request.body.remark = "";
      request.body.isHighlight = true;
      request.body.image = "";
      setEventtype = await insertEventTypeQuery(
        { ...request.body, userId: request.userTokenInfo.WrUserId },
        fastify,
        request
      );
      eventtypeobj = setEventtype;
      global.tblEventTypes.push(setEventtype);
    } else {
      setEventtype = {
        eventTypeId: eventtypeobj.eventTypeId,
        eventType: request.body.eventTypeName,
        refId: request.body.eventTypeId,
        image: eventtypeobj.image,
        isActive: eventtypeobj.isActive,
        remark: eventtypeobj.remark,
        displayOrder: eventtypeobj.displayOrder,
        isHighlight: eventtypeobj.isHighlight,
        userId: request.userTokenInfo.WrUserId,
      };

      await updateEventTypeQuery(setEventtype, fastify, request);

      const index = global.tblEventTypes.findIndex(
        (item) =>
          item.eventTypeId === eventtypeobj.eventTypeId &&
          item.refId === request.body.eventTypeId
      );
      global.tblEventTypes[index] = setEventtype;
    }

    //Compitition Add/Update
    let setCompetitions;
    let CompetitionsObj = global.tblCompetitions.find(
      (item) =>
        item.eventTypeId === setEventtype.eventTypeId &&
        item.refId === request.body.competitionId
    );
    if (!CompetitionsObj) {
      request.body.eventTypeId = setEventtype.eventTypeId;
      request.body.image = "";
      request.body.isActive = true;
      setCompetitions = await insertCompetitionQuery(request, fastify);
      global.tblCompetitions.push(setCompetitions);
      CompetitionsObj = setCompetitions;
    } else {
      setCompetitions = {
        competitionId: CompetitionsObj.competitionId,
        competition: request.body.competitionName,
        eventTypeId: CompetitionsObj.eventTypeId,
        eventType : CompetitionsObj.eventType,
        refId: request.body.competitionId,
        image: CompetitionsObj.image,
        isActive: true,
        displayOrder: CompetitionsObj.displayOrder,
        isTrending: CompetitionsObj.isTrending,
        isEventSnap: CompetitionsObj.isEventSnap,
        isPointTable: CompetitionsObj.isPointTable,
        matchTypeId : CompetitionsObj.matchTypeId,
        winPoint : CompetitionsObj.winPoint,
        tiePoint : CompetitionsObj.tiePoint,
        cancelPoint : CompetitionsObj.cancelPoint,
        lossPoint : CompetitionsObj.lossPoint
      };
      await updateCompititionQuery(setCompetitions, fastify, request);

      const index = global.tblCompetitions.findIndex(
        (item) =>
          item.eventTypeId === setEventtype.eventTypeId &&
          item.refId === request.body.competitionId
      );

      global.tblCompetitions[index] = setCompetitions;
    }

    //Events Add/Update
    let setEvents;
    const Eventsobj = global.tblEvents.find(
      (item) =>
        item.competitionId === CompetitionsObj.competitionId &&
        item.refId === request.body.eventId
    );
    if (!Eventsobj) {
      request.body.competitionId = CompetitionsObj.competitionId;
      request.body.eventTypeId = eventtypeobj.eventTypeId;
      request.body.isActive = true;
      setEvents = await insertEventQuery(request, fastify);

      global.tblEvents.push(setEvents);
    } else {
      setEvents = {
        eventId: Eventsobj.eventId,
        eventTypeId: eventtypeobj.eventTypeId,
        competitionId: CompetitionsObj.competitionId,
        eventName: request.body.eventName,
        eventDate: request.body.openDate,
        refId: request.body.eventId,
        isActive: true,
        countryCode:
          request.body.countryCode === undefined
            ? "GMT"
            : request.body.countryCode,
        timeZone:
          request.body.timeZone === undefined ? "" : request.body.timeZone,
        venue: request.body.venue === undefined ? "" : request.body.venue,
      };
      await updateEventQuery(setEvents, fastify, request);

      const index = global.tblEvents.findIndex(
        (item) =>
          item.competitionId === CompetitionsObj.competitionId &&
          // item.eventTypeId === CompetitionsObj.competitionId &&
          item.refId === request.body.eventId
      );

      if(index !== -1){
        global.tblEvents[index] = {
          ...global.tblEvents[index],
          ...setEvents
        };
      }
    }
  } else {
    throw new Error("Event Type Id not found");
  }
};

const MarketListService = async (request, fastify) => {
  // const apiUrl = process.env.IMPORTMARKET_API;
  const apiUrl = global.tblConfigs.find((item) => item.key == configConstants.IMPORTMARKET_API)?.value;
  if(!apiUrl){
    throw new Error("IMPORTMARKET_API not found in tblConfigs");
  }
  let endpoint;
  let postData = {
    isaustralian: request.body.isAustralian,
  };

  if (request.body.refID === "0") {
    endpoint = "/listManualEventType";
  } else if (request.body.refID !== "0") {
    if (request.body.isCompitition) {
      endpoint = "/listManualCompetition";
      postData.refId = request.body.refID;
    }
    if (request.body.isEvent) {
      endpoint = "/listManualevent";
      postData.refId = request.body.refID;
    }

    if (request.body.isMarket) {
      endpoint = "/listManualMarket";
      postData.eventids = request.body.refID;
      //console.log("JsonObj " + JSON.stringify(postData));
    }
  }

  const response = await fetch(apiUrl + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app": "S@#36sE8",
    },
    body: JSON.stringify(postData),
  });

  if (response.ok) {
    const responseData = await response.json();
    //console.log("Responce " + JSON.stringify(responseData));
    if(request.body.isEvent){
      responseData.appdata.sort((a, b) => {
        return new Date(a.eventDate) - new Date(b.eventDate);
      });
    }
    return responseData;
  } else {
    console.error(`Error: ${response.status} - ${response.statusText}`);
    throw new Error("Error while fetching data from import market");
  }
};

const ImportMarketWithRunnerService = async (request, fastify) => {
  if (request.userTokenInfo.WrUserId) {
    //EventType Add/Update
    let eventtypeobj = global.tblEventTypes.find(
      (item) => item.refId === request.body.eventTypeId
    );
    let setEventtype;
    if (!eventtypeobj) {
      request.body.isActive = true;
      request.body.remark = "";
      request.body.isHighlight = true;
      request.body.image = "";
      setEventtype = await insertEventTypeQuery(
        { ...request.body, userId: request.userTokenInfo.WrUserId },
        fastify,
        request
      );
      eventtypeobj = setEventtype;
      global.tblEventTypes.push(setEventtype);
    } else {
      setEventtype = {
        eventTypeId: eventtypeobj.eventTypeId,
        eventType: request.body.eventTypeName,
        refId: request.body.eventTypeId,
        image: eventtypeobj.image,
        isActive: eventtypeobj.isActive,
        remark: eventtypeobj.remark,
        displayOrder: eventtypeobj.displayOrder,
        isHighlight: eventtypeobj.isHighlight,
        userId: request.userTokenInfo.WrUserId,
      };

      await updateEventTypeQuery(setEventtype, fastify, request);

      const index = global.tblEventTypes.findIndex(
        (item) =>
          item.eventTypeId === eventtypeobj.eventTypeId &&
          item.refId === request.body.eventTypeId
      );
      global.tblEventTypes[index] = setEventtype;
    }

    //Compitition Add/Update
    let setCompetitions;
    let CompetitionsObj = global.tblCompetitions.find(
      (item) =>
        item.eventTypeId === setEventtype.eventTypeId &&
        item.refId === request.body.competitionId
    );
    if (!CompetitionsObj) {
      request.body.eventTypeId = setEventtype.eventTypeId;
      request.body.image = "";
      request.body.isActive = true;
      setCompetitions = await insertCompetitionQuery(request, fastify);
      global.tblCompetitions.push(setCompetitions);
      CompetitionsObj = setCompetitions;
    } else {
      setCompetitions = {
        competitionId: CompetitionsObj.competitionId,
        competition: request.body.competitionName,
        eventTypeId: CompetitionsObj.eventTypeId,
        eventType : CompetitionsObj.eventType,
        refId: request.body.competitionId,
        image: CompetitionsObj.image,
        isActive: true,
        displayOrder: CompetitionsObj.displayOrder,
        isTrending: CompetitionsObj.isTrending,
        isEventSnap: CompetitionsObj.isEventSnap,
        isPointTable: CompetitionsObj.isPointTable,
        matchTypeId : CompetitionsObj.matchTypeId,
        winPoint : CompetitionsObj.winPoint,
        tiePoint : CompetitionsObj.tiePoint,
        cancelPoint : CompetitionsObj.cancelPoint,
        lossPoint : CompetitionsObj.lossPoint
      };
      await updateCompititionQuery(setCompetitions, fastify, request);

      const index = global.tblCompetitions.findIndex(
        (item) =>
          item.eventTypeId === setEventtype.eventTypeId &&
          item.refId === request.body.competitionId
      );

      global.tblCompetitions[index] = setCompetitions;
    }

    //Events Add/Update
    let setEvents;
    const Eventsobj = global.tblEvents.find(
      (item) =>
        item.competitionId === CompetitionsObj.competitionId &&
        item.refId === request.body.eventId
    );
    if (!Eventsobj) {
      request.body.competitionId = CompetitionsObj.competitionId;
      request.body.eventTypeId = eventtypeobj.eventTypeId;
      request.body.isActive = true;
      setEvents = await insertEventQuery(request, fastify);

      global.tblEvents.push(setEvents);
    } else {
      setEvents = {
        eventId: Eventsobj.eventId,
        eventTypeId: eventtypeobj.eventTypeId,
        competitionId: CompetitionsObj.competitionId,
        eventName: request.body.eventName,
        // eventDate: request.body.openDate,
        eventDate: Eventsobj.eventDate,
        refId: request.body.eventId,
        isActive: true,
        countryCode:
          request.body.countryCode === undefined
            ? "GMT"
            : request.body.countryCode,
        timeZone:
          request.body.timeZone === undefined ? "" : request.body.timeZone,
        venue: request.body.venue === undefined ? "" : request.body.venue,
      };
      await updateEventQuery(setEvents, fastify, request);

      const index = global.tblEvents.findIndex(
        (item) =>
          item.competitionId === CompetitionsObj.competitionId &&
          // item.eventTypeId === CompetitionsObj.competitionId &&
          item.refId === request.body.eventId
      );
      if(index !== -1){
        global.tblEvents[index] = {
          ...global.tblEvents[index],
          ...setEvents
        };
      }
    }

    //EventMarket Add/Update
    let setEventsMarket;
    // const EventsMarketobj = global.tblEventMarkets.find(
    //   (item) => item.rateSourceRefID == request.body.marketID
    // );
    const EventsMarketobj = global.tblEventMarketsV2.find(
      (item) => item.rateSourceRefID == request.body.marketID
    );
    if (!EventsMarketobj) {
      let req = {};
      try {
        let _resComm = global.tblCommentaries.find((i) => i.eventRefId == request.body.eventId);
        if(_resComm){
          req.commentaryId = _resComm.commentaryId;
        }
        else{
          req.commentaryId = 0;
        }
      } catch (error) {
        req.commentaryId = 0;
      }

      req.eventID = request.body.eventId;
      req.marketName = request.body.marketName;
      req.marketStatus = request.body.marketStatus;
      req.rateSource = request.body.rateSource;
      req.marketID = request.body.marketID;
      req.marketType = request.body.marketType;
      req.marketTypeName = request.body.marketTypeName;
      req.categoryType = request.body.categoryType;
      setEventsMarket = await createEventMarketMaunalQuery(
        req,
        request,
        fastify
      );
      
      if(setEventsMarket?.eventMarketId){
        let whereCondition = ` tem."wrID" = ${setEventsMarket.eventMarketId}`
        const eventMarketData = await getAllEventMarketsV2ByIdQuery(fastify, whereCondition);
        global.tblEventMarketsV2.push(eventMarketData[0]);
      }
    } else {
      let req = {};

      try {
        let _resComm = global.tblCommentaries.find((i) => i.eventRefId == request.body.eventId);
        if(_resComm){
          req.commentaryId = _resComm.commentaryId;
        }
        else{
          req.commentaryId = 0;
        }
      } catch (error) {
        req.commentaryId = 0;
      }

      req.eventID = request.body.eventId;
      req.marketName = request.body.marketName;
      req.marketStatus = request.body.marketStatus;
      req.rateSource = request.body.rateSource;
      req.marketID = request.body.marketID;
      setEventsMarket = await updateEventMarketMaunalQuery(
        req,
        request,
        fastify
      );
      let index = global.tblEventMarketsV2.findIndex(
        (elem) => elem.rateSourceRefID == request.body.marketID
      );
      if (index !== -1) {
        global.tblEventMarketsV2[index] = {
          ...global.tblEventMarketsV2[index],
          ...setEventsMarket
        };
      }
    }

    //MarketRunnders Add/Update
    if (request.body.runner.length > 0) {
      let runnders = request.body.runner;
      for (let runner of runnders) {
        let commentaryData = global.tblCommentaries.find((item) => item.eventRefId == request.body.eventId);
        if(commentaryData){
          let team1Name = global.tblTeams.find((team) => 
            (team.teamId === commentaryData.team1Id || team.teamId === commentaryData.team2Id) &&
            team.teamName.toLowerCase().trim() === runner.runnerName.toLowerCase().trim()
          ) 
          if(team1Name){
            runner.teamId = team1Name.teamId
          }
        }
        let setMarketRunnders;
        let obje = {
          marketID: setEventsMarket.eventMarketId,
          runnerName: runner.runnerName,
          selectionID: runner.selectionID,
          teamId: runner.teamId || null,
        };
        setMarketRunnders = await createOrUpdateEventRunnerMarketManualQuery(
          obje,
          request,
          fastify
        );
       if (setMarketRunnders && setMarketRunnders.runnerId) {
        let runnerIndex = global.tblMarketRunnerV2.findIndex(
          (e) => e.runnerId == setMarketRunnders.runnerId
        );
        if(runnerIndex === -1){
          let whereCondition = ` tmr."wrRunnerId" = ${setMarketRunnders.runnerId}`;
          const runnersData = await getAllMarketRunnersV2ByIdQuery(fastify, whereCondition)
          global.tblMarketRunnerV2.push(runnersData[0]);
        }
       }
      }
    }

    let _idReques = [setEventsMarket.eventMarketId];
    let _data = await getEventMarketByIdsQuery(
      { eventMarketIds: _idReques },
      request,
      fastify
    );
    if(_data){
      for (let _in = 0; _in < _data.length; _in++) {
           const element = _data[_in];
           let index2 = global.tblEventMarkets.findIndex(
            (e) => e.rateSourceRefID === element.rateSourceRefID && e.selectionId === element.selectionId
          );
         if (index2 === -1) {
           global.tblEventMarkets.push(element);
         } else {
           global.tblEventMarkets[index2] = element;
         }

         let runnerIndex = global.tblMarketRunnerV2.findIndex(
          (e) => e.selectionId === element.selectionId && e.runnerId === element.runnerId
        );
        let runnerData = {
          runnerId: element.runnerId,
          eventMarketId: element.eventMarketId,
          runner: element.runner,
          line: element.line,
          overRate: element.overRate,
          underRate: element.underRate,
          backPrice: element.backPrice,
          layPrice: element.layPrice,
          backSize: element.backSize,
          laySize: element.laySize,
          lastUpdate: element.runnerLastUpdate,
          selectionId: element.selectionId,
          selectionStatus: element.selectionStatus,
          order: element.order,
          teamId: element.teamId,
        };
        if (runnerIndex === -1) {
          global.tblMarketRunnerV2.push(runnerData);
        }
        else {
          global.tblMarketRunnerV2[runnerIndex] = runnerData;
        }
      }
    }
  } else {
    console.log("Event Type Id not found");
    // throw new Error("Event Type Id not found");
  }
};
module.exports = {
  ImportMarketService,
  MarketListService,
  ImportMarketWithRunnerService,
};
