const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PythonSocketLog = sequelize.define(
    "tblPythonSocketLogs",
    {
        wrId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        wrCommentaryId : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrMarketData : {
            type: DataTypes.JSON,
            allowNull: true,
        },
        wrSocketId : {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        wrCreatedAt : {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
      timestamps: false,
    }
  );

  return PythonSocketLog;
};
