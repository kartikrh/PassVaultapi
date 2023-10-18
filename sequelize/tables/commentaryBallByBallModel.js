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
        allowNull: false,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrOverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrOverCount: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
      },
      wrCurrentOverBalls: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBowler_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBat_StrikeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBat_NONStrikeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_IsCount: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },

      wrBall_Type: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_IsDot: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrBall_Run: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_ExtraRun: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_isBoundry: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrBall_FOUR: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_SIX: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_IsWicket: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrBall_WicketType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_PlayerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_BowlerID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_FielderID1: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrBall_FielderID2: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrOver_isMaiden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrNextBat_StrikeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrNextBat_NONStrikeID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrIsDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      timestamps: false,
    }
  );

  return CommentaryBallByBallModel;
};
