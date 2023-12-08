const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryWickets = sequelize.define(
    "tblCommentaryWickets",
    {
      wrCommentaryWicketId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowlerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBowlerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrWicketType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBatterId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBatterName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrFieldPlayerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrFieldPlayerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrOverId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrOverCount: {
        type: DataTypes.DECIMAL,
        allowNull: true,
      },
      wrCommentaryBallByBallId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPlayerRun: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPlayerBalls: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsDelete: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrWicketCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBallCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return CommentaryWickets;
};
