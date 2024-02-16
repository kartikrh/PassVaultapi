const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ResponseLogModel = sequelize.define(
    "tblResponseLogs",
    {
        wrId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        wrDomain: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        wrPath: {
            type: DataTypes.STRING(200),
            allowNull: true,
        },
        wrResponseTime: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrUserId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrUserIp: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        wrRequestBody: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        wrRequestStartTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        wrRequestEndTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
      timestamps: false,
    }
  );

  return ResponseLogModel;
};
