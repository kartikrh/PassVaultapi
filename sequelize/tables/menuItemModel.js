const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MenuItemModel = sequelize.define(
    "tblMenuItem",
    {
      wrMenuItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrMenuTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrMenuItem: {
        type: DataTypes.STRING(2000),
        allowNull: false,
      },
      wrParentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrDisplayOrder: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrPageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrModifyBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return MenuItemModel;
};
