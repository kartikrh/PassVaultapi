// Usefult to call market pages
const { processOddEven } = require('./oddEven');
const { updateMarketToDB, sendSocketData } = require('./utils');

const MARKET_HANDLERS = {
    'odd-even': processOddEven,
};

async function marketGenRunner({ market, data }) {
    const handler = MARKET_HANDLERS[market];
    if (!handler) return { error: `No handler for market: ${market}` };

    const result = handler(data);

    if (result.error) return result;

    const commentaryId = data?.commentary_id || data?.predictscore?.commentary_id;
    const eventId = data?.predictscore?.event_id;

    updateMarketToDB(commentaryId, market, result);
    sendSocketData(eventId, result);

    return result;
}

module.exports = { marketGenRunner };