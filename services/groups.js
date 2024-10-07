const {
  insertGroupQuery,
  updateGroupQuery,
  deleteGroupsQuery,
  activeInactiveGroupsQuery,
} = require("../repository/TableGroups");

const allGroupsService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblGroups.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblGroups.filter((item) => item.isActive === true);
    return result;
  }
};

const groupByIdService = async (request) => {
  const { groupId } = request.body;
  const result = global.tblGroups.find((item) => item.groupId === groupId);
  return result || null;
};

const createGroupService = async (request, fastify) => {
  const saveData = await insertGroupQuery(request.body, fastify, request);
  global.tblGroups.push(saveData);
  return saveData;
};

const updateGroupsService = async (request, fastify) => {
  const validateId = global.tblGroups.find(
    (item) => item.groupId === request.body.groupId
  );
  if (!validateId) {
    throw new Error("Group Id not Found");
  }

  const updateData = {
    groupName: request.body.groupName || validateId.groupName,
    isActive: request.body.isActive || validateId.isActive,
    groupId: request.body.groupId,
  };

  await updateGroupQuery(updateData, fastify, request);

  const index = global.tblGroups.findIndex(
    (item) => item.groupId === updateData.groupId
  );
  if (index !== -1) {
    global.tblGroups[index] = updateData;
  }

  return updateData;
};

const saveGroupService = async (request, fastify) => {
  const { groupId } = request.body;

  if (groupId === 0) {
    return await createGroupService(request, fastify);
  } else {
    return await updateGroupsService(request, fastify);
  }
};

const deleteGroupService = async (request, fastify) => {
  const { groupId } = request.body;

  await deleteGroupsQuery(groupId, fastify, request);
  global.tblGroups = global.tblGroups.filter(
    (item) => !groupId.includes(item.groupId)
  );

  return `Group(s) deleted successfully`;
};

const activeInactiveGroupService = async (request, fastify) => {
  const { groupId, isActive } = request.body;
  const validateApiId = global.tblGroups.find(
    (item) => item.groupId === groupId
  );
  if (!validateApiId) {
    throw new Error("Group Id not found");
  }
  await activeInactiveGroupsQuery(
    {
      groupId,
      isActive,
    },
    request,
    fastify
  );

  const index = global.tblGroups.findIndex((item) => item.groupId === groupId);
  if (index != -1) {
    global.tblGroups[index].isActive = isActive;
  }

  return `IsActive stage updated successfully`;
};

module.exports = {
  allGroupsService,
  groupByIdService,
  saveGroupService,
  deleteGroupService,
  activeInactiveGroupService,
};
