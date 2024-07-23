const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const OtpModel = sequelize.define(
    "tblOtp",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrOtp: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrExperiedTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return OtpModel;
};