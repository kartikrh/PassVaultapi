const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const MenuItemTypeModel = sequelize.define(
    "tblMenuItemType",
    {
      wrMenuItemTypeID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrMenuItemType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCreateDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrCreateBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifyDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrModifyBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return MenuItemTypeModel;
};
