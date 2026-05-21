const { signInUser, signOutUser, updateUserPasswordQuery } = require("../repository/TableUser");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const { deviceInfo, encrypt, decrypt, callClientAPI, APIEndpointModuleType } = require("../utilities/index");
const { generateToken } = require("../utilities/tokenization");
const { getTabsQuery, getUserWisePermisionQuery } = require("../repository/TableTabs.js");
const configConstants = require("../utilities/configConstants.js");
const { updateShowClientQuery, activeInactiveCommentaryQuery } = require("../repository/TableCommentary.js");
const { getMatchDataByCId } = require("./commentry.js");
const { getPlayersBattingHistoryByIdQuery } = require("../repository/TablePlayerHistory.js");
const { getAllPlayersByTeamIdAndMatchTypeIdQuery } = require("../repository/TableTeams.js");
const { errorLogger, commActionLogger } = require("../utilities/logger.js");

const signInAgentServices = async (request, fastify) => {
    const decryptedPassword = encrypt(request.body.password);
    const body = {
        userName: request.body.userName,
        password: decryptedPassword,
        deviceInfo: deviceInfo(request),
        token: uuidv4(),
    };

    const user = await signInUser(body, fastify);
    if (!user) {
        throw new Error("Incorrect user name or password");
    }
    if (user?.WrUserType != 2) {
        throw new Error("Incorrect userType");
    }
    const WrEId = user.WrEId;
    const ipAdress = requestIp.getClientIp(request);

    if (user.WrUserIp !== "0" && user.WrUserIp !== ipAdress) {
        throw new Error("Invalid IP Address");
    }

    if (WrEId) {
        const index = global.tblUsers.findIndex((user) => user.userId === WrEId);
        global.tblUsers[index].loginToken = body.token;
    }

    try {
        const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(WrEId);

        if (clientsInRoom?.size && !user.WrAllowMultipleLogin) {
            global.socketIo
                .to(WrEId)
                .emit("logout", "You have been removed from the room.");
            Array.from(clientsInRoom).forEach((id) =>
                global.socketIo.sockets.sockets.get(id).leave(WrEId)
            );
        }
    } catch (error) {
        console.log("Error in socket in signin", error);
    }

    const tokenPayload = {
        WrUserId: user.WrUserId,
        WrEId: user.WrEId,
        WrUserType: user.WrUserType,
        WrRoleId: user.WrRoleId,
        WrUserName: user.WrUserName,
        WrIsSuperAdmin: user.WrIsSuperAdmin,
        WrParentId: user.WrParentId,
        WrAllowMultipleLogin: user.WrAllowMultipleLogin,
        wrToken: body.token,
    };

    const token = generateToken(tokenPayload);

    return {
        token, userName: user.WrUserName, refData: {
            eventTypeId: user.wrEventTypeId,
            competitionId: user.wrCompetitionId
        }
    };
}

const signOutAgentServices = async (request, fastify) => {
    const { WrUserId, WrEId, WrAllowMultipleLogin, wrToken } = request.userTokenInfo;

    if (!WrAllowMultipleLogin) {
        try {
            const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(WrEId);
            global.socketIo
                .to(WrEId)
                .emit("logout", "You have been removed from the room.");

            if (clientsInRoom?.size) {
                Array.from(clientsInRoom).forEach((id) =>
                    global.socketIo.sockets.sockets.get(id).leave(WrEId)
                );
            }
        } catch (error) {
            console.log(
                `Error While Logging out user id ${WrUserId} from current device`,
                error
            );
        }
    }

    const userLoginInfo = {
        WrUserId,
        wrToken,
    };
    await signOutUser(userLoginInfo, fastify);

    const index = global.tblUsers.findIndex((user) => user.userId === WrEId);

    if (!WrAllowMultipleLogin || wrToken === global.tblUsers[index].loginToken) {
        global.tblUsers[index].loginToken = null;
    }

    return "success";
}

const getTabsService = async (request, fastify) => {
    const { WrIsSuperAdmin, WrUserType, WrRoleId } = request.userTokenInfo;

    const body = {
        displayType: WrIsSuperAdmin ? [1, 2, 0] : [WrUserType],
        roleId: WrRoleId,
        isSuperAdmin: WrIsSuperAdmin,
    };

    return await getTabsQuery(fastify, body);
}

const allCommentaryService = async (request, fastify) => {
  // return global.tblCommentaries;
  const {
    commentaryStatus,
    eventTypeId,
    competitionId,
    isVirtual,
    startDate,
    endDate,
    pythonId,
    matchTypeId,
  } = request.body;
  let result;
  if (commentaryStatus === undefined) {
    result = global.tblCommentaries.filter(
      (item) => ![4, 10].includes(item.commentaryStatus)
    );
    // result = global.tblCommentaries.filter(
    //   (item) => item.commentaryStatus === 1 || item.commentaryStatus === 3
    // );
  }
  if (commentaryStatus && commentaryStatus != 0) {
    result = global.tblCommentaries.filter(
      (item) => item.commentaryStatus === commentaryStatus
    );
  }
  if (commentaryStatus == 0) {
    result = global.tblCommentaries;
  }
  // if eventTypeId is provided then filter commentary by eventTypeId
  if (eventTypeId) {
    result = result.filter((item) => item.eventTypeId === eventTypeId);
  }

  if (isVirtual === true || isVirtual === false) {
    result = result.filter((item) => item.isVirtual === isVirtual);
  }

  if (competitionId) {
    result = result.filter((item) => item.competitionId === competitionId);
  }

  if (pythonId) {
    result = result.filter((item) => item.pythonId === pythonId);
  }

  if (matchTypeId) {
    result = result.filter((item) => item.matchTypeId === matchTypeId);
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (commentaryStatus === undefined) {
      result = result.filter((item) => {
        const eventDate = new Date(item.eventDate);

        // if (item.commentaryStatus === 1) {
        //   return eventDate >= start && eventDate <= end;
        // }
        if (item.commentaryStatus === 3) {
          return eventDate <= end;
        }

        return eventDate >= start && eventDate <= end;
      });
    } else {
      result = result.filter((item) => {
        const eventDate = new Date(item.eventDate);
        return eventDate >= start && eventDate <= end;
      });
    }
  }
  result = result.map(item => {
    const pythonAPI = global.tblPythonAPI.find(elem => elem.id == item.pythonId);
    item.developerName = pythonAPI?.developerName ?? null;
    return {
      ...item,
      developerName: pythonAPI?.developerName ?? null
    };
  });
  result.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  return result;
};

const allEventTypesService = async (request) => {
  const { isActive } = request.body;
  if (isActive !== undefined) {
    const result = global.tblEventTypes.filter(
      (item) => item.isActive === isActive
    );
    return result;
  } else {
    const result = global.tblEventTypes.filter(
      (item) => item.isActive === true
    );
    return result;
  }
};

const changeShowClientService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }
  const commentaryPlayers = global.tblCommentaryPlayers.filter(
    (item) => item.commentaryId == request.body.commentaryId
  );
  // update showClient
  if (commentaryPlayers.length == 0) {
    await updateShowClientQuery(
      {
        isClientShow: false,
        commentaryId: request.body.commentaryId,
      },
      request,
      fastify
    );
    global.tblCommentaries[commentary].isClientShow = false;
  } else {
    await updateShowClientQuery(request.body, request, fastify);
    global.tblCommentaries[commentary].isClientShow = request.body.isClientShow;
  }

    // if (global.tblCommentaries[commentary].isClientShow) {
    const cData = await getMatchDataByCId(
      {
        commentaryId: request.body.commentaryId,
      },
      request,
      fastify
    );

    await callClientAPI(
      {
        moduleType: APIEndpointModuleType.commentaryUpdate,
        data: {
          ...cData,
          isClientShow: request.body.isClientShow,
          type: "isClientShow",
        },
      },
      request,
      fastify,
      "services/agent.js/changeShowClientService"
    );
  // }

  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    const socketData = {
      commentaryId: request.body.commentaryId,
      isClientShow: global.tblCommentaries[commentary].isClientShow,
      isActive: global.tblCommentaries[commentary]?.isActive
    };
    
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateActionType", socketData);
    });
  }
  commActionLogger(
    {
      commentaryId: request.body.commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary Updated successfully",
      },
      apiName: "/agent/commentary/updateShowClient",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("agent isClietnShow commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/agent-commentary.js/changeShowClientService - commActionLogger",
      request
    );
  });

  return "Commentary Updated successfully";
};

const activeInactiveCommentaryService = async (request, fastify) => {
  // validate commentary id
  const commentary = global.tblCommentaries.findIndex(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (commentary == -1) {
    throw new Error("Commentary with this id not Found");
  }
  await activeInactiveCommentaryQuery(request.body, fastify, request);

  global.tblCommentaries[commentary].isActive = request.body.isActive;

  let cData = await getMatchDataByCId(
    {
      commentaryId: request.body.commentaryId,
    },
    request,
    fastify
  );
  await callClientAPI(
    {
      moduleType: APIEndpointModuleType.commentaryUpdate,
      data: {
        ...cData,
        isActive: request.body.isActive,
        type: "activeInactive",
      },
    },
    request,
    fastify,
    "services/agent.js/activeInactiveCommentaryService"
  );
  if (
    global?.clientSocketIo !== undefined &&
    global?.clientSocketIo.length > 0
  ) {
    const socketData = {
      commentaryId: request.body.commentaryId,
      isClientShow: global.tblCommentaries[commentary].isClientShow,
      isActive: global.tblCommentaries[commentary].isActive
    };
    
    global.clientSocketIo.forEach((socket) => {
      socket.client.emit("updateActionType", socketData);
    });
  }
  commActionLogger(
    {
      commentaryId: request.body.commentaryId,
      requestBody: request.body,
      response: {
        message: "Commentary Updated successfully",
      },
      apiName: "/agent/commentary/activeInactiveCommentary",
    },
    request,
    fastify
  ).catch((err) => {
    console.log("agent isactive commActionLogger console", err);
    errorLogger(
      fastify,
      err.message,
      "ERROR --> services/agent-commentary.js/activeInactiveCommentaryService - commActionLogger",
      request
    );
  });
  return "Commentary Updated successfully";
};

const getTeamAndPlayerListServiceV1 = async (request, fastify) => {
  let commentaryDetails = await global.tblCommentaries.find(
    (item) => item?.commentaryId === request.body.commentaryId
  );
  if (!commentaryDetails) {
    throw new Error("Commentary with this id not Found");
  }

  const arrOfTeamId = [];
  let commentaryTeams = await global.tblCommentaryTeams
    .filter((item) => item?.commentaryId === request.body.commentaryId)
    .reduce((acc, curr) => {
      const teamData = {
        teamId: curr?.teamId,
        teamName: curr?.teamName,
        shortName: curr?.shortName,
        currentInnings: curr?.currentInnings,
      };
      arrOfTeamId.push(teamData);
      acc.push(teamData);
      return acc;
    }, []);

  let totalInnings = arrOfTeamId.length / 2;
  commentaryDetails.totalInnings = totalInnings;

  const systemPlayerIds = new Set(
    global.tblPlayers
      .filter((item) => item.isSystemPlayer === true)
      .map((item) => item.playerId)
  );

  let teamMap = {};

  for (const team of arrOfTeamId) {
    let commentaryTeamPlayers = await Promise.all(
      global.tblCommentaryPlayers
        .filter(
          (item) =>
            item?.commentaryId === request.body.commentaryId &&
            item.teamId === team.teamId &&
            item.currentInnings === team.currentInnings &&
            !systemPlayerIds.has(item.playerId) // Filter system players early
        )
        .map(async (curr) => {
          const playerAvg = await getPlayersBattingHistoryByIdQuery(
            {
              playerId: curr.playerId,
              matchTypeId: commentaryDetails.matchTypeId,
            },
            fastify,
            request
          );

          return {
            teamId: curr.teamId,
            playerId: curr.playerId,
            playerName: curr.playerName,
            batsmanAverage: isNaN(Number(curr.batsmanAverage))
              ? 0
              : parseFloat(Number(curr.batsmanAverage).toFixed(1)),
            batsmanStrikeRate: isNaN(Number(curr.batsmanStrikeRate))
              ? 0
              : parseFloat(Number(curr.batsmanStrikeRate).toFixed(1)),
            commentaryPlayerId: curr.commentaryPlayerId,
            isInPlayingEleven: curr.isInPlayingEleven,
            boundary:
              curr.boundary == 0 || curr.boundary == null
                ? playerAvg.length > 0
                  ? parseFloat(
                      (
                        (playerAvg[0].countOf4 + playerAvg[0].countOf6) /
                        playerAvg[0].inningsCount
                      ).toFixed(1)
                    ) || 0
                  : 0
                : curr.boundary,
            playerBallFaced:
              curr.playerBallFaced === 0 || curr.playerBallFaced == null
                ? playerAvg.length > 0
                  ? parseFloat(
                      (
                        playerAvg[0].ballsFacedCount / playerAvg[0].inningsCount
                      ).toFixed(1)
                    ) || 0
                  : 0
                : curr.playerBallFaced,
            currentInnings: curr.currentInnings,
            playerTypeId: curr.playerTypeId,
            playerType: curr.playerType,
            jerseyPlayerImage: curr.jerseyPlayerImage,
            jerseyPlayerImagePath: curr.jerseyPlayerImagePath,
            bowlingType: curr?.bowlingType,
            isPlayInEvent: curr?.isPlayInEvent,
            createdDate: curr?.createdDate,
          };
        })
    );

    if (!teamMap[team.teamId]) {
      const players = await getAllPlayersByTeamIdAndMatchTypeIdQuery(
        { matchTypeId: commentaryDetails.matchTypeId, teamId: team.teamId },
        fastify,
        request
      );

      teamMap[team.teamId] = {
        teamId: team.teamId,
        teamName: team?.teamName || null,
        shortName: team?.shortName || null,
        commentaryTeamPlayers: {},
        teamPlayers: players,
      };
    } else {
      teamMap[team.teamId].teamName =
        team.teamName || teamMap[team.teamId].teamName;
      teamMap[team.teamId].shortName =
        team.shortName || teamMap[team.teamId].shortName;
    }
    
    const inningsKey = `currentInnings${team.currentInnings}`;
     if (!teamMap[team.teamId].commentaryTeamPlayers[inningsKey]) {
      teamMap[team.teamId].commentaryTeamPlayers[inningsKey] = [];
    }
    teamMap[team.teamId].commentaryTeamPlayers[inningsKey] =
      commentaryTeamPlayers; // Replace instead of push
  }

  commentaryTeams = Object.values(teamMap);

  return {
    commentaryDetails,
    commentaryTeams,
  };
};

async function getAgentWisePermissionService(request, fastify) {
    const { WrRoleId } = request.userTokenInfo;
    const body = {
        roleId: WrRoleId,
    };
    return await getUserWisePermisionQuery(fastify, body);
}

const getInitConfigDetails = async (request, fastify) => {
    const initKeys = [configConstants.DPAPIURL, configConstants.DPAPIXKEY, configConstants.DPSOCKETURL, configConstants.SCORECARDFRAMEURL, configConstants.ENABLELOGROCKET, configConstants.LOGROCKETAPPID,
      configConstants.ISAPPLYPLAYERSTRIKELOGIC, configConstants.ISAPPLYPARTNERSHIPLOGIC, configConstants.ENTITYSPORTURL,
      configConstants.STREAMINGURL, configConstants.STREAMINGXKEY, configConstants.STREAMINGWATCHURL];
    let result = global.tblConfigs.filter(item => initKeys.includes(item.key));
    return result;
}

const changeAgentPasswordService = async (request, fastify) => {
    const { oldPassword, newPassword } = request.body;

    const findUser = global.tblUsers.find(
        (user) => user.userId === request.userTokenInfo.WrEId
    );

    if (!findUser) {
        throw new Error("Invalid User");
    }

    const decryptedPassword = decrypt(findUser.password);

    if (decryptedPassword !== oldPassword) {
        throw new Error("Old Password is incorrect");
    }

    const body = {
        userId: request.userTokenInfo.WrEId,
        password: encrypt(newPassword),
    };

    await updateUserPasswordQuery(body, fastify, request);

    const index = global.tblUsers.findIndex(
        (user) => user.userId === request.userTokenInfo.WrEId
    );

    global.tblUsers[index].password = body.password;

    return "Password changed successfully";
};

module.exports = {
    signInAgentServices,
    signOutAgentServices,
    getTabsService,
    allCommentaryService,
    allEventTypesService,
    changeShowClientService,
    activeInactiveCommentaryService,
    getTeamAndPlayerListServiceV1,
    getAgentWisePermissionService,
    getInitConfigDetails,
    changeAgentPasswordService,
} 