const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryBallByBallModel = sequelize.define(
    "tblCommentaryBallByBall",
    {
      wrCommentaryBallByBallId: {
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
      wrOverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrOverCount: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
      },
      wrCurrentOverBalls: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowler_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_StrikeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBat_NONStrikeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_IsCount: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },

      wrBall_Type: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_IsDot: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrBall_Run: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_ExtraRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_isBoundry: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrBall_FOUR: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_SIX: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_IsWicket: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrBall_WicketType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_PlayerID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_BowlerID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_FielderID1: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBall_FielderID2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrOver_isMaiden: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrNextBat_StrikeID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrNextBat_NONStrikeID: {
        type: DataTypes.INTEGER,
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

  return CommentaryBallByBallModel;
};
