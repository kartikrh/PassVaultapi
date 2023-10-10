const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventModel = sequelize.define(
    "tblEvent",
    {
      wrEventId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrEventTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrCompetitionId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrEventDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrRefID: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrIsActive: {
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
      wrCountryCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      wrTimeZone: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      wrVenue: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return EventModel;
};
