const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const PhotoLibraryModel = sequelize.define(
    "tblPhotoLibrary",
    {
      wrPhotoLibraryId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrTitle: {
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
      wrIsPermanent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      wrStartDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      wrEndDate: {
        type: DataTypes.DATE,
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
      wrViewCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      }
    },
    {
      timestamps: false,
    }
  );
  return PhotoLibraryModel;
};
