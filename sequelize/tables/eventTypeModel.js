const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventTypeModel = sequelize.define(
    "tblEventType",
    {
      wrEventTypeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrEventType: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrRefId: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING(200),
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
      wrRemark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrIsHighlight: {
        type: DataTypes.BOOLEAN,
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

  return EventTypeModel;
};
