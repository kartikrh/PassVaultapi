const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ErrorLogModel = sequelize.define(
    "tblErrorLog",
    {
      wrErrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrErrMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrErrStack: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      wrDomain: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      wrUserId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrUserIp: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      wrApi: {
        type: DataTypes.STRING(1000),
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return ErrorLogModel;
};
