const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PageAliasModel = sequelize.define(
    "tblPageAlias",
    {
      wrPageAliasId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrPageId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrMenuItemId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrPageName: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrPageTitle: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrAlias: {
        type: DataTypes.STRING(600),
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: true,
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
  return PageAliasModel;
};
