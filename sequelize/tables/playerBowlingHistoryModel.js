const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PlayerBowlingHistoryModel = sequelize.define(
    "tblPlayerBowlingHistory",
    {
      wrBowlingHistoryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrMatchTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPlayerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMatchTypeName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrMatchCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrInningsCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrBallCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrWicketsCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrAverage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrBestBowlingInInnings: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrBestBowlingInMatch: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrEconomy: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrStrikeRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wr4Wickets: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wr5Wickets: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wr10Wickets: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return PlayerBowlingHistoryModel;
};
