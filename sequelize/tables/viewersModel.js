const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ViewersModel = sequelize.define(
    "tblViewers",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      wrWhitelabelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrViewerCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      }
    },
    {
      timestamps: false,
    }
  );

  return ViewersModel;
};
