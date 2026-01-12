/**
 * Utility function to send data to client sockets with buffering when disconnected
 * This file is separate to avoid circular dependencies
 * @param {string} eventName - The event name to emit
 * @param {Object} data - The data to send
 */
const sendToClientSockets = (eventName, data) => {
  try {
    if (!global?.clientSocketIo || global.clientSocketIo.length === 0) {
      // No client sockets configured, buffer for all known URLs
      if (Array.isArray(global.knownClientSocketUrls) && global.knownClientSocketUrls.length > 0) {
        for (const url of global.knownClientSocketUrls) {
          global.clientMissedMessages[url] = global.clientMissedMessages[url] || [];
          global.clientMissedMessages[url].push({ eventName, data });
        }
        console.log(`No client sockets connected, buffered message for ${global.knownClientSocketUrls.length} known URLs`);
      }
      return;
    }

    // Track which URLs are currently connected
    const currentlyConnectedUrls = new Set();
    
    // Send to connected sockets and track which ones are connected
    global.clientSocketIo.forEach((socket) => {
      if (socket.client && socket.client.connected) {
        try {
          socket.client.emit(eventName, data);
          currentlyConnectedUrls.add(socket.url);
        } catch (err) {
          console.error(`Error sending to client socket ${socket.url}:`, err);
        }
      }
    });

    // Buffer for all known URLs that are NOT currently connected
    if (Array.isArray(global.knownClientSocketUrls)) {
      for (const url of global.knownClientSocketUrls) {
        if (!currentlyConnectedUrls.has(url)) {
          global.clientMissedMessages[url] = global.clientMissedMessages[url] || [];
          global.clientMissedMessages[url].push({ eventName, data });
        }
      }
    }
  } catch (error) {
    console.error("Error in sendToClientSockets:", error);
  }
};

module.exports = { sendToClientSockets };

