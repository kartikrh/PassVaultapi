const { errorLogger } = require("../utilities/logger");

const getAllOverTypesQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrOverType" as "overType",
                "wrIsActive" as "isActive",
                "wrIsDefault" as "isDefault"
            FROM "tblOverType"`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableOverType.js/getAllOverTypesQuery",
            null
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllOverTypesQuery,
};