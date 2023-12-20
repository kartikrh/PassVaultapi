const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const overModel = sequelize.define(
    "tblOver",
    {
      wrOverId: {
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
      wrOver: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBallCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowlerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalRun: {
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
      wrTotalWideBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalWideRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalNoball: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalNoBallRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalByesRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalLegByesRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalPanelty: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalWicket: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrDotBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsComplete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrPowerplay: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsOverInPowerplay: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrPowerplayType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsMaiden: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrIsDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCurrentInnings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return overModel;
};
