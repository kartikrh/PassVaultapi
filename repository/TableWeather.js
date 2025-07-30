const { errorLogger } = require("../utilities/logger");

const getAllWeathersQuery = async (fastify) => {
    try {
        return await fastify.db.query(
            `SELECT 
                "wrId" as "id",
                "wrWeather" as "weatherCondition",
                "wrDescription" as "description",
                "wrCommentaryId" as "commentaryId",
                "wrTemp" as "temp",
                "wrHumidity" as "humidity",
                "wrVisibility" as "visibility",
                "wrWindSpeed" as "windSpeed",
                "wrClouds" as "clouds"
            FROM "tblWeather"
            WHERE "wrIsDeleted" = FALSE;`,
            { type: fastify.db.QueryTypes.SELECT }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWeather.js/getAllWeathersQuery",
            null
        );
        throw new Error(err.message);
    }
};
const insertWeatherQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH insert_data AS (
            INSERT INTO "tblWeather" (
            "wrWeather", "wrDescription", "wrCommentaryId", "wrTemp", "wrHumidity", "wrVisibility",
            "wrWindSpeed", "wrClouds"
            ) 
            VALUES (
                $1, $2, $3,  $4, $5 ,$6, $7, $8
            )
            RETURNING *
            )
            SELECT 
                "wrId" as "id",
                "wrWeather" as "weatherCondition",
                "wrDescription" as "description",
                "wrCommentaryId" as "commentaryId",
                "wrTemp" as "temp",
                "wrHumidity" as "humidity",
                "wrVisibility" as "visibility",
                "wrWindSpeed" as "windSpeed",
                "wrClouds" as "clouds"
            FROM insert_data`,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    data.weatherCondition || null,
                    data.description || null,
                    data.commentaryId || null,
                    data.temp || null,
                    data.humidity || null,
                    data.visibility || null,
                    data.windSpeed || null,
                    data.clouds || null,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWeather.js/insertWeatherQuery",
            request
        );
        throw new Error(err.message);
    }
};


const updateWeatherQuery = async (data, fastify, request) => {
    try {
        const result = await fastify.db.query(
            `WITH updated_data AS (
            UPDATE "tblWeather" SET 
                "wrWeather" = $1,
                "wrDescription" = $2,
                "wrTemp" = $3,
                "wrHumidity" = $4,
                "wrVisibility" = $5,
                "wrWindSpeed" = $6,
                "wrClouds" = $7
            WHERE "wrId" = $8 AND "wrCommentaryId" = $9
            RETURNING *
        )
            SELECT 
                "wrId" as "id",
                "wrWeather" as "weatherCondition",
                "wrDescription" as "description",
                "wrCommentaryId" as "commentaryId",
                "wrTemp" as "temp",
                "wrHumidity" as "humidity",
                "wrVisibility" as "visibility",
                "wrWindSpeed" as "windSpeed",
                "wrClouds" as "clouds"
            FROM updated_data;`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    data.weatherCondition,
                    data.description,
                    data.temp,
                    data.humidity,
                    data.visibility,
                    data.windSpeed,
                    data.clouds,
                    data.id,
                    data.commentaryId,
                ],
            }
        );
        return result[0];
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWeather.js/updateWeatherQuery",
            request
        );
        throw new Error(err.message);
    }
};


const deleteWeatherWithCommentaryIdQuery = async (commentayId, fastify, request) => {
    try {
        return await fastify.db.query(
            `UPDATE "tblWeather" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now()
            WHERE "wrCommentaryId" = ANY($3)`,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [true, request.userTokenInfo.WrUserId, commentayId],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableWeather.js/deleteWeatherWithCommentaryIdQuery",
            request
        );
        throw new Error(err.message);
    }
};

module.exports = {
    getAllWeathersQuery,
    insertWeatherQuery,
    updateWeatherQuery,
    deleteWeatherWithCommentaryIdQuery,
};