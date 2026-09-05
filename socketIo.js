const jwt = require("jsonwebtoken");
const { getConfigValue } = require("./utilities/index");
const configConstants = require("./utilities/configConstants");

global.sessionData = []

const connection = (socket, fastify) => {
  const { userId, allowMultipleLogin, wrToken } = socket;
  if (userId) {
    const user = global.tblUsers.find((user) => user.userId === userId);

    // Check if token is not of latest login and multiple login is false
    if (wrToken !== user?.loginToken && !allowMultipleLogin) {
      global.socketIo
        .to(socket.id)
        .emit("logout", "You have been removed from the room.");
    } else {
      socket.join(userId);
    }
  }

  socket.on("disconnect", () => {
    // console.log("Client disconnected:", socket.id, new Date());
  });
};

const socketMiddleware = async (socket, next) => {
  let token = null;
  try {
    token = socket.handshake?.auth?.token;

    if (!token) {
      return next(new Error("Token Not Found"));
    }

    const verifyToken = jwt.verify(
      token,
      getConfigValue(configConstants.SECRET_KEY_TOKEN),
      (err, decoded) => {
        if (err) {
          return next(new Error(err.message));
        }
        return decoded;
      }
    );

    if (!verifyToken || !verifyToken.WrUserId) {
      return next(new Error("Invalid Token"));
    }

    socket.userId = verifyToken?.WrEId;
    socket.allowMultipleLogin = verifyToken?.WrAllowMultipleLogin;
    socket.wrToken = verifyToken?.wrToken

    return next();
  } catch (error) {
    return next(new Error(error.message));
  }
};

module.exports = { connection, socketMiddleware };
