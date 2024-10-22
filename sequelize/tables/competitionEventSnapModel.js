const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CompetitionEventSnap = sequelize.define(
    "tblCompetitionEventSnap",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrCompetitionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventRefId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalFour: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalSix: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalWicket: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalWideBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalNoBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalLegByesRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalByesRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotal50: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotal100: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrUnder50: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: false,
    }
  );

  return CompetitionEventSnap;
};
