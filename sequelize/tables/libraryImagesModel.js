const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LibraryImagesModel = sequelize.define(
    "tblLibraryImages",
    {
      wrId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      wrPhotoLibraryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      wrTitle: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      wrDisplayOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      wrIsDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
  return LibraryImagesModel;
};
