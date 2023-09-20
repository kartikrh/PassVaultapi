const jwt = require("jsonwebtoken");

const connection = (socket) => {
  const { userId, allowMultipleLogin } = socket;

  if (userId) {
    socket.join(userId); // Join the specified room

    const clientsInRoom = global.socketIo.sockets.adapter.rooms.get(userId);

    // Check if there's more than one client in the room
    if (clientsInRoom.size > 1 && !allowMultipleLogin) {
      // Get the first client's socket ID
      const firstClientSocketId = Array.from(clientsInRoom)[0];

      // Emit a "remove" event to the first client
      global.socketIo
        .to(firstClientSocketId)
        .emit("logout", "You have been removed from the room.");

      // Remove the first client from the room
      global.socketIo.sockets.sockets.get(firstClientSocketId).leave(userId);
    }
  }

  socket.on("disconnect", () => {});
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
      process.env.SECRET_KEY_TOKEN,
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

    socket.userId = verifyToken?.WrUserId;
    socket.allowMultipleLogin = verifyToken?.WrAllowMultipleLogin;

    return next();
  } catch (error) {
    return next(new Error(error.message));
  }
};

module.exports = { connection, socketMiddleware };
