const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const SubScribesSubDomainModel = sequelize.define(
    "tblSubScribesSubDomain",
    {
      //* Auto increment primary key
      wrSubScribesSubDomainId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrSubScribesDomainId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrSiteSubDomain: {
        type: DataTypes.STRING(100),
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
  return SubScribesSubDomainModel;
};
