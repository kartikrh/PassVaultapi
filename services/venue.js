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
    tpId: request.body.tpId ?? validateId.tpId,
    isActive: Boolean(request.body.isActive) ?? validateId.isActive,
    capacity: request.body.capacity ?? validateId.capacity,
    id: request.body.id ?? validateId.id,
  };

  const modifiedData = await updateVenueQuery(updateData, fastify, request);

  const index = global.tblVenues.findIndex(
    (item) => item.id == request.body.id
  );

  if (index != -1) {
    global.tblVenues[index] = modifiedData[0];
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
