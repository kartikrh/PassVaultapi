const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PlayerBattingHistoryModel = sequelize.define(
    "tblPlayerBattingHistory",
    {
      wrBattingHistoryId: {
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
        type: DataTypes.STRINGS,
        allowNull: true,
      },
      wrMatchCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrInningCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrNotOut: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTotalRuns: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrHighestScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrAverage: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wrBallsFacedCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrStrikeRate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      wr100Count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wr50Count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wr4Count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wr6Count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCatchCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrStumpCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsOutInHS: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return PlayerBattingHistoryModel;
};
