
const getAllClientQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrClientID" as "clientId",
            "wrUserName" as "userName",
            "wrMobileNo" as "mobileNo",
            "wrEmailID" as "emailId",
            "wrCreatedDate" as "createdDate",
            "wrClientName" as "fullName",
            "wrRegistrationProcessStatus" as "registrationProcessStatus"
        from "tblClient"
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

module.exports = {
  getAllClientQuery,
};