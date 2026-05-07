const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TournamentTeamPointModel = sequelize.define(
    "tblTournamentTeamPoint",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrGroupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrCompetitionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrTotalMatches: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalWin: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalLose: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalTie: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrNoResult: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalPoint: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrNetRunRate: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      wrPrevGroupId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      }
    },
    {
      timestamps: false,
    }
  );
  return TournamentTeamPointModel;
};
