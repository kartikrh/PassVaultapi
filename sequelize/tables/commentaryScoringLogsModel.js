const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const commetnaryScoringLogs = sequelize.define(
    "tblComScoringLogs",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrUserName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return commetnaryScoringLogs;
};