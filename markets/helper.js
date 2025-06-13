/**
 * Fetches runners for a market from the database
 * @param {string|number} marketId - Market ID
 * @param {Object} fastify - Fastify instance
 * @returns {Promise<Array>} - Array of runners
 */
async function fetchRunnersForMarket(marketId, fastify) {
    try {
        if (!marketId || marketId === 0) {
            throw new Error("Cannot fetch runners for market without ID");
        }

        // Build the query to get runners with proper formatting
        const query = `
            SELECT 
                "wrRunnerId" as "runnerId",
                "wrRunner" as "runner",
                "wrLine" as "line",
                "wrOverRate" as "overRate",
                "wrUnderRate" as "underRate",
                "wrBackPrice" as "backPrice",
                "wrLayPrice" as "layPrice",
                "wrBackSize" as "backSize",
                "wrLaySize" as "laySize",
                "wrSelectionStatus" as "selectionStatus",
                "wrSelectionId" as "selectionId",
                "wrOrder" as "order",
                "wrLastUpdate" as "lastUpdate"
            FROM "tblMarketRunners"
            WHERE "wrEventMarketId" = ${marketId}
            ORDER BY "wrOrder"
        `;

        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT
        });

        console.log(`[DB] Fetched ${result.length} runners for market ${marketId}`);
        return result;
    } catch (error) {
        console.error(`[DB] Error fetching runners for market ${marketId}:`, error);
        return [];
    }
}

module.exports = {
    fetchRunnersForMarket
};