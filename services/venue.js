const {
  insertVenueQuery,
  updateVenueQuery,
  deleteVenueQuery,
  activeInactiveVenueQuery,
} = require("../repository/TableVenue");

const saveVenueService = async (request, fastify) => {
  const validateName = global.tblVenues.find(
    (item) => item.name.toLowerCase() === request.body.name.toLowerCase()
  );

  if (validateName) {
    throw new Error("Venue with this name already exist");
  }
  if(request.body.tpId === 0) {
    request.body.tpId = null
  }
  if(request.body.tpId !== undefined && request.body.tpId !== null) {
    const validateTpId = global.tblVenues.find(
      (item) => item.tpId === request.body.tpId
    );
    if(validateTpId) {
      throw new Error("Venue with this tpId already exist");
    }
  }
  const saveData = await insertVenueQuery(request.body, fastify, request);
  global.tblVenues.push(saveData);
  return saveData;
};

const editVenueService = async (request, fastify) => { 
  const validateId = global.tblVenues.find(
    (item) => item.id == request.body.id
  );
  if (!validateId) {
    throw new Error("Venue data with this Id not found");
  }
  if(request.body.tpId === 0) {
    request.body.tpId = null
  }
  if(validateId && request.body.id !== null && request.body.id !== undefined) {
    const validateTpId = global.tblVenues.find(
      (item) =>
        item.tpId === request.body?.tpId && item.id !== request.body.id &&
        item.tpId !== null
    );
  
    if (validateTpId) {
      throw new Error("TpId already exist");
    }
  }
  const validateName = global.tblVenues.find(
    (item) => item.name.toLowerCase() === request.body.name.toLowerCase() && item.id !== request.body.id
  );

  if (validateName) {
    throw new Error("Venue with this name already exist");
  }
  const updateData = {
    countryId: request.body.countryId ?? validateId.countryId,
    city: request.body.city ?? validateId.city,
    name: request.body.name ?? validateId.name,
    tpId: request.body.tpId === undefined ? validateId.tpId : request.body.tpId,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    capacity: request.body.capacity ?? validateId.capacity,
    avgInn1Score: request.body.avgInn1Score ?? validateId.avgInn1Score,
    avgInn2Score: request.body.avgInn2Score ?? validateId.avgInn2Score,
    avgInn3Score: request.body.avgInn3Score ?? validateId.avgInn3Score,
    avgInn4Score: request.body.avgInn4Score ?? validateId.avgInn4Score,
    highestTotalFullScore: request.body.highestTotalFullScore ?? validateId.highestTotalFullScore,
    lowestTotalFullScore: request.body.lowestTotalFullScore ?? validateId.lowestTotalFullScore,
    spinWicketsCount: request.body.spinWicketsCount ?? validateId.spinWicketsCount,
    paceWicketsCount: request.body.paceWicketsCount ?? validateId.paceWicketsCount,
    id: request.body.id ?? validateId.id,
  };

  const modifiedData = await updateVenueQuery(updateData, fastify, request);

  const index = global.tblVenues.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblVenues[index] = modifiedData[0];
    const allCommentaries = global.tblCommentaries.filter(c => c.venueId == modifiedData[0].id);
    for (const commentary of allCommentaries) {
      const sendDataForSocketUpdate = {
          commentaryId: commentary.commentaryId,
          eventRefId: commentary?.eventRefId,
          dataToUpdate: [
            {
              module: "venueReportData",
              type: "update",
              data: modifiedData[0]
            }
          ]
      };
      global.clientSocketIo?.forEach((socket) => {
        socket.client.emit("updateFullscore", sendDataForSocketUpdate);
      });
    }
  }
  
  return modifiedData[0];
};

const allVenuesService = async (request) => {
  const { isActive, countryId } = request.body || {};
  let result = global.tblVenues.filter((item) =>
    isActive !== undefined ? item.isActive === isActive : item.isActive === true
  );

  if (countryId) {
    result = result.filter((item) => item.countryId === countryId);
  }

  return result;
};

const venueByIdService = async (request) => {
  const { id } = request.body;
  const result = global.tblVenues.find((item) => item.id === id);
  return result || null;
};

const createVenueService = async (request, fastify) => {
  if (request.body.id == 0) {
    return await saveVenueService(request, fastify, request);
  } else {
    return await editVenueService(request, fastify, request);
  }
};

const deleteVenueService = async (request, fastify) => {
  const { id } = request.body;
  
  await deleteVenueQuery(id, fastify, request);
  global.tblVenues = global.tblVenues.filter(
    (item) => !id.includes(item.id)
  );

  return `Venue(s) data deleted successfully`;
};

const activeInactiveVenueService = async (request, fastify) => {
  const { id, isActive } = request.body;
  const validateId = global.tblVenues.find((item) => item.id === id);

  if (!validateId) {
    throw new Error("Venue with this Id not found");
  }
  await activeInactiveVenueQuery(
    {
      id,
      isActive,
    },
    request,
    fastify
  );
  const index = global.tblVenues.findIndex((item) => item.id == id);
  if (index != -1) {
    global.tblVenues[index].isActive = isActive;
  }
  
  return `Venue data updated successfully`;
};
module.exports = {
  createVenueService,
  allVenuesService,
  venueByIdService,
  deleteVenueService,
  activeInactiveVenueService,
};
