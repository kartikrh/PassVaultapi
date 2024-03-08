const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryTeamModel = sequelize.define(
    "tblCommentaryTeam",
    {
      wrCommentaryTeamId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrShortName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrTeamName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrTeamCaptain: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamKipper: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamOver: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      wrTeamWicket: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCrr: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      wrRrr: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      wrTeamStatus: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsWin: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCurrentInnings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsBattingComplete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCommentaryPlayerTeamCaptain: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCommentaryPlayerTeamKipper: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamTrialRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrTeamLeadRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrTeamWideRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrTeamByRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrTeamLegByRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrTeamNoBallRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrTeamPenaltyRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      wrTeamBattingOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return CommentaryTeamModel;
};
