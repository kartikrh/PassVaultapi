const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentaryPartnership = sequelize.define(
    "tblCommentaryPartnership",
    {
      wrCommentaryPartnershipId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      wrCommentaryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTeamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBatter1Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBatter2Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBatter1Name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrBatter2Name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrTotalRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalBalls: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrExtras: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCommentaryBallByBallId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return CommentaryPartnership;
};
