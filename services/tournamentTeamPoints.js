const {
  insertTournamentTeamPointsQuery,
  updateTournamentTeamPointsQuery,
  deleteTournamentTeamPointsQuery,
  activeInactiveTournamentTeamPointsQuery
} = require("../repository/TableTournmentTeamPoints");

const allTournamentTeamPointsService = async (request) => {
  const { competitionId, teamId, groupId, isActive } = request.body;
  const result = global.tblTournamentTeamPoint.filter((item) => {
    const competitionMatch = competitionId !== undefined ? item.competitionId === competitionId : true;
    const teamMatch = teamId !== undefined ? item.teamId === teamId : true;
    const groupMatch = groupId !== undefined ? item.groupId === groupId : true;
    const isActiveMatch = isActive !== undefined ? item.isActive === isActive : item.isActive === true

    return competitionMatch && teamMatch && groupMatch && isActiveMatch;
  });

  return result;
};

const createTournamentTeamPointsService = async (newItems, fastify, request) => {
  const insertData = newItems.map(async (item) => {
    const saveData = await insertTournamentTeamPointsQuery(item, fastify, request);
    global.tblTournamentTeamPoint.push(saveData);
  });
  await Promise.all(insertData);
  return `TournamentTeamPoints added successfully`;
};

const updateTournamentTeamPointsService = async (existingItems, fastify, request) => {    
  const editData = existingItems.map(async (item) => {
    const validateId = global.tblTournamentTeamPoint.find(
      (elem) => elem.id === item.id
    );
    if (!validateId) {
      throw new Error("TournamentTeamPoints Id not Found");
    }

    const updateData = {
      groupId: item.groupId || validateId.groupId,
      teamId: item.teamId || validateId.teamId,
      competitionId: item.competitionId || validateId.competitionId,
      totalMatches: item.totalMatches || validateId.totalMatches,
      totalWin: item.totalWin || validateId.totalWin,
      totalLose: item.totalLose || validateId.totalLose,
      totalTie: item.totalTie || validateId.totalTie,
      noResult: item.noResult || validateId.noResult,
      totalPoint: item.totalPoint || validateId.totalPoint,
      netRunRate: item.netRunRate || validateId.netRunRate,
      isActive: item.isActive || validateId.isActive,
      id: item.id,
    };

    await updateTournamentTeamPointsQuery(updateData, fastify, request);

    const index = global.tblTournamentTeamPoint.findIndex(
      (ind) => ind.id === updateData.id
    );
    if (index !== -1) {
      global.tblTournamentTeamPoint[index] = updateData;
    }
  });

  await Promise.all(editData);
  return `TournamentTeamPoints added successfully`;
};

const saveTournamentTeamPointsService = async (request, fastify) => {
  const newItems = request.body.filter((item) => item.id === 0);
  const existingItems = request.body.filter((item) => item.id !== 0);

  if (newItems.length > 0) {
    await createTournamentTeamPointsService(newItems, fastify, request);
  }

  if (existingItems.length > 0) {
    await updateTournamentTeamPointsService(existingItems, fastify, request);
  }

  return `TournamentTeamPoints added successfully`;
};

const deleteTournamentTeamPointsService = async (request, fastify) => {
  const { id } = request.body;

  await deleteTournamentTeamPointsQuery(id, fastify, request);
  global.tblTournamentTeamPoint = global.tblTournamentTeamPoint.filter(
    (item) => !id.includes(item.id)
  );

  return `TournamentTeamPoint(s) deleted successfully`;
};

const activeInactiveTournamentTeamPointsService = async (request, fastify) => {
  const { id, isActive } = request.body;

  await activeInactiveTournamentTeamPointsQuery({ id, isActive }, request, fastify);
  const index = global.tblTournamentTeamPoint.findIndex((item) => item.id == id);
  if(index != -1){
    global.tblTournamentTeamPoint[index].isActive = isActive;
  }

  return `TournamentTeamPoint isActive stage updated successfully`;
};

module.exports = {
  allTournamentTeamPointsService,
  saveTournamentTeamPointsService,
  deleteTournamentTeamPointsService,
  activeInactiveTournamentTeamPointsService
};
