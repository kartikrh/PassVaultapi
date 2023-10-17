const {
  insertCommentaryQuery,
  insertCommentaryTeams,
  insertCommentaryPlayers,
  updateCommentaryQuery,
  updateCommentaryTeams,
  deleteCommentaryPlayers,
  getCommentaryByIdQuery,
  getCommentaryTeamsQuery,
  getCommentaryPlayersQuery,
  deleteCommentryQuery,
} = require("../repository/TableCommentary");

const allCommentaryService = async () => {
  return global.tblCommentaries;
};

const commentaryByIdService = async (request, fastify) => {
  const commentary = await getCommentaryByIdQuery(request, fastify);

  if (!commentary) {
    throw new Error("Commentary with this id not Found");
  }

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

  return commentary;
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

  // if (
  //   request.body.homeSideTeam &&
  //   request.body.homeSideTeam !== request.body.team1Id &&
  //   request.body.homeSideTeam !== request.body.team2Id
  // ) {
  //   throw new Error("HomeSideTeam must be Team1 or Team2");
  // }

  // if (
  //   request.body.tossWonBy &&
  //   request.body.tossWonBy !== request.body.team1Id &&
  //   request.body.tossWonBy !== request.body.team2Id
  // ) {
  //   throw new Error("TossWonBy must be Team1 or Team2");
  // }

  // if (
  //   request.body.winnerId &&
  //   request.body.winnerId !== request.body.team1Id &&
  //   request.body.winnerId !== request.body.team2Id
  // ) {
  //   throw new Error("WinnerId must be Team1 or Team2");
  // }

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

  return addCommentry;
};

const updateCommentaryService = async (request, fastify) => {
  const validateCommentaryId = global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );

  if (!validateCommentaryId) {
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

  let team1Name = null;
  let team2Name = null;

  if (request.body.team1Id) {
    const validateTeam1Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team1Id
    );

    if (!validateTeam1Id) {
      throw new Error("Team1 with this id not Found");
    } else {
      team1Name = validateTeam1Id.teamName;
    }
  }

  if (request.body.team2Id) {
    const validateTeam2Id = global.tblTeams.find(
      (item) => item.teamId === request.body.team2Id
    );

    if (!validateTeam2Id) {
      throw new Error("Team2 with this id not Found");
    } else {
      team2Name = validateTeam2Id.teamName;
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
        displayOrder: i + 3,
      };
    }),
    ...request.body.team2Players.map((item, i) => {
      return {
        commentaryId: request.body.commentaryId,
        teamId: request.body.team2Id,
        playerId: item,
        displayOrder: i + 3,
      };
    }),
  ];

  for (let info of data) {
    await insertCommentaryPlayers(info, fastify, request);
  }

  const dataNeedToUpdate = {
    commentaryId: request.body.commentaryId,
    eventDate: request.body.eventDate || validateCommentaryId.eventDate,
    eventName: request.body.eventName || validateCommentaryId.eventName,
    displayStatus:
      request.body.displayStatus || validateCommentaryId.displayStatus,
    team1Name: team1Name || validateCommentaryId.team1Name,
    team2Name: team2Name || validateCommentaryId.team2Name,
  };

  const index = global.tblCommentaries.findIndex(
    (item) => item.commentaryId === request.body.commentaryId
  );

  global.tblCommentaries[index] = dataNeedToUpdate;

  return dataNeedToUpdate;
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

  // for (const commentary of commentaryId) {
  //   const validateCommentaryId = global.tblCommentaries.find(
  //     (item) => item.commentaryId === commentary
  //   );

  //   if (!validateCommentaryId) {
  //     throw new Error("Commentary with this id not Found");
  //   }
  // }

  for (const commentary of commentaryId) {
    await deleteCommentryQuery(commentary, request, fastify);
  }

  global.tblCommentaries = global.tblCommentaries.filter(
    (item) => !commentaryId.includes(item.commentaryId)
  );

  return `Commentaries deleted successfully`;
};

module.exports = {
  allCommentaryService,
  commentaryByIdService,
  saveCommentaryService,
  deleteCommentaryService,
};
