const { errorLogger } = require("../utilities/logger");

const getAllAwardQuery = async (fastify) =>{
    return await fastify.db.query(
        `
            SELECT
                "wrId" as "id",
                "wrName" as "name",
                "wrIsShowOnSummary" as "isShowOnSummary",
                "wrDisplayOrder" as "displayOrder",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy"
            FROM "tblAwards"    
            WHERE "wrIsDeleted" = false
            order by "wrDisplayOrder" ASC    
        `,
        {
            type: fastify.db.QueryTypes.SELECT
        }

    );
}
const addAwardQuery = async (data,request, fastify) =>{
    try {
        const query = `
            INSERT INTO "tblAwards"
                ("wrName","wrIsShowOnSummary","wrDisplayOrder","wrIsActive","wrCreatedAt","wrCreatedBy")
            VALUES
                ($1,
                $2,
                (SELECT COALESCE((SELECT MAX("wrDisplayOrder") FROM "tblAwards"),0) + 1),
                $3,
                now(),
                $4)
            RETURNING 
                "wrId" as "id",
                "wrName" as "name",
                "wrIsShowOnSummary" as "isShowOnSummary",
                "wrDisplayOrder" as "displayOrder",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy"
        `;

        const result = await fastify.db.query(query,{
            type: fastify.db.QueryTypes.SELECT,
            bind: [
                data.name,
                data.isShowOnSummary || false,
                data.isActive || false,
                request.userTokenInfo.WrUserId,
            ]
        });

        return result[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableAward.js/addAwardQuery",
            request
        );
        throw new Error(error.message);
    }
}
const updateAwardQuery = async (data,request, fastify) =>{
    try {
        const query = `
            UPDATE "tblAwards"
            SET
                "wrName" = $1,
                "wrIsShowOnSummary" = $2,
                "wrIsActive" = $3
            WHERE
                "wrId" = $4
            RETURNING
                "wrId" as "id",
                "wrName" as "name",
                "wrIsShowOnSummary" as "isShowOnSummary",
                "wrDisplayOrder" as "displayOrder",
                "wrIsActive" as "isActive",
                "wrCreatedAt" as "createdAt",
                "wrCreatedBy" as "createdBy"
        `;

        const result = await fastify.db.query(query,{
            type: fastify.db.QueryTypes.SELECT,
            bind: [
                data.name,
                data.isShowOnSummary || false,
                data.isActive || false,
                data.id
            ]
        });
        return result[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableAward.js/updateAwardQuery",
            request
        );
        throw new Error(error.message); 
    }
}
const deleteAwardQuery = async (request,fastify) =>{
    try {
        let query = `
            UPDATE "tblAwards" SET
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
            WHERE "wrId" = ANY($3)
        `;
        await fastify.db.query(query,{
            type: fastify.db.QueryTypes.UPDATE,
            bind: [true, request.userTokenInfo.WrUserId, request.body.id]
        });
    }catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableAward.js/deleteAwardQuery",
            request
        );
        throw new Error(error.message);
    }
}
const updateDisplayOrder = async (body,request, fastify) => {
    try {
        return await fastify.db.query(
            // `update "tblAwards" set "wrDisplayOrder" = $1 where "wrId" = $2 `,
            `update "tblAwards" set "wrDisplayOrder" = $1 where "wrId" in ($2) `,
            {
                bind: [body.displayOrder, body.id],
            }
        );
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableAward.js/updateDisplayOrder",
            request
        );
        throw new Error(err.message);
    }
}
const activeInactiveAwardQuery = async (request, fastify) => {
    try {
        let query = `
            UPDATE "tblAwards"
            SET "wrIsActive" = $1
            WHERE "wrId" = $2
        `;
        const result = await fastify.db.query(query, {
            type: fastify.db.QueryTypes.SELECT,
            bind: [request.body.isActive, request.body.id],
        });
        return result[0];
    } catch (error) {
        errorLogger(
            fastify,
            error.message,
            "DB ERROR --> repository/TableAward.js/activeInactiveAwardQuery",
            request
        );
        throw new Error(error.message);
    }
}
module.exports = {
    getAllAwardQuery,
    addAwardQuery,
    updateAwardQuery,
    deleteAwardQuery,
    updateDisplayOrder,
    activeInactiveAwardQuery
}