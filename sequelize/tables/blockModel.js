const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BlockModel = sequelize.define(
    "tblBlock",
    {
      wrBlockId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrBlockName: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      wrIsShowContent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrContent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      wrControlId: {
        type: DataTypes.STRING(100),
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
    },
    {
      timestamps: false,
    }
  );

  return BlockModel;
};
