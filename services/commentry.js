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
  deleteOverCommentoriesQuery,
  UpdateCommentaryTimeQuery,
  getCommentaryID_Socket,
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

  const validateMatchTypeId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );

  if (validateMatchTypeId) {
    if (
      validateMatchTypeId?.batsmenPerInings &&
      validateMatchTypeId?.batsmenPerInings > 0
    ) {
      const TotalInnning = validateMatchTypeId?.batsmenPerInings;
      for (let i = 0; i < TotalInnning; i++) {
        request.body.currentInnings = i + 1;
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
          await insertCommentaryPlayers(
            info,
            request.body.currentInnings,
            fastify,
            request
          );
        }
      }
    } else {
      const currentinning = 1;
      request.body.currentInnings = currentinning;
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
        await insertCommentaryPlayers(info, currentinning, fastify, request);
      }
    }
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

  const validateMatchTypeId = global.tblMatchTypes.find(
    (item) => item.matchTypeId === request.body.matchTypeId
  );
  if (validateMatchTypeId) {
    if (validateMatchTypeId?.isExtraInings) {
      const TotalInnning = validateMatchTypeId?.batsmenPerInings;
      for (let i = 0; i < TotalInnning; i++) {
        request.body.currentInnings = i + 1;
        await updateCommentaryTeams(request, fastify, {
          teamCaptain: request.body.team1Captain,
          teamKipper: request.body.team1Kipper,
          teamId: request.body.team1Id,
          commentaryId: request.body.commentaryId,
          currentInnings: request.body.currentInnings,
        });
        await updateCommentaryTeams(request, fastify, {
          teamCaptain: request.body.team2Captain,
          teamKipper: request.body.team2Kipper,
          teamId: request.body.team2Id,
          commentaryId: request.body.commentaryId,
          currentInnings: request.body.currentInnings,
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
          await insertCommentaryPlayers(
            info,
            request.body.currentInnings,
            fastify,
            request
          );
        }
      }
    } else {
      const currentinning = 1;
      request.body.currentInnings = currentinning;
      await updateCommentaryTeams(request, fastify, {
        teamCaptain: request.body.team1Captain,
        teamKipper: request.body.team1Kipper,
        teamId: request.body.team1Id,
        commentaryId: request.body.commentaryId,
        currentInnings: request.body.currentInnings,
      });
      await updateCommentaryTeams(request, fastify, {
        teamCaptain: request.body.team2Captain,
        teamKipper: request.body.team2Kipper,
        teamId: request.body.team2Id,
        commentaryId: request.body.commentaryId,
        currentInnings: request.body.currentInnings,
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
        await insertCommentaryPlayers(info, currentinning, fastify, request);
      }
    }
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
  let _CommentaryId = "";
  //Get Commentry ID
  if (commentaryDetails) {
    _CommentaryId = commentaryDetails.commentaryId;
  }
  //end here Commenrtyid
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
  if (_CommentaryId) {
    const _id = {
      commentaryId: _CommentaryId,
    };
    await UpdateCommentaryTime(_id, fastify, request);
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

  await deleteBallByBallCommentoriesQuery(
    commentaryBallByBallId,
    request,
    fastify
  );

  global.tblCommentaryBallByBall = global.tblCommentaryBallByBall.filter(
    (item) => item.commentaryBallByBallId !== commentaryBallByBallId
  );
  global.tblCommentaryWicket = global.tblCommentaryWicket.filter(
    (item) => item.commentaryBallByBallId !== commentaryBallByBallId
  );
  global.tblCommentaryPartnership = global.tblCommentaryPartnership.filter(
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

const commentaryDetailsByEventIdService = async (request, fastify) => {
  const result = await global.tblCommentaries.find(
    (item) => item.eventId === request.body.eventId
  );

  if (!result) {
    throw new Error("Commentary with this id not Found");
  }
  const resultArr = {
    eid: "",
    til: "",
    toss: "",
    scot: "",
    scor: "",
    scov: "",
    t1n: "",
    t1sn: "",
    t1s: "",
    t1im: "",
    t2n: "",
    t2sn: "",
    t2s: "",
    t2im: "",
    par: "",
    lawkt: "",
    rer: "",
    reb: "",
    crr: "",
    rrr: "",
    cin: "",
    tmd: "",
    dis: "",
    isc: "",
    sts: "",
    rmk: "",
    win: "",
  };
  let eid;
  let til;
  let toss;
  let scot;
  let scor;
  let scov;
  let t1n;
  let t1nid = 0;
  let t1sn;
  let t1s;
  let t1im;
  let t2n;
  let t2nid = 0;
  let t2sn;
  let t2s;
  let t2im;
  let par;
  let lawkt;
  let rer;
  let reb;
  let crr;
  let rrr;
  let cin;
  let tmd;
  let dis;
  let isc;
  let sts;
  let rmk;
  let win;
  let getstatus = 0;
  let tossteam;
  let tossType;
  let cid = 0;
  let batid = 0;
  let ballid = 0;
  let mtype = 0;
  let bovr = 0;
  // Basic elements are set
  cid = result.commentaryId;
  eid = result.eventId.toString();
  til = result.eventName;
  getstatus = result.commentaryStatus;
  dis = result.eventDate;
  t1nid = result.team1Id;
  t2nid = result.team2Id;
  mtype = result.matchTypeId;
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.filter(
    (item) => item.commentaryId === cid && item.teamId === t1nid
  );

  const matchType = await global.tblMatchTypes.filter(
    (item) => item.matchTypeId === mtype
  );

  const mt = matchType.map((mt) => ({
    tov: mt.totalOversInMatch,
    bpo: mt.ballsPerOver,
  }));

  const commentaryTeamsTwo = await global.tblCommentaryTeams.filter(
    (item) => item.commentaryId === cid && item.teamId === t2nid
  );
  if (commentaryTeamsOne.length > 0) {
    t1sn = commentaryTeamsOne[0].shortName;
    t1n = commentaryTeamsOne[0].teamName;
    const wicket1 =
      commentaryTeamsOne[0].teamWicket === null
        ? 0
        : commentaryTeamsOne[0].teamWicket;
    const overs1 =
      commentaryTeamsOne[0].teamOver === null
        ? 0.0
        : commentaryTeamsOne[0].teamOver;
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? 0;
    t1s = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo.length > 0) {
    t2sn = commentaryTeamsTwo[0].shortName;
    t2n = commentaryTeamsTwo[0].teamName;
    const wicket1 =
      commentaryTeamsTwo[0].teamWicket === null
        ? 0
        : commentaryTeamsTwo[0].teamWicket;
    const overs1 =
      commentaryTeamsTwo[0].teamOver === null
        ? 0.0
        : commentaryTeamsTwo[0].teamOver;
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? 0;
    t2s = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }
  //teams Images are Ser
  const _teamsC1 = await global.tblTeams.filter(
    (item) => item.teamId === t1nid
  );
  t1im = _teamsC1[0].image;
  const _teamsC2 = await global.tblTeams.filter(
    (item) => item.teamId === t2nid
  );
  t2im = _teamsC2[0].image;

  if (getstatus == 1) {
    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = "Toss Not Done Yet";
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = "Toss Not Done Yet";
    resultArr.win = "";
  }
  if (getstatus == 2) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsOTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
  }
  if (getstatus == 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsOTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
  }
  if (getstatus > 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsOTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }
    toss = tossteam + tossType;
    //get Current Batting Team and
    if (commentaryTeamsOne[0].teamStatus == 1) {
      batid = commentaryTeamsOne[0].teamId;
      ballid = commentaryTeamsTwo[0].teamId;
      scot = commentaryTeamsOne[0]?.shortName ?? 0;
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? 0;
      crr = commentaryTeamsOne[0]?.crr ?? 0;
      rrr = commentaryTeamsOne[0]?.rrr ?? 0;
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? 0;
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? 0;
      crr = commentaryTeamsTwo[0]?.crr ?? 0;
      rrr = commentaryTeamsTwo[0]?.rrr ?? 0;
    }

    const commentaryWicket = await global.tblCommentaryWicket
      .filter((item) => item.commentaryId === cid && item.teamId === batid)
      .slice(-1)[0]; // Get the last 1 overs;

    let _playerWicket;
    let _playerWiktRun;
    let _playerWiktRBall;
    if (commentaryWicket) {
      _playerWicket = commentaryWicket?.batterName ?? "";
      _playerWiktRun = commentaryPartnership?.playerRun ?? 0;
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? 0;
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    const commentaryPartnership = await global.tblCommentaryPartnership
      .filter((item) => item.commentaryId === cid && item.teamId === batid)
      .slice(-1)[0]; // Get the last 1 overs

    let _partRuns = commentaryPartnership?.totalRuns ?? 0;
    let _partBall = commentaryPartnership?.totalBalls ?? 0;
    par = _partRuns + "(" + _partBall + ")";

    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = scot;
    resultArr.scor = scor;
    resultArr.scov = scov;
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = par;
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = crr;
    resultArr.rrr = rrr;
    resultArr.cin = result.commentaryStatus.toString();
    resultArr.tmd = "";
    resultArr.dis = dis;
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
  }
  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === batid &&
      item.onStrike !== null
  );

  const commentaryPlayersBowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === ballid &&
      item.bowlerOnStrike !== null
  );

  const cbt = commentaryPlayers_batter.map((player) => ({
    pid: player.playerId,
    batn: player.playerName,
    trun: player.batRun || 0,
    tball: player.batBall || 0,
    t4: player.batFour || 0,
    t6: player.batSix || 0,
    sr: player.batSrr || 0,
    os: player.onStrike,
  }));

  const cbl = commentaryPlayersBowler.map((bowler) => ({
    pid: bowler.playerId,
    pn: bowler.playerName,
    tov: bowler.bowlerOver || 0,
    cob: bowler.bowlerCurrentBall || 0,
    trun: bowler.bowlerRun || 0,
    t4: bowler.bowlerFour || 0,
    t6: bowler.bowlerSix || 0,
    twr: bowler.bowlerWideBallRun || 0,
    twb: bowler.bowlerWideBall || 0,
    tnr: bowler.bowlerNoBallRun || 0,
    tnb: bowler.bowlerNoBall || 0,
    mov: bowler.bowlerMaidenOver || 0,
    twik: bowler.bowlerTotalWicket || 0.0,
    eco: parseFloat(bowler.bowlerEconomy) || 0.0,
    dob: bowler.bowlerDotBall || 0,
    exr:
      bowler.bowlerWideBallRun ||
      0 + bowler.bowlerNoBallRun ||
      0 + bowler.bowlerByeBallRun ||
      0 + bowler.bowlerLegByeBallRun ||
      0,
  }));

  const commentaryOvers = global.tblOvers
    .filter((item) => item.commentaryId === cid)
    .slice(-2); // Get the last 2 overs

  const last2OversIds = commentaryOvers.map((over) => over.overId);

  const commentaryBallByBall = global.tblCommentaryBallByBall.filter((item) =>
    last2OversIds.includes(item.overId)
  );
  const cbb = commentaryBallByBall.map((ball) => ({
    bbi: ball.commentaryBallByBallId,
    bai: ball.batStrikeId,
    nsbi: ball.batNonStrikeId,
    boi: 0,
    oid: ball.overId,
    ocn: parseFloat(ball.overCount),
    run: ball.ballRun || 0,
    nbr: ball.ballExtraRun || 0,
    wbr: ball.ballWideBallRun || 0,
    byr: ball.ballByeBallRun || 0,
    lbr: ball.ballLegByeBallRun || 0,
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || 0,
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
  }));

  const allDetails = {
    cm: { ...resultArr },
    cbb,
    cbt,
    cbl,
    mt,
  };

  return allDetails;
};

const commentaryDetailsByCommentaryIdService = async (request, fastify) => {
  const result = await global.tblCommentaries.find(
    (item) => item.commentaryId === request.body.commentaryId
  );

  if (!result) {
    throw new Error("Commentary with this id not Found");
  }
  const resultArr = {
    eid: "",
    til: "",
    toss: "",
    scot: "",
    scor: "",
    scov: "",
    t1n: "",
    t1sn: "",
    t1s: "",
    t1im: "",
    t2n: "",
    t2sn: "",
    t2s: "",
    t2im: "",
    par: "",
    lawkt: "",
    rer: "",
    reb: "",
    crr: "",
    rrr: "",
    cin: "",
    tmd: "",
    dis: "",
    isc: "",
    sts: "",
    rmk: "",
    win: "",
  };
  let eid;
  let til;
  let toss;
  let scot;
  let scor;
  let scov;
  let t1n;
  let t1nid = 0;
  let t1sn;
  let t1s;
  let t1im;
  let t2n;
  let t2nid = 0;
  let t2sn;
  let t2s;
  let t2im;
  let par;
  let lawkt;
  let rer;
  let reb;
  let crr;
  let rrr;
  let cin;
  let tmd;
  let dis;
  let isc;
  let sts;
  let rmk;
  let win;
  let getstatus = 0;
  let tossteam;
  let tossType;
  let cid = 0;
  let batid = 0;
  let ballid = 0;
  let mtype = 0;
  let bovr = 0;
  // Basic elements are set
  cid = result.commentaryId;
  eid = result.eventId.toString();
  til = result.eventName;
  getstatus = result.commentaryStatus;
  dis = result.eventDate;
  t1nid = result.team1Id;
  t2nid = result.team2Id;
  mtype = result.matchTypeId;
  //teams set
  const commentaryTeamsOne = await global.tblCommentaryTeams.filter(
    (item) => item.commentaryId === cid && item.teamId === t1nid
  );

  const matchType = await global.tblMatchTypes.filter(
    (item) => item.matchTypeId === mtype
  );

  const mt = matchType.map((mt) => ({
    tov: mt.totalOversInMatch,
    bpo: mt.ballsPerOver,
  }));

  const commentaryTeamsTwo = await global.tblCommentaryTeams.filter(
    (item) => item.commentaryId === cid && item.teamId === t2nid
  );
  if (commentaryTeamsOne.length > 0) {
    t1sn = commentaryTeamsOne[0].shortName;
    t1n = commentaryTeamsOne[0].teamName;
    const wicket1 =
      commentaryTeamsOne[0].teamWicket === null
        ? 0
        : commentaryTeamsOne[0].teamWicket;
    const overs1 =
      commentaryTeamsOne[0].teamOver === null
        ? 0.0
        : commentaryTeamsOne[0].teamOver;
    const teamScore1 = commentaryTeamsOne[0]?.teamScore ?? 0;
    t1s = teamScore1 + "/" + wicket1 + "(" + overs1 + ")";
  }

  if (commentaryTeamsTwo.length > 0) {
    t2sn = commentaryTeamsTwo[0].shortName;
    t2n = commentaryTeamsTwo[0].teamName;
    const wicket1 =
      commentaryTeamsTwo[0].teamWicket === null
        ? 0
        : commentaryTeamsTwo[0].teamWicket;
    const overs1 =
      commentaryTeamsTwo[0].teamOver === null
        ? 0.0
        : commentaryTeamsTwo[0].teamOver;
    const teamScore2 = commentaryTeamsTwo[0]?.teamScore ?? 0;
    t2s = teamScore2 + "/" + wicket1 + "(" + overs1 + ")";
  }
  //teams Images are Ser
  const _teamsC1 = await global.tblTeams.filter(
    (item) => item.teamId === t1nid
  );
  t1im = _teamsC1[0].image;
  const _teamsC2 = await global.tblTeams.filter(
    (item) => item.teamId === t2nid
  );
  t2im = _teamsC2[0].image;

  if (getstatus == 1) {
    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = "Toss Not Done Yet";
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = "Toss Not Done Yet";
    resultArr.win = "";
  }
  if (getstatus == 2) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsOTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
  }
  if (getstatus == 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsOTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }

    toss = tossteam + tossType;
    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = "";
    resultArr.scor = "";
    resultArr.scov = "";
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = "";
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = "";
    resultArr.rrr = "";
    resultArr.cin = "";
    resultArr.tmd = "";
    resultArr.dis = "";
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
  }
  if (getstatus > 3) {
    const _tosswonby = result.tossWonBy;
    if (commentaryTeamsOne[0].teamId == _tosswonby) {
      tossteam = commentaryTeamsOne[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    } else {
      tossteam = commentaryTeamsOTwo[0].shortName;
      tossType =
        result.choseTo === 1
          ? " won the toss and opt to bat"
          : " won the toss and opt to bowl";
    }
    toss = tossteam + tossType;
    //get Current Batting Team and
    if (commentaryTeamsOne[0].teamStatus == 1) {
      batid = commentaryTeamsOne[0].teamId;
      ballid = commentaryTeamsTwo[0].teamId;
      scot = commentaryTeamsOne[0]?.shortName ?? 0;
      scor =
        commentaryTeamsOne[0]?.teamScore ??
        0 + "/" + commentaryTeamsOne[0]?.teamWicket ??
        0;
      scov = commentaryTeamsOne[0]?.teamOver ?? 0;
      crr = commentaryTeamsOne[0]?.crr ?? 0;
      rrr = commentaryTeamsOne[0]?.rrr ?? 0;
    } else {
      batid = commentaryTeamsTwo[0].teamId;
      ballid = commentaryTeamsOne[0].teamId;
      scot = commentaryTeamsTwo[0]?.shortName ?? 0;
      scor =
        commentaryTeamsTwo[0]?.teamScore ??
        0 + "/" + commentaryTeamsTwo[0]?.teamWicket ??
        0;
      scov = commentaryTeamsTwo[0]?.teamOver ?? 0;
      crr = commentaryTeamsTwo[0]?.crr ?? 0;
      rrr = commentaryTeamsTwo[0]?.rrr ?? 0;
    }

    const commentaryWicket = await global.tblCommentaryWicket
      .filter((item) => item.commentaryId === cid && item.teamId === batid)
      .slice(-1)[0]; // Get the last 1 overs;

    let _playerWicket;
    let _playerWiktRun;
    let _playerWiktRBall;
    if (commentaryWicket) {
      _playerWicket = commentaryWicket?.batterName ?? "";
      _playerWiktRun = commentaryPartnership?.playerRun ?? 0;
      _playerWiktRBall = commentaryPartnership?.playerBalls ?? 0;
    }
    lawkt = _playerWicket + " " + _playerWiktRun + "(" + _playerWiktRBall + ")";
    lawkt = lawkt ?? "";
    const commentaryPartnership = await global.tblCommentaryPartnership
      .filter((item) => item.commentaryId === cid && item.teamId === batid)
      .slice(-1)[0]; // Get the last 1 overs

    let _partRuns = commentaryPartnership?.totalRuns ?? 0;
    let _partBall = commentaryPartnership?.totalBalls ?? 0;
    par = _partRuns + "(" + _partBall + ")";

    // Assign values to the resultArr object
    resultArr.eid = result.eventId.toString();
    resultArr.til = result.eventName;
    resultArr.toss = toss;
    resultArr.scot = scot;
    resultArr.scor = scor;
    resultArr.scov = scov;
    resultArr.t1n = t1sn;
    resultArr.t1sn = t1sn;
    resultArr.t1s = t1s;
    resultArr.t1im = t1im;
    resultArr.t2n = t2n;
    resultArr.t2sn = t2sn;
    resultArr.t2s = t2s;
    resultArr.t2im = t2im;
    resultArr.par = par;
    resultArr.lawkt = "";
    resultArr.rer = "";
    resultArr.reb = "";
    resultArr.crr = crr;
    resultArr.rrr = rrr;
    resultArr.cin = result.commentaryStatus.toString();
    resultArr.tmd = "";
    resultArr.dis = dis;
    resultArr.isc = "";
    resultArr.sts = result.commentaryStatus.toString();
    resultArr.rmk = toss;
    resultArr.win = "";
  }
  const commentaryPlayers_batter = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === batid &&
      item.onStrike !== null
  );

  const commentaryPlayersBowler = await global.tblCommentaryPlayers.filter(
    (item) =>
      item.commentaryId === cid &&
      item.teamId === ballid &&
      item.bowlerOnStrike !== null
  );

  const cbt = commentaryPlayers_batter.map((player) => ({
    pid: player.playerId,
    batn: player.playerName,
    trun: player.batRun || 0,
    tball: player.batBall || 0,
    t4: player.batFour || 0,
    t6: player.batSix || 0,
    sr: player.batSrr || 0,
    os: player.onStrike,
  }));

  const cbl = commentaryPlayersBowler.map((bowler) => ({
    pid: bowler.playerId,
    pn: bowler.playerName,
    tov: bowler.bowlerOver || 0,
    cob: bowler.bowlerCurrentBall || 0,
    trun: bowler.bowlerRun || 0,
    t4: bowler.bowlerFour || 0,
    t6: bowler.bowlerSix || 0,
    twr: bowler.bowlerWideBallRun || 0,
    twb: bowler.bowlerWideBall || 0,
    tnr: bowler.bowlerNoBallRun || 0,
    tnb: bowler.bowlerNoBall || 0,
    mov: bowler.bowlerMaidenOver || 0,
    twik: bowler.bowlerTotalWicket || 0.0,
    eco: parseFloat(bowler.bowlerEconomy) || 0.0,
    dob: bowler.bowlerDotBall || 0,
    exr:
      bowler.bowlerWideBallRun ||
      0 + bowler.bowlerNoBallRun ||
      0 + bowler.bowlerByeBallRun ||
      0 + bowler.bowlerLegByeBallRun ||
      0,
  }));

  const commentaryOvers = global.tblOvers
    .filter((item) => item.commentaryId === cid)
    .slice(-2); // Get the last 2 overs

  const last2OversIds = commentaryOvers.map((over) => over.overId);

  const commentaryBallByBall = global.tblCommentaryBallByBall.filter((item) =>
    last2OversIds.includes(item.overId)
  );
  const cbb = commentaryBallByBall.map((ball) => ({
    bbi: ball.commentaryBallByBallId,
    bai: ball.batStrikeId,
    nsbi: ball.batNonStrikeId,
    boi: 0,
    oid: ball.overId,
    ocn: parseFloat(ball.overCount),
    run: ball.ballRun || 0,
    nbr: ball.ballExtraRun || 0,
    wbr: ball.ballWideBallRun || 0,
    byr: ball.ballByeBallRun || 0,
    lbr: ball.ballLegByeBallRun || 0,
    pr: ball.ballPlayerId || null,
    isw: ball.ballIsWicket,
    bty: ball.ballType || 0,
    isb: ball.ballIsBoundry,
    isdel: ball.isDelete,
  }));

  const allDetails = {
    cm: { ...resultArr },
    cbb,
    cbt,
    cbl,
    mt,
  };

  return allDetails;
};

const UpdateCommentaryTime = async (data, fastify, request) => {
  const indexCommentary = global.tblCommentaries.findIndex(
    (item) => item.CommentaryId === data.CommentaryId
  );

  if (indexCommentary === -1) {
    throw new Error("Partnership with this id not Found");
  }

  await UpdateCommentaryTimeQuery(data, fastify, request);
  global.tblCommentaries[indexCommentary].updateTime = new Date();

  return true;
};

const getCurrentUpdatedCommentaryIDService = async (data, fastify, request) => {
  return await getCommentaryID_Socket(data, fastify, request);
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
  deleteOverCommentoriesService,
  //nitesh Updated
  commentaryDetailsByEventIdService,
  commentaryDetailsByCommentaryIdService,
  UpdateCommentaryTime,
  getCurrentUpdatedCommentaryIDService,
};
