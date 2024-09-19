const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const socialMediaModel = sequelize.define(
    "tblSocialMedia",
    {
        wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      wrLink: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      wrImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      wrCreatedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrModifiedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
    },
    {
      timestamps: false,
    }
  );

  return socialMediaModel;
};