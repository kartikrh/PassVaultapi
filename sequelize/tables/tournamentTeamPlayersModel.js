const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const TournamentTeamPlayersModel = sequelize.define(
    "tblTournamentTeamPlayers",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCompetitionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrPlayerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrPlayerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrMatchTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }
    },
    {
      timestamps: false,
    }
  );
  return TournamentTeamPlayersModel;
};