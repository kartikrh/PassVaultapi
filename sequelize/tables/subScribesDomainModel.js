const { DataTypes } = require("sequelize");
module.exports = (sequelize) => {
  const SubScribesDomainModel = sequelize.define(
    "tblSubScribesDomain",
    {
      //* Auto increment primary key
      wrSubScribesDomainId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrSiteName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      wrSiteDomain: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      wrIsApproved: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
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
  return SubScribesDomainModel;
};
