const { signInUser, signOutUser, updateUserPasswordQuery } = require("../repository/TableUser");
const { v4: uuidv4 } = require("uuid");
const requestIp = require("request-ip");
const { deviceInfo, encrypt, decrypt } = require("../utilities/index");
const { generateToken } = require("../utilities/tokenization");
const { getTabsQuery, getUserWisePermisionQuery } = require("../repository/TableTabs.js");
const configConstants = require("../utilities/configConstants.js");

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

async function getAgentWisePermissionService(request, fastify) {
    const { WrRoleId } = request.userTokenInfo;
    const body = {
        roleId: WrRoleId,
    };
    return await getUserWisePermisionQuery(fastify, body);
}

const getInitConfigDetails = async (request, fastify) => {
    const initKeys = [configConstants.DPAPIURL, configConstants.DPAPIXKEY, configConstants.DPSOCKETURL, configConstants.SCORECARDFRAMEURL, configConstants.ENABLELOGROCKET, configConstants.LOGROCKETAPPID,
    configConstants.ISAPPLYPLAYERSTRIKELOGIC, configConstants.ISAPPLYPARTNERSHIPLOGIC, configConstants.ENTITYSPORTURL];
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
    getAgentWisePermissionService,
    getInitConfigDetails,
    changeAgentPasswordService,
} 