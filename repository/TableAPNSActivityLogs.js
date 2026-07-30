const insertAPNSActivityLogsQuery = async (request, fastify) => {
    try {
        const { liveActivityTokenId, host, header, body, response } = request.body;
        const result = await fastify.db.query(
            `WITH insert_data AS (
                INSERT INTO "tblAPNSActivityLogs" (
                    "wrLiveActivityTokenId", "wrHost", "wrHeader", "wrBody", "wrResponse"
                ) 
                VALUES (
                    $1, $2, $3, $4, $5
                )
                RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrLiveActivityTokenId" as "liveActivityTokenId",
                "wrHost" as "host",
                "wrHeader" as "header",
                "wrBody" as "body",
                "wrResponse" as "response",
                "wrCreatedAt" as "createdAt"
            FROM insert_data;`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    liveActivityTokenId,
                    host,
                    header,
                    body,
                    response
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAPNSActivityLogs.js/insertAPNSActivityLogsQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    insertAPNSActivityLogsQuery
};