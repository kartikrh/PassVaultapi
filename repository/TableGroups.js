const { errorLogger } = require("../utilities/logger");

const getAllGroupsQuery = async (fastify) => {
  return await fastify.db.query(
    `
        select
        "wrGroupId" as "groupId",
        "wrGroupName" as "groupName",
        "wrIsActive" as "isActive"
        from "tblGroups"
        where "wrIsDeleted" = false
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

const insertGroupQuery = async (data, fastify) => {
  try {
    const result = await fastify.db.query(
      `
      with insert_data as (
          insert into "tblGroups" (
              "wrGroupName",
              "wrIsActive"
          ) values (
              $1,
              $2
          ) returning *
      )
      select 
      "wrGroupId" as "groupId",
      "wrGroupName" as "groupName",
      "wrIsActive" as "isActive"
      from "insert_data"
      `,
      {
        type: fastify.db.QueryTypes.SELECT,
        bind: [data.groupName, data.isActive || false],
      }
    );

    return result[0];
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableGroups.js/insertGroupQuery",
      request
    );
    throw new Error(err.message);
  }
};

const updateGroupQuery = async (data, fastify, request) => {
  try {
    return await fastify.db.query(
      `Update "tblGroups" set "wrGroupName" = $1, "wrIsActive" = $2 where "wrGroupId" = $3`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [data.groupName, data.isActive, data.groupId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableGroups.js/updateGroupQuery",
      request
    );
    throw new Error(err.message);
  }
};

const deleteGroupsQuery = async (groupId, fastify, request) => {
  try {
    return await fastify.db.query(
      `update "tblGroups" set
              "wrIsDeleted" = $1,
              "wrDeletedBy" = $2,
              "wrDeletedAt" = now()
      where "wrGroupId" = ANY ($3)`,
      {
        type: fastify.db.QueryTypes.UPDATE,
        bind: [true, request.userTokenInfo.WrUserId, groupId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableGroups.js/deleteGroupsQuery",
      request
    );
    throw new Error(err.message);
  }
};

const activeInactiveGroupsQuery = async (data, request, fastify) => {
  try {
    return await fastify.db.query(
        `
            update "tblGroups" set
            "wrIsActive" = $1
            where "wrGroupId" = $2
        `,
      {
        bind: [data.isActive, data.groupId],
      }
    );
  } catch (err) {
    errorLogger(
      fastify,
      err.message,
      "DB ERROR --> repository/TableGroups.js/activeInactiveGroupsQuery",
      request
    );
    throw new Error(err.message);
  }
};

module.exports = {
  getAllGroupsQuery,
  insertGroupQuery,
  updateGroupQuery,
  deleteGroupsQuery,
  activeInactiveGroupsQuery
};
