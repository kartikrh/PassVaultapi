const {
  deleteEventQuery,
  insertEventQuery,
  updateEventQuery,
} = require("../repository/TableEvent");
const { convertDate } = require("../utilities");
const configConstants = require("../utilities/configConstants");

const allEventService = async (request) => {
  const { isActive, eventTypeId, competitionId } = request.body;

  const filterObject = {
    isActive: isActive,
    eventTypeId: eventTypeId === "string" ? null : eventTypeId,
    competitionId: competitionId === "string" ? null : competitionId,
  };

  // Additional checks for "0" and undefined
  filterObject.eventTypeId =
    eventTypeId === "0" || eventTypeId === undefined
      ? null
      : filterObject.eventTypeId;
  filterObject.competitionId =
    competitionId === "0" || competitionId === undefined
      ? null
      : filterObject.competitionId;

  if (filterObject.isActive === undefined) {
    const _event = global.tblEvents.filter((i) => i.isActive === true);
    return _event;
  } else {
    const _event = global.tblEvents.filter((item) => {
      return (
        (filterObject.isActive === null ||
          item.isActive === filterObject.isActive) &&
        (filterObject.competitionId === null ||
          item.competitionId === filterObject.competitionId) &&
        (filterObject.eventTypeId === null ||
          item.eventTypeId === filterObject.eventTypeId)
      );
    });
    return _event;
  }
  //old Code
  // if (isActive !== undefined) {
  //   const _event = global.tblEvents.filter((i) => i.isActive === isActive);
  //   return _event;
  // } else {
  //   const _event = global.tblEvents.filter((i) => i.isActive === true);
  //   return _event;
  // }
};

const eventByIdService = async (request) => {
  const { eventId } = request.body;
  const result = global.tblEvents.find((item) => item.eventId === eventId);
  return result || null;
};

const eventBycompetitionIdService = async (request) => {
  const { competitionId } = request.body;
  const result = global.tblEvents.filter(
    (item) => item.competitionId === competitionId
  );

  const currentDate = new Date();
  const daysTominus = global.tblConfigs.find((item) => item.key.toLowerCase() === configConstants.COMMENTARY_EVENT_DAY_INTERVAL.toLocaleLowerCase()).value;
  const getEventDate = new Date(currentDate.setDate(currentDate.getDate() - parseInt(daysTominus)));
  const _event = result.filter((item) => new Date(item.eventDate) >= getEventDate).map((item) => {
    // console.log(item.eventDate);
    return {
      eventId: item.eventId,
      eventName: item.eventName,
      eventDate : item.eventDate,
    };
  })

  return _event || null;
};

const createEventService = async (request, fastify) => {
  const validateEventTypeId = global.tblEventTypes.find(
    (item) => item.eventTypeId === request.body.eventTypeId
  );

  if (!validateEventTypeId) {
    throw new Error("Event Type Id not found");
  }

  const validateCompetitionId = global.tblCompetitions.find(
    (item) => item.competitionId === request.body.competitionId
  );

  if (!validateCompetitionId) {
    throw new Error("Competition Id not found");
  }

  const data = await insertEventQuery(request, fastify);

  global.tblEvents.push(data);

  return data;
};

const updateEventService = async (request, fastify) => {
  const checkId = global.tblEvents.find(
    (item) => item.eventId === request.body.eventId
  );

  if (!checkId) {
    throw new Error("Event with this id not Found");
  }

  const data = {
    eventId: request.body.eventId,
    eventTypeId: checkId.eventTypeId,
    competitionId: checkId.competitionId,
    eventName: request.body.eventName || checkId.eventName,
    eventDate: request.body.eventDate || checkId.eventDate,
    refId: request.body.refId || checkId.refId,
    isActive: checkId.isActive,
    countryCode:
      request.body.countryCode === undefined
        ? checkId.countryCode
        : request.body.countryCode,
    timeZone:
      request.body.timeZone === undefined
        ? checkId.timeZone
        : request.body.timeZone,
    venue:
      request.body.venue === undefined ? checkId.venue : request.body.venue,
    eventType: checkId.eventType,
    competition: checkId.competition,
  };

  if ("isActive" in request.body) {
    data.isActive = request.body.isActive;
  }

  if (request.body.eventTypeId) {
    const validateEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );

    if (!validateEventTypeId) {
      throw new Error("Event Type Id not found");
    } else {
      data.eventTypeId = request.body.eventTypeId;
      data.eventType = validateEventTypeId.eventType;
    }
  }

  if (request.body.competitionId) {
    const validateCompetitionId = global.tblCompetitions.find(
      (item) => item.competitionId === request.body.competitionId
    );

    if (!validateCompetitionId) {
      throw new Error("Competition Id not found");
    } else {
      data.competitionId = request.body.competitionId;
      data.competition = validateCompetitionId.competition;
    }
  }

  await updateEventQuery(data, fastify, request);

  const index = global.tblEvents.findIndex(
    (item) => item.eventId === request.body.eventId
  );

  global.tblEvents[index] = data;

  return data;
};

const saveEventService = async (request, fastify) => {
  const { eventId } = request.body;

  if (eventId === "0") {
    return await createEventService(request, fastify);
  } else {
    return await updateEventService(request, fastify);
  }
};

const deleteEventService = async (request, fastify) => {
  const { eventId } = request.body;

  //   for (const id of eventId) {
  //     //validate id here
  //   }

  await deleteEventQuery(eventId, fastify, request);

  global.tblEvents = global.tblEvents.filter(
    (item) => !eventId.includes(item.eventId)
  );

  return `Event(s) deleted successfully`;
};

module.exports = {
  allEventService,
  eventByIdService,
  saveEventService,
  deleteEventService,
  eventBycompetitionIdService,
};
