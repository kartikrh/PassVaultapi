const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const DismissalMarLogs = sequelize.define(
    "tblDismissalMarLogs",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrEventMarketId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCommentaryPlayerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrOverTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrWicketNo: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrData: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue : Date.now()
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return DismissalMarLogs;
};
