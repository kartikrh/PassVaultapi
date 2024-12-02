const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PhotoLibraryModel = sequelize.define(
    "tblVideoLibrary",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrIsPermanent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      wrFrom: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrTo: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrTag: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrSEO: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      wrDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      wrVideoURL: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      wrType: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrCommentaryId: {
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
  return PhotoLibraryModel;
};
