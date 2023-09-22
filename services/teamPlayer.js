const {
  insertTeamPlayerQuery,
  updateTeamPlayerQuery,
  deleteTeamPlayerQuery,
} = require("../repository/TableTeamPlayer");

const allTeamPlayerService = async () => {
  return global.tblTeamPlayers;
};
const allTeamPlayerByTeamIdService = async (request) => {
  const { teamId } = request.body;
  return global.tblTeamPlayers.filter((item) => item.teamId === teamId);
};

const teamPlayerByIdService = async (request) => {
  const { teamPlayerId } = request.body;
  const result = global.tblTeamPlayers.find(
    (item) => item.teamPlayerId === teamPlayerId
  );
  return result || null;
};

const addTeamPlayerService = async (request, fastify) => {
  const checkTeamId = global.tblTeams.find(
    (item) => item.teamId === request.body.teamId
  );

  if (!checkTeamId) {
    throw new Error("TeamId is not valid");
  }

  const checkPlayerId = global.tblPlayers.find(
    (item) => item.playerId === request.body.refPlayerId
  );

  if (!checkPlayerId) {
    throw new Error("PlayerId is not valid");
  }

  const checkPlayerExist = global.tblTeamPlayers.find(
    (item) =>
      item.teamId === request.body.teamId &&
      item.refPlayerId === request.body.refPlayerId
  );

  if (checkPlayerExist) {
    throw new Error("Player already exist in this team");
  }

  const data = await insertTeamPlayerQuery(
    { ...request.body, userId: request.userTokenInfo.WrUserId },
    fastify,
    request
  );

  global.tblTeamPlayers.push(data);

  return data;
};

const updateTeamPlayerService = async (request, fastify) => {
  const checkTeamPlayerId = global.tblTeamPlayers.find(
    (item) => item.teamPlayerId === request.body.teamPlayerId
  );

  if (!checkTeamPlayerId) {
    throw new Error("TeamPlayerId is not valid");
  }

  const body = {
    teamPlayerId: request.body.teamPlayerId,
    teamId: request.body.teamId || checkTeamPlayerId.teamId,
    refPlayerId: request.body.refPlayerId || checkTeamPlayerId.refPlayerId,
    playerOrder: request.body.playerOrder || checkTeamPlayerId.playerOrder,
    userId: request.userTokenInfo.WrUserId,
  };

  if (request.body.teamId) {
    const checkTeamId = global.tblTeams.find(
      (item) => item.teamId === request.body.teamId
    );

    if (!checkTeamId) {
      throw new Error("TeamId is not valid");
    }
  }
  if (request.body.refPlayerId) {
    const checkPlayerId = global.tblPlayers.find(
      (item) => item.playerId === request.body.refPlayerId
    );

    if (!checkPlayerId) {
      throw new Error("PlayerId is not valid");
    }
  }

  const checkPlayerExist = global.tblTeamPlayers.find(
    (item) =>
      item.teamId === body.teamId &&
      item.refPlayerId === body.refPlayerId &&
      item.teamPlayerId !== body.teamPlayerId
  );

  if (checkPlayerExist) {
    throw new Error("Player already exist in this team");
  }

  await updateTeamPlayerQuery(body, fastify, request);

  const index = global.tblTeamPlayers.findIndex(
    (item) => item.teamPlayerId === body.teamPlayerId
  );

  delete body.userId;

  global.tblTeamPlayers[index] = body;

  return body;
};

const saveTeamPlayerService = async (request, fastify) => {
  const { teamPlayerId } = request.body;

  if (teamPlayerId === "0") {
    return addTeamPlayerService(request, fastify);
  } else {
    return updateTeamPlayerService(request, fastify);
  }
};

const deleteTeamPlayerService = async (request, fastify) => {
  const { teamPlayerId } = request.body;

  await deleteTeamPlayerQuery(teamPlayerId, fastify, request);

  global.tblTeamPlayers = global.tblTeamPlayers.filter(
    (item) => !teamPlayerId.includes(item.teamPlayerId)
  );

  return "Team Player(s) deleted successfully";
};

module.exports = {
  allTeamPlayerService,
  teamPlayerByIdService,
  allTeamPlayerByTeamIdService,
  saveTeamPlayerService,
  deleteTeamPlayerService,
};
