const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const teamPointLogModel = sequelize.define(
    "tblTeamPointLogs",
    {
        wrId : {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        wrTeamId : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrCommentaryId : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrCompetitionId : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrGroupId : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        wrCreatedAt : {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue : DataTypes.NOW
        },
        wrCreatedBy : {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
      timestamps: false,
    }
  );
  return teamPointLogModel;
};
