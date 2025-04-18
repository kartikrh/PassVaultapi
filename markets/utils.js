function updateMarketToDB(commentaryId, marketName, marketValue) {
    console.log(`[DB] Update for ${marketName}:`, marketValue, `(commentary_id: ${commentaryId})`);
    // TODO: Replace with actual DB logic
}

function sendSocketData(eventId, payload) {
    console.log(`[SOCKET] Sending to event ${eventId}:`, payload);
    // TODO: Replace with actual socket.emit() logic
}

module.exports = { updateMarketToDB, sendSocketData };
