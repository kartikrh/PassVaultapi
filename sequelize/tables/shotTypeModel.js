const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const ShotTypeModel = sequelize.define(
    "tblShotType",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrDisplayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      wrDeletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrDeletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );
  return ShotTypeModel;
};
