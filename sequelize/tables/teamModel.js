const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const EventTypeModel = require("./eventTypeModel")(sequelize);
  const TeamModel = sequelize.define(
    "tblTeam",
    {
      wrTeamId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTeamName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrEventTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      WrTeamJersey: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrCountry: {
        type: DataTypes.STRING(200),
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
      wrTeamShortName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrTeamColor: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      wrBackgroundColor: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  TeamModel.belongsTo(EventTypeModel, {
    foreignKey: "wrEventTypeId",
    targetKey: "wrEventTypeId",
  });
  return TeamModel;
};
