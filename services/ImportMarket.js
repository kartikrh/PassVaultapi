const {
  updateEventQuery,
  insertEventTypeQuery,
  updateEventTypeQuery,
  insertCompetitionQuery,
  updateCompititionQuery,
  insertEventQuery,
} = require("../repository/TableImportMarket");

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
        refId: request.body.competitionId,
        image: CompetitionsObj.image,
        isActive: true,
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
          item.eventTypeId === CompetitionsObj.competitionId &&
          item.refId === request.body.eventId
      );

      global.tblEvents[index] = setEvents;
    }
  } else {
    throw new Error("Event Type Id not found");
  }
};

module.exports = {
  ImportMarketService,
};
