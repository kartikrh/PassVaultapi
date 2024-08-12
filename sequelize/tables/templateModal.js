const { DataTypes } = require("sequelize");
//create sequence "tblTemplate_wrId_seq"
module.exports = (sequelize) => {
  const TemplateModel = sequelize.define(
    "tblTemplate",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTemplateType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrType: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrTitle: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      wrDescription: {
        type: DataTypes.STRING(1000),
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
      wrIsDefault:{
        type : DataTypes.BOOLEAN,
        allowNull : false,
        defaultValue : false
      }
    },
    {
      timestamps: false,
    }
  );
  return TemplateModel;
};