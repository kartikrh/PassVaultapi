const { errorLogger } = require("../utilities/logger");

const errorStack = "DB ERROR --> repository/TableTeamMatchType.js/";

const getTeamMatchTypeByTeamQuery = async (request, fastify, whereCondition = null) => {
    try {
        const result = await fastify.db.query(
            `
            SELECT
                ttmt."wrTeamMatchTypeId" AS "teamMatchTypeId",
                ttmt."wrTeamId" AS "teamId",
                tt."wrTeamName" AS "teamName",
                ttmt."wrTeamJerseyImage" AS "teamJerseyImage",
                ttmt."wrTeamJerseyImagePath" AS "teamJerseyImagePath",
                ttmt."wrMatchTypeId" AS "matchTypeId",
                tmt."wrMatchType" AS "matchType",
                ttmt."wrIsActive" AS "isActive"
            FROM "tblTeamMatchType" ttmt
            LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = ttmt."wrTeamId"
            LEFT JOIN "tblMatchTypes" tmt ON tmt."wrMatchTypeId" = ttmt."wrMatchTypeId"
            WHERE ttmt."wrIsDeleted" = $1 ${whereCondition ? 'AND ' + whereCondition : ''};
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    false
                ]
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "getTeamMatchTypeByTeamQuery",
            request
        );
        throw new Error(error.message);
    }
}

const insertTeamMatchTypeByTeamQuery = async (request, fastify) => {
    try {
        const { teamId, teamJerseyImage, teamJerseyImagePath, matchTypeId, isActive } = request.body;
        const result = await fastify.db.query(
            `
            WITH insert_data AS (
                INSERT INTO "tblTeamMatchType"
                    ("wrTeamId", "wrTeamJerseyImage", "wrTeamJerseyImagePath", "wrMatchTypeId", "wrIsActive", "wrCreatedBy", "wrIsDeleted")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING "wrTeamMatchTypeId", "wrTeamId", "wrTeamJerseyImage", "wrTeamJerseyImagePath", "wrMatchTypeId", "wrIsActive"
            )
            SELECT
                ttmt."wrTeamMatchTypeId" AS "teamMatchTypeId",
                ttmt."wrTeamId" AS "teamId",
                tt."wrTeamName" AS "teamName",
                ttmt."wrTeamJerseyImage" AS "teamJerseyImage",
                ttmt."wrTeamJerseyImagePath" AS "teamJerseyImagePath",
                ttmt."wrMatchTypeId" AS "matchTypeId",
                tmt."wrMatchType" AS "matchType",
                ttmt."wrIsActive" AS "isActive"
            FROM "insert_data" ttmt
            LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = ttmt."wrTeamId"
            LEFT JOIN "tblMatchTypes" tmt ON tmt."wrMatchTypeId" = ttmt."wrMatchTypeId";
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    teamId,
                    teamJerseyImage,
                    teamJerseyImagePath,
                    matchTypeId,
                    isActive ?? true,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    false
                ]
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "insertTeamMatchTypeByTeamQuery",
            request
        );
        throw new Error(error.message);
    }
}

const updateTeamMatchTypeJerseyImageByTeamQuery = async (request, fastify) => {
    try {
        const { teamMatchTypeId, teamJerseyImage, teamJerseyImagePath } = request.body;
        const result = await fastify.db.query(
            `
            WITH update_data AS (
                UPDATE "tblTeamMatchType" SET
                    "wrTeamJerseyImage" = $1,
                    "wrTeamJerseyImagePath" = $2,
                    "wrUpdatedBy" = $3,
                    "wrUpdatedAt" = $4

                WHERE "wrTeamMatchTypeId" = $5
                RETURNING "wrTeamMatchTypeId", "wrTeamId", "wrTeamJerseyImage", "wrTeamJerseyImagePath", "wrMatchTypeId", "wrIsActive"
            )
            SELECT
                ttmt."wrTeamMatchTypeId" AS "teamMatchTypeId",
                ttmt."wrTeamId" AS "teamId",
                tt."wrTeamName" AS "teamName",
                ttmt."wrTeamJerseyImage" AS "teamJerseyImage",
                ttmt."wrTeamJerseyImagePath" AS "teamJerseyImagePath",
                ttmt."wrMatchTypeId" AS "matchTypeId",
                tmt."wrMatchType" AS "matchType",
                ttmt."wrIsActive" AS "isActive"
            FROM update_data ttmt
            LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = ttmt."wrTeamId"
            LEFT JOIN "tblMatchTypes" tmt ON tmt."wrMatchTypeId" = ttmt."wrMatchTypeId";
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    teamJerseyImage,
                    teamJerseyImagePath,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    teamMatchTypeId
                ]
            }
        );
        return result;
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            errorStack + "updateTeamMatchTypeJerseyImageByTeamQuery",
            request
        );
        throw new Error(error.message);
    }
}

const updateTeamMatchTypeByTeamQuery = async (request, fastify) => {
    try {
        const { teamMatchTypeId, teamJerseyImage, teamJerseyImagePath, isActive } = request.body;

        const fields = [], values = [];
        let index = 1;

        const data = [
            { field: 'wrTeamJerseyImage', value: teamJerseyImage },
            { field: 'wrTeamJerseyImagePath', value: teamJerseyImagePath },
            { field: 'wrIsActive', value: isActive, condition: 'isActive' in request.body }
        ];

        data.forEach((item) => {
            if (item.value || item.condition) {
                fields.push(`"${item.field}" = $${index++}`);
                values.push(item.value);
            }
        });

        if (fields.length === 0) {
            throw new Error(`No fields to update in Team MatchType for team id ${teamMatchTypeId}`);
        }

        const result = await fastify.db.query(
            `
                WITH update_data AS (
                    UPDATE "tblTeamMatchType" SET
                        ${fields.join(", ")},
                        "wrUpdatedBy" = $${index++},
                        "wrUpdatedAt" = $${index++}
                    WHERE "wrTeamMatchTypeId" = $${index++}
                    RETURNING "wrTeamMatchTypeId", "wrTeamId", "wrTeamJerseyImage", "wrTeamJerseyImagePath", "wrMatchTypeId", "wrIsActive"
                )
                SELECT
                    ttmt."wrTeamMatchTypeId" AS "teamMatchTypeId",
                    ttmt."wrTeamId" AS "teamId",
                    tt."wrTeamName" AS "teamName",
                    ttmt."wrTeamJerseyImage" AS "teamJerseyImage",
                    ttmt."wrTeamJerseyImagePath" AS "teamJerseyImagePath",
                    ttmt."wrMatchTypeId" AS "matchTypeId",
                    tmt."wrMatchType" AS "matchType",
                    ttmt."wrIsActive" AS "isActive"
                FROM update_data ttmt
                LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = ttmt."wrTeamId"
                LEFT JOIN "tblMatchTypes" tmt ON tmt."wrMatchTypeId" = ttmt."wrMatchTypeId";
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    ...values,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    teamMatchTypeId
                ]
            }
        );

        return result?.[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            error.stack + "updateTeamMatchTypeByTeamQuery",
            request
        );
        throw new Error(error.message);
    }
};

const activeInactiveTeamMatchTypeByTeamQuery = async (request, fastify) => {
    try {
        const { teamMatchTypeId, isActive } = request.body;

        const query = `
            WITH update_data AS (
                UPDATE "tblTeamMatchType" SET
                    "wrIsActive" = $1,
                    "wrUpdatedBy" = $2,
                    "wrUpdatedAt" = $3
                WHERE "wrTeamMatchTypeId" = $4
                RETURNING *
            )
            SELECT
                ttmt."wrTeamMatchTypeId" AS "teamMatchTypeId",
                ttmt."wrTeamId" AS "teamId",
                tt."wrTeamName" AS "teamName",
                ttmt."wrTeamJerseyImage" AS "teamJerseyImage",
                ttmt."wrTeamJerseyImagePath" AS "teamJerseyImagePath",
                ttmt."wrMatchTypeId" AS "matchTypeId",
                tmt."wrMatchType" AS "matchType",
                ttmt."wrIsActive" AS "isActive"
            FROM update_data ttmt
            LEFT JOIN "tblTeams" tt ON tt."wrTeamId" = ttmt."wrTeamId"
            LEFT JOIN "tblMatchTypes" tmt ON tmt."wrMatchTypeId" = ttmt."wrMatchTypeId";
        `;

        const result = await fastify.db.query(
            query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    isActive,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    teamMatchTypeId
                ]
            }
        );

        return result?.[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            error.stack + "activeInactiveTeamMatchTypeByTeamQuery",
            request
        );
        throw new Error(error.message);
    }
};

const deleteTeamMatchTypeByTeamQuery = async (request, fastify) => {
    try {
        const { teamMatchTypeId } = request.body;

        const query = `
            UPDATE "tblTeamMatchType" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = $3
            WHERE "wrTeamMatchTypeId" = $4;
        `;

        const result = await fastify.db.query(
            query,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    true,
                    request?.userTokenInfo?.WrUserId ?? -5,
                    new Date(),
                    teamMatchTypeId
                ]
            }
        );

        return result?.[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            error.stack + "deleteTeamMatchTypeByTeamQuery",
            request
        );
        throw new Error(error.message);
    }
};

module.exports = {
    getTeamMatchTypeByTeamQuery,
    insertTeamMatchTypeByTeamQuery,
    updateTeamMatchTypeJerseyImageByTeamQuery,
    updateTeamMatchTypeByTeamQuery,
    activeInactiveTeamMatchTypeByTeamQuery,
    deleteTeamMatchTypeByTeamQuery
}