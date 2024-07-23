
const getAllOtpQuery = async (fastify) => {
  return await fastify.db.query(
    `select 
            "wrId" as "otpId",
            "wrUserId" as "userId",
            "wrOtp" as "otp",
            "wrCreatedDate" as "createdDate",
            "wrExperiedTime" as "expiredTime"
        from "tblOtp"
        `,
    {
      type: fastify.db.QueryTypes.SELECT,
    }
  );
};

module.exports = {
  getAllOtpQuery,
};