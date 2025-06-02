const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CardTypeModel = sequelize.define(
    "tblCardType",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrEnum: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrImage: {
        type: DataTypes.STRING(6000),
        allowNull: false,
      },
      wrIsDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrIsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      wrDeletedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrDeletedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCreatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      wrCreatedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrModifiedDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrModifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: false,
    }
  );

  return CardTypeModel;
};
