const {
  insertCommentaryQuery,
  insertCommentaryTeams,
  insertCommentaryPlayers,
  updateCommentaryQuery,
  updateCommentaryTeams,
  deleteCommentaryPlayers,
  getCommentaryTeamsQuery,
  getCommentaryPlayersQuery,
  deleteCommentryQuery,
  getCommentaryByIdQuery,
  getAllCommentaryPlayerQuery,
  getAllCommentaryTeamsQuery,
  updateOverQuery,
  createOverQuery,
  updateCommentaryDetailsQuery,
  updateCommentaryTeamsQuery,
  updateCommentaryPlayersQuery,
  createBallByBallCommentoriesQuery,
  updateBallByBallCommentoriesQuery,
  updateCommentaryWicketQuery,
  createCommentaryWicketQuery,
  updateCommentaryPartnershipQuery,
  createCommentaryPartnershipQuery,
  deleteBallByBallCommentoriesQuery,
  deleteOverCommentoriesQuery
} = require("../repository/TableCommentary");

const allCommentaryService = async () => {
  return global.tblCommentaries;
};

const allDisplayStatusService = async () => {
  return global.tblDisplayStatus;
};

const commentaryByIdService = async (request, fastify) => {
  const result = await global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );

  if (!result) {
    throw new Error("Commentary with this id not Found");
  }

  const commentary = { ...result };

  const team1 = await getCommentaryTeamsQuery(
    { teamId: commentary.team1Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  const team2 = await getCommentaryTeamsQuery(
    { teamId: commentary.team2Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  const team1Players = await getCommentaryPlayersQuery(
    { teamId: commentary.team1Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  const team2Players = await getCommentaryPlayersQuery(
    { teamId: commentary.team2Id, commentaryId: request.body.commentaryId },
    fastify,
    request
  );

  commentary.team1Captain = team1.teamCaptain;
  commentary.team1Kipper = team1.teamKipper;
  commentary.team1Players = team1Players;
  commentary.team2Captain = team2.teamCaptain;
  commentary.team2Kipper = team2.teamKipper;
  commentary.team2Players = team2Players;
  commentary.commentaryId = request.body.commentaryId;

  return commentary;
};

const commentaryDetailsByIdService = async (request, fastify) => {
  const result = await global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );

  if (!result) {
    throw new Error("Commentary with this id not Found");
  }

  const commentaryTeams = await global.tblCommentaryTeams.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryPlayers = await global.tblCommentaryPlayers.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryOvers = await global.tblOvers.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryBallByBall = await global.tblCommentaryBallByBall.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryWicket = await global.tblCommentaryWicket.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const commentaryPartnership = await global.tblCommentaryPartnership.filter(
    (item) => item.commentaryId === request.body.commentaryId
  );

  const allDetails = {
    commentaryDetails: { ...result },
    commentaryTeams,
    commentaryPlayers,
    commentaryOvers,
    commentaryBallByBall,
    commentaryWicket,
    commentaryPartnership,
  };

  return allDetails;
};

const createCommentaryService = async (request, fastify) => {
  if (request.body.eventTypeId) {
    const validateEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );

    if (!validateEventTypeId) {
      throw new Error("EventType with this id not Found");
    }
  }

  if (request.body.matchTypeId) {
    const validateMatchTypeId = global.tblMatchTypes.find(
      (item) => item.matchTypeId === request.body.matchTypeId
    );

    if (!validateMatchTypeId) {
      throw new Error("MatchType with this id not Found");
    }
  }

  if (
    request.body.team1Id &&
    request.body.team2Id &&
    request.body.team1Id === request.body.team2Id
  ) {
    throw new Error("Team1 and Team2 can't be same");
  }

  if (request.body.team1Id) {
    const validateTeam1Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team1Id
    );

    if (!validateTeam1Id) {
      throw new Error("Team1 with this id not Found");
    }
  }

  if (request.body.team2Id) {
    const validateTeam2Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team2Id
    );

    if (!validateTeam2Id) {
      throw new Error("Team2 with this id not Found");
    }
  }

  if (request.body.team1Captain) {
    const validateTeam1Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team1Captain
    );

    if (!validateTeam1Captain) {
      throw new Error("Team1Captain with this id not Found");
    }
  }

  if (request.body.team2Captain) {
    const validateTeam2Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team2Captain
    );

    if (!validateTeam2Captain) {
      throw new Error("Team2Captain with this id not Found");
    }
  }

  const addCommentry = await insertCommentaryQuery(request, fastify);
  request.body.commentaryId = addCommentry.commentaryId;
  await insertCommentaryTeams(request, fastify);

  const data = [
    ...request.body.team1Players.map((item, i) => {
      return {
        commentaryId: addCommentry.commentaryId,
        teamId: request.body.team1Id,
        playerId: item,
        displayOrder: i + 1,
      };
    }),
    ...request.body.team2Players.map((item, i) => {
      return {
        commentaryId: addCommentry.commentaryId,
        teamId: request.body.team2Id,
        playerId: item,
        displayOrder: i + 1,
      };
    }),
  ];

  for (let info of data) {
    await insertCommentaryPlayers(info, fastify, request);
  }

  global.tblCommentaries.push(addCommentry);
  global.tblCommentaryPlayers = await getAllCommentaryPlayerQuery(fastify);
  global.tblCommentaryTeams = await getAllCommentaryTeamsQuery(fastify);

  return addCommentry;
};

const updateCommentaryService = async (request, fastify) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === request.body.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  if (request.body.eventTypeId) {
    const validateEventTypeId = global.tblEventTypes.find(
      (item) => item.eventTypeId === request.body.eventTypeId
    );

    if (!validateEventTypeId) {
      throw new Error("EventType with this id not Found");
    }
  }

  if (request.body.matchTypeId) {
    const validateMatchTypeId = global.tblMatchTypes.find(
      (item) => item.matchTypeId === request.body.matchTypeId
    );

    if (!validateMatchTypeId) {
      throw new Error("MatchType with this id not Found");
    }
  }

  if (request.body.team1Id === request.body.team2Id) {
    throw new Error("Team1 and Team2 can't be same");
  }

  if (request.body.team1Id) {
    const validateTeam1Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team1Id
    );

    if (!validateTeam1Id) {
      throw new Error("Team1 with this id not Found");
    }
  }

  if (request.body.team2Id) {
    const validateTeam2Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team2Id
    );

    if (!validateTeam2Id) {
      throw new Error("Team2 with this id not Found");
    }
  }

  if (request.body.team1Captain) {
    const validateTeam1Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team1Captain
    );

    if (!validateTeam1Captain) {
      throw new Error("Team1Captain with this id not Found");
    }
  }

  if (request.body.team2Captain) {
    const validateTeam2Captain = global.tblPlayers.find(
      (item) => item.playerId === request.body.team2Captain
    );

    if (!validateTeam2Captain) {
      throw new Error("Team2Captain with this id not Found");
    }
  }

  await updateCommentaryQuery(request, fastify);

  await updateCommentaryTeams(request, fastify, {
    teamCaptain: request.body.team1Captain,
    teamKipper: request.body.team1Kipper,
    teamId: request.body.team1Id,
    commentaryId: request.body.commentaryId,
  });
  await updateCommentaryTeams(request, fastify, {
    teamCaptain: request.body.team2Captain,
    teamKipper: request.body.team2Kipper,
    teamId: request.body.team2Id,
    commentaryId: request.body.commentaryId,
  });

  await deleteCommentaryPlayers(request, fastify);

  const data = [
    ...request.body.team1Players.map((item, i) => {
      return {
        commentaryId: request.body.commentaryId,
        teamId: request.body.team1Id,
        playerId: item,
        displayOrder: i + 1,
      };
    }),
    ...request.body.team2Players.map((item, i) => {
      return {
        commentaryId: request.body.commentaryId,
        teamId: request.body.team2Id,
        playerId: item,
        displayOrder: i + 1,
      };
    }),
  ];

  for (let info of data) {
    await insertCommentaryPlayers(info, fastify, request);
  }

  const updatedData = await getCommentaryByIdQuery(request, fastify);

  global.tblCommentaries[index] = updatedData;
  global.tblCommentaryPlayers = getAllCommentaryPlayerQuery(fastify);
  global.tblCommentaryTeams = getAllCommentaryTeamsQuery(fastify);

  return updatedData;
};

const saveCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;

  if (commentaryId === "0") {
    return await createCommentaryService(request, fastify);
  } else {
    return await updateCommentaryService(request, fastify);
  }
};

const deleteCommentaryService = async (request, fastify) => {
  const { commentaryId } = request.body;

  for (const commentary of commentaryId) {
    await deleteCommentryQuery(commentary, request, fastify);
  }

  global.tblCommentaries = global.tblCommentaries.filter(
    (item) => !commentaryId.includes(item.commentaryId)
  );

  return `Commentaries deleted successfully`;
};

//update commentary details according to new flow
const saveCommentaryDetailsService = async (request, fastify) => {
  const {
    commentaryDetails,
    commentaryTeams,
    commentaryPlayers,
    commentaryOvers,
    commentaryBallByBall,
    commentaryWicket,
    commentaryPartnership,
  } = request.body;

  let response = {};

  if (commentaryDetails) {
    await updateCommentaryDetailsServices(commentaryDetails, fastify, request);
  }

  if (commentaryTeams && commentaryTeams.length) {
    for (const team of commentaryTeams) {
      await updateCommentaryTeamsServices(team, fastify, request);
    }
  }

  if (commentaryPlayers && commentaryPlayers.length) {
    for (const player of commentaryPlayers) {
      await updateCommentaryPlayerDetailsServices(player, fastify, request);
    }
  }

  if (commentaryOvers) {
    response.overdetails = await saveOverService(
      commentaryOvers,
      fastify,
      request
    );
  }

  if (commentaryBallByBall) {
    response.commentaryBallByBallDetails = await ballByBallCommentoriesService(
      commentaryBallByBall,
      fastify,
      request
    );
  }

  if (commentaryWicket) {
    response.commentaryWicketDetails = await saveCommentaryWicketService(
      commentaryWicket,
      fastify,
      request
    );
  }

  if (commentaryPartnership) {
    response.commentaryPartnershipDetails =
      await saveCommentaryPartnershipService(
        commentaryPartnership,
        fastify,
        request
      );
  }

  if (Object.keys(response).length) {
    return response;
  } else {
    return true;
  }
};

const updateCommentaryDetailsServices = async (
  commentaryDetails,
  fastify,
  request
) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === commentaryDetails.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateCommentaryDetailsQuery(commentaryDetails, fastify, request);

  global.tblCommentaries[index] = commentaryDetails;

  return commentaryDetails;
};

const updateCommentaryTeamsServices = async (teamDetails, fastify, request) => {
  const index = global.tblCommentaryTeams.findIndex(
    (item) =>
      item.commentaryId === teamDetails.commentaryId &&
      item.teamId === teamDetails.teamId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateCommentaryTeamsQuery(teamDetails, fastify, request);

  global.tblCommentaryTeams[index] = teamDetails;

  return teamDetails;
};

const updateCommentaryPlayerDetailsServices = async (
  playerDetails,
  fastify,
  request
) => {
  const index = global.tblCommentaryPlayers.findIndex(
    (item) => item.commentaryPlayerId === playerDetails.commentaryPlayerId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  await updateCommentaryPlayersQuery(playerDetails, fastify, request);

  global.tblCommentaryPlayers[index] = playerDetails;

  return playerDetails;
};

const saveOverService = async (overDetais, fastify, request) => {
  const { overId } = overDetais;

  if (overId === "0") {
    return await createOverService(overDetais, fastify, request);
  } else {
    return await updateOverService(overDetais, fastify, request);
  }
};

const createOverService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  const indexTeam = global.tblCommentaryTeams.findIndex(
    (item) =>
      item.commentaryId === data.commentaryId && item.teamId === data.teamId
  );

  if (indexTeam === -1) {
    throw new Error("Team with this id not Found");
  }

  const indexBowler = global.tblCommentaryPlayers.findIndex(
    (item) =>
      item.commentaryId === data.commentaryId &&
      item.teamId === data.teamId &&
      item.commentaryPlayerId === data.bowlerId
  );

  if (indexBowler === -1) {
    throw new Error("Bowler with this id not Found");
  }

  const addOver = await createOverQuery(data, fastify, request);

  global.tblOvers.push(addOver);

  return addOver;
};

const updateOverService = async (data, fastify, request) => {
  const indexOver = global.tblOvers.findIndex(
    (item) => item.overId === data.overId
  );

  if (indexOver === -1) {
    throw new Error("Over with this id not Found");
  }

  await updateOverQuery(data, fastify, request);

  global.tblOvers[indexOver] = data;

  return data;
};

const ballByBallCommentoriesService = async (data, fastify, request) => {
  const { commentaryBallByBallId } = data;

  if (commentaryBallByBallId === "0") {
    return await createBallByBallCommentoriesService(data, fastify, request);
  } else {
    return await updateBallByBallCommentoriesService(data, fastify, request);
  }
};

const createBallByBallCommentoriesService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  const addBallByBallCommentories = await createBallByBallCommentoriesQuery(
    data,
    fastify,
    request
  );

  global.tblCommentaryBallByBall.push(addBallByBallCommentories);

  return addBallByBallCommentories;
};

const updateBallByBallCommentoriesService = async (data, fastify, request) => {
  const indexBallByBall = global.tblCommentaryBallByBall.findIndex(
    (item) => item.commentaryBallByBallId === data.commentaryBallByBallId
  );

  if (indexBallByBall === -1) {
    throw new Error("BallByBall with this id not Found");
  }

  await updateBallByBallCommentoriesQuery(data, fastify, request);

  global.tblCommentaryBallByBall[indexBallByBall] = data;

  return data;
};

const saveCommentaryWicketService = async (data, fastify, request) => {
  const { commentaryWicketId } = data;

  if (commentaryWicketId === "0") {
    return await createCommentaryWicketService(data, fastify, request);
  } else {
    return await updateCommentaryWicketService(data, fastify, request);
  }
};

const createCommentaryWicketService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  const addCommentaryWicket = await createCommentaryWicketQuery(
    data,
    fastify,
    request
  );

  global.tblCommentaryWicket.push(addCommentaryWicket);

  return addCommentaryWicket;
};

const updateCommentaryWicketService = async (data, fastify, request) => {
  const indexWicket = global.tblCommentaryWicket.findIndex(
    (item) => item.commentaryWicketId === data.commentaryWicketId
  );

  if (indexWicket === -1) {
    throw new Error("Wicket with this id not Found");
  }

  await updateCommentaryWicketQuery(data, fastify, request);

  global.tblCommentaryWicket[indexWicket] = data;

  return data;
};

const saveCommentaryPartnershipService = async (data, fastify, request) => {
  const { commentaryPartnershipId } = data;

  if (commentaryPartnershipId === "0") {
    return await createCommentaryPartnershipService(data, fastify, request);
  } else {
    return await updateCommentaryPartnershipService(data, fastify, request);
  }
};

const createCommentaryPartnershipService = async (data, fastify, request) => {
  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === data.commentaryId
  );

  if (index === -1) {
    throw new Error("Commentary with this id not Found");
  }

  const addCommentaryPartnership = await createCommentaryPartnershipQuery(
    data,
    fastify,
    request
  );

  global.tblCommentaryPartnership.push(addCommentaryPartnership);

  return addCommentaryPartnership;
};

const updateCommentaryPartnershipService = async (data, fastify, request) => {
  const indexPartnership = global.tblCommentaryPartnership.findIndex(
    (item) => item.commentaryPartnershipId === data.commentaryPartnershipId
  );

  if (indexPartnership === -1) {
    throw new Error("Partnership with this id not Found");
  }

  await updateCommentaryPartnershipQuery(data, fastify, request);

  global.tblCommentaryPartnership[indexPartnership] = data;

  return data;
};

const deleteBallByBallCommentoriesService = async (request, fastify) => {
  const { commentaryBallByBallId } = request.body;

  const index = global.tblCommentaryBallByBall.findIndex(
    (item) => item.commentaryBallByBallId === commentaryBallByBallId
  );

  if (index === -1) {
    throw new Error("BallByBall with this id not Found");
  }

  await deleteBallByBallCommentoriesQuery(commentaryBallByBallId, request, fastify);

  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
    (item) => item.commentaryBallByBallId !== commentaryBallByBallId
  );

  return true;
  s;
};
const deleteOverCommentoriesService = async (request, fastify) => {
  const { commentaryOverId } = request.body;
  const index = global.tblOvers.findIndex(
    (item) => item.overId === commentaryOverId
  );

  if (index === -1) {
    throw new Error("OverId with this id not Found");
  }

  await deleteOverCommentoriesQuery(commentaryOverId, request, fastify);

  global.tblOvers = global.tblOvers.filter(
    (item) => item.overId !== commentaryOverId
  );

  return true;
};



module.exports = {
  allCommentaryService,
  commentaryByIdService,
  saveCommentaryService,
  deleteCommentaryService,
  allDisplayStatusService,
  commentaryDetailsByIdService,
  saveCommentaryDetailsService,
  deleteBallByBallCommentoriesService,
  deleteOverCommentoriesService
};
