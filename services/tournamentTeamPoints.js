const {
  insertTournamentTeamPointsQuery,
  updateTournamentTeamPointsQuery,
  deleteTournamentTeamPointsQuery,
  activeInactiveTournamentTeamPointsQuery,
  updateTeamPointsQuery
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

const setTeamPointService = async (data,request, fastify) => {
  let dataToUpdate = [];
  for (let m of data){
    let tp1 = global.tblTournamentTeamPoint.findIndex(t => t.competitionId == m.competitionId && t.teamId == m.team1Id && t.isActive == true);
    if(tp1 !== -1){
      dataToUpdate.push({
        ...global.tblTournamentTeamPoint[tp1],
        totalMatches: global.tblTournamentTeamPoint[tp1].totalMatches + 1,
        totalWin : 
          m.winnerId != null &&
          m.winnerId == m.team1Id ? global.tblTournamentTeamPoint[tp1].totalWin + 1 : global.tblTournamentTeamPoint[tp1].totalWin,
        totalLose :
          m.winnerId != null &&
         m.winnerId != m.team1Id ? global.tblTournamentTeamPoint[tp1].totalLose + 1 : global.tblTournamentTeamPoint[tp1].totalLose,
      })
    }
    let tp2 = global.tblTournamentTeamPoint.findIndex(t => t.competitionId == m.competitionId && t.teamId == m.team2Id && t.isActive == true);
    if(tp2 !== -1){
      dataToUpdate.push({
        ...global.tblTournamentTeamPoint[tp2],
        totalMatches: global.tblTournamentTeamPoint[tp2].totalMatches + 1,
        totalWin : 
          m.winnerId != null &&
          m.winnerId == m.team2Id ? global.tblTournamentTeamPoint[tp2].totalWin + 1 : global.tblTournamentTeamPoint[tp2].totalWin,
        totalLose :
         m.winnerId != null &&
         m.winnerId != m.team2Id ? global.tblTournamentTeamPoint[tp2].totalLose + 1 : global.tblTournamentTeamPoint[tp2].totalLose,
      })
    }
  }
  for(let d of dataToUpdate){
    await updateTeamPointsQuery(d, fastify, request);
    const index = global.tblTournamentTeamPoint.findIndex(
      (ind) => ind.id === d.id
    );
    if (index !== -1) {
      global.tblTournamentTeamPoint[index] = d;
    }
  }
  return `Team point updated successfully`;
}
module.exports = {
  allTournamentTeamPointsService,
  saveTournamentTeamPointsService,
  deleteTournamentTeamPointsService,
  activeInactiveTournamentTeamPointsService,
  setTeamPointService
};
