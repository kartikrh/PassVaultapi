const { errorLogger } = require("../utilities/logger")

const getAllSubScribesDomainQuery = async (fastify) =>{
    const data =  await fastify.db.query(
        `
        SELECT 
        tsd."wrSubScribesDomainId" as "subScribesDomainId",
        "wrSiteName" as "siteName",
        "wrSiteDomain" as "siteDomain",
        "wrIsApproved" as "isApproved",
        tsd."wrCreatedDate" as "createdDate",
        CAST(COUNT(tssd."wrSubScribesSubDomainId") as integer) as "subDomainCount",
        COALESCE(
            CASE
                WHEN COUNT(tssd."wrSubScribesSubDomainId") > 0 THEN
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'subScribesSubDomainId', tssd."wrSubScribesSubDomainId",
                            'subScribesDomainId', tssd."wrSubScribesDomainId",
                            'siteSubDomain', tssd."wrSiteSubDomain"
                        ) ORDER BY tssd."wrSubScribesSubDomainId" ASC
                    )
                ELSE
                    '[]'::JSON
            END,
            '[]'
        ) as "subDomains"
    FROM
        "tblSubScribesDomains" tsd
    LEFT JOIN
        "tblSubScribesSubDomains" tssd ON tsd."wrSubScribesDomainId" = tssd."wrSubScribesDomainId"
    WHERE tsd."wrIsDeleted" = false
    GROUP BY
        tsd."wrSubScribesDomainId";  
        `,
        {
            type: fastify.db.QueryTypes.SELECT
        }
    )
    return data;
}
const getAllSubScribesSubDomainQuery = async (fastify) =>{
    return await fastify.db.query(
        `
        SELECT 
            "wrSubScribesSubDomainId" as "subScribesSubDomainId",
            "wrSubScribesDomainId" as "subScribesDomainId",
            "wrSiteSubDomain" as "siteSubDomain"
        FROM
            "tblSubScribesSubDomains"
        WHERE "wrIsDeleted" = false
        `,
        {
            type: fastify.db.QueryTypes.SELECT
        }
    )
}
const getDomainByIdQuery = async (id,fastify) =>{
    const data =  await fastify.db.query(
        `
        SELECT 
            tsd."wrSubScribesDomainId" as "subScribesDomainId",
            "wrSiteName" as "siteName",
            "wrSiteDomain" as "siteDomain",
            "wrIsApproved" as "isApproved",
            CAST(count(tssd."wrSubScribesSubDomainId") as integer) as "subDomainCount",
            COALESCE(
                CASE
                    WHEN COUNT(tssd."wrSubScribesSubDomainId") > 0 THEN
                        JSON_AGG(
                            JSON_BUILD_OBJECT(
                                'subScribesSubDomainId', tssd."wrSubScribesSubDomainId",
                                'subScribesDomainId', tssd."wrSubScribesDomainId",
                                'siteSubDomain', tssd."wrSiteSubDomain"
                            ) ORDER BY tssd."wrSubScribesSubDomainId" ASC
                        )
                    ELSE
                        '[]'::JSON
                END,
                '[]'
            ) as "subDomains"
            
        FROM
            "tblSubScribesDomains" tsd
        LEFT JOIN
            "tblSubScribesSubDomains" tssd ON tsd."wrSubScribesDomainId" = tssd."wrSubScribesDomainId" AND tssd."wrIsDeleted" = false
        WHERE
            tsd."wrSubScribesDomainId" = $1 AND tsd."wrIsDeleted" = false
        GROUP BY
            tsd."wrSubScribesDomainId"
        `,
        {
            type: fastify.db.QueryTypes.SELECT,
            bind: [
                id
            ]
        }
    )

    return data[0];
}
const getSubDomainByDomainQuery = async (id,fastify) =>{
    return await fastify.db.query(
        `
        SELECT 
            "wrSubScribesSubDomainId" as "subScribesSubDomainId",
            "wrSubScribesDomainId" as "subScribesDomainId",
            "wrSiteSubDomain" as "siteSubDomain"
        FROM
            "tblSubScribesSubDomains"
        WHERE
            "wrSubScribesDomainId" = $1 AND "wrIsDeleted" = false
        `,
        {
            type: fastify.db.QueryTypes.SELECT,
            bind: [
                id
            ]
        }
    )
}
const insertSubScribeDomainQuery = async (request,fastify) =>{
    try {
        const createData = await fastify.db.query(
            `WITH insert_data AS (
                INSERT INTO "tblSubScribesDomains"(
                    "wrSiteName",
                    "wrSiteDomain",
                    "wrCreatedDate"
                )
                VALUES (
                    $1,
                    $2,
                    now()
                )
                RETURNING *
            )
            SELECT 
                "wrSubScribesDomainId" as "subScribesDomainId",
                "wrSiteName" as "siteName",
                "wrSiteDomain" as "siteDomain",
                "wrIsApproved" as "isApproved",
                "wrCreatedDate" as "createdDate"
            FROM insert_data
            `,
            {
                type: fastify.db.QueryTypes.SELECT,
                bind: [
                    request.body.siteName,
                    request.body.siteDomain
                ]
            }
        );

        return createData[0];

    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSubScribesDomain.js/insertSubScribeDomainQuery",
            request
          );
          throw new Error(err.message);
    }
}

const deleteSubScribeDomainQuery = async (id, fastify, request) =>{
    try {
           // delete sub domains
        await fastify.db.query(
            `
            UPDATE "tblSubScribesSubDomains" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now() 
            WHERE 
                "wrSubScribesDomainId" = $3
            `,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [
                    true,
                    request.userTokenInfo.WrUserId,
                    id
                ]
            }
        );
        // delete domain
        await fastify.db.query(
            `
            UPDATE "tblSubScribesDomains" SET
                "wrIsDeleted" = $1,
                "wrDeletedBy" = $2,
                "wrDeletedAt" = now() 
            WHERE 
                "wrSubScribesDomainId" = $3
            `,
            {
                type: fastify.db.QueryTypes.DELETE,
                bind: [
                    true,
                    request.userTokenInfo.WrUserId,
                    id
                ]
            }
        );
    return "Domain Deleted Successfully";
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSubScribesDomain.js/deleteSubScribeDomainQuery",
            request
          );
          throw new Error(err.message);
    }
}

const updateDomainStatusQuery = async (request,fastify) =>{
    try {
        await fastify.db.query(
            `
            UPDATE "tblSubScribesDomains" 
            SET 
                "wrIsApproved" = $1
            WHERE 
                "wrSubScribesDomainId" = $2
            `,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    request.body.isApproved,
                    request.body.subScribesDomainId
                ]
            }
        );
        return true;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSubScribesDomain.js/updateDomainStatusQuery",
            request
          );
          throw new Error(err.message);
    }
}
const insertSubScribeSubDomainQuery = async (body ,request,fastify) =>{
    try {
        // insert sub domain
        const values = body.subDomains.map((item) => {
            return `(${body.subScribesDomainId}, '${item}', now())`
        }).join(',');

        const data = await fastify.db.query(
            `
            INSERT INTO "tblSubScribesSubDomains"(
                "wrSubScribesDomainId",
                "wrSiteSubDomain",
                "wrCreatedDate"
            )
            VALUES 
                ${values}
            RETURNING 
                "wrSubScribesSubDomainId" as "subScribesSubDomainId",
                "wrSubScribesDomainId" as "subScribesDomainId",
                "wrSiteSubDomain" as "siteSubDomain"
            `,
            {
                type: fastify.db.QueryTypes.INSERT
            }
        );
        
        return data[0];
      
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSubScribesDomain.js/updateDomainStatusQuery",
            request
          );
          throw new Error(err.message);
    }
}

const updateActiveInactiveVideoApprovedQuery = async (request,fastify) =>{
    try {
        await fastify.db.query(
            `
            UPDATE "tblSubScribesDomains" 
            SET 
                "wrIsVideoApproved" = $1
            WHERE 
                "wrSubScribesDomainId" = $2
            `,
            {
                type: fastify.db.QueryTypes.UPDATE,
                bind: [
                    request.body.isVideoApproved,
                    request.body.subScribesDomainId
                ]
            }
        );
        return true;
    } catch (err) {
        errorLogger(
            fastify,
            err.message,
            "DB ERROR --> repository/TableSubScribesDomain.js/updateActiveInactiveVideoApprovedQuery",
            request
          );
          throw new Error(err.message);
    }
}
module.exports = {
    getAllSubScribesDomainQuery,
    getAllSubScribesSubDomainQuery,
    insertSubScribeDomainQuery,
    deleteSubScribeDomainQuery,
    updateDomainStatusQuery,
    insertSubScribeSubDomainQuery,
    getDomainByIdQuery,
    getSubDomainByDomainQuery,
    updateActiveInactiveVideoApprovedQuery
}