const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryPlayerModel = sequelize.define(
    "tblCommentaryPlayer",
    {
      wrCommentaryPlayerId: {
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
      wrPlayerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPlayerName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrDisplayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_Status: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_Run: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_Ball: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_DotBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_FOUR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_SIX: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_SRR: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      wrBat_BattingOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_IsPlay: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrBat_OnStrike: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrBat_WicketType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_BowlerID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_FielderID1: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_FielderID2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_Over: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
      },
      wrBowler_CurrentBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_TotalBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_Run: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_DotBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_MaidenOver: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_FOUR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_SIX: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_WideBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_NOBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_ByeBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_LegByeBall: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      wrBowler_WideBallRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_NOBallRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_ByeBallRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_LegByeBallRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_TotalWicket: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_Economy: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      wrBowler_OnStrike: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrBowler_PeneltyRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsBatter_Out: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrIsBatter_Retir: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrSwapName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrBatsmanAverage: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      wrBatsmanStrikeRate: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      wrBowlerEconomy: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      wrBowlerAverage: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      wrCurrentInnings: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBatsmanPreviousStrikeRate: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      wrBowlerPreviousEconomy: {
        type: DataTypes.DECIMAL(9, 2),
        allowNull: true,
      },
      wrBatterOrder : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowlerOrder : {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBoundary : {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue: 0,
      },
      wrPlayerBallFaced: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      }
    },
    {
      timestamps: false,
    }
  );
  return CommentaryPlayerModel;
};
