const {
  AddUpdateMarket,
  insertEventTypeQuery,
  updateEventTypeQuery,
  insertCompetitionQuery,
  updateCompititionQuery,
  insertEventQuery,
} = require("../repository/TableImportMarket");

const ImportMarketService = async (request, fastify) => {
  if (request.userTokenInfo.WrUserId) {
    //EventType Add/Update
    const eventtypeobj = global.tblEventTypes.find(
      (item) => item.refId === request.body.eventTypeID
    );
    let setEventtype;
    if (!eventtypeobj) {
      setEventtype = await insertEventTypeQuery(
        { ...request.body, userId: request.userTokenInfo.WrUserId },
        fastify,
        request
      );
      global.tblEventTypes.push(setEventtype);
    } else {
      setEventtype = {
        eventTypeId: eventtypeobj.eventTypeName,
        eventType: request.body.eventTypeID,
        refId: request.body.eventTypeID,
        image: eventtypeobj.image,
        isActive: eventtypeobj.isActive,
        remark: eventtypeobj.remark,
        displayOrder: eventtypeobj.displayOrder,
        isHighlight: eventtypeobj.isHighlight,
        userId: request.userTokenInfo.WrUserId,
      };

      await updateEventTypeQuery(setEventtype, fastify, request);

      const index = global.tblEventTypes.findIndex(
        (item) => item.eventTypeId === request.body.eventTypeId
      );

      delete data.userId;
      global.tblEventTypes[index] = setEventtype;
    }

    //Compitition Add/Update
    let setCompetitions;
    const CompetitionsObj = global.tblCompetitions.find(
      (item) =>
        item.eventTypeId === request.body.eventTypeID &&
        item.refId === request.body.compititionID
    );
    if (CompetitionsObj) {
      setCompetitions = await insertCompetitionQuery(request, fastify);
      global.tblCompetitions.push(result);
    } else {
      setCompetitions = {
        competitionId: request.body.competitionId,
        competition: request.body.competition || validateId.competition,
        eventTypeId: validateId.eventTypeId,
        refId: request.body.compititionID,
        image: validateId.image,
        isActive: false,
        eventType: validateId.eventType,
        displayOrder: validateId.displayOrder,
      };
      await updateCompititionQuery(setCompetitions, fastify, request);

      const index = global.tblCompetitions.findIndex(
        (item) => item.refId === competitionId
      );

      global.tblCompetitions[index] = setCompetitions;
    }

    //Events Add/Update
    let setEvents;
    const Eventsobj = global.tblEvents.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );
    if (Eventsobj) {
      setEvents = await insertEventQuery(request, fastify);

      global.tblEvents.push(setEvents);
    } else {
    }
  }
};

module.exports = {
  ImportMarketService,
};
