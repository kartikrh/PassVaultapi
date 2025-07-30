const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const HideEvent = sequelize.define(
    "tblHideEvents",
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
      wrWhiteLabelId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrRefId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedBy: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      wrIsDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
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

  return HideEvent;
};
