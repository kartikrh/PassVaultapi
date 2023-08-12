const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
const TabsModel = require('./tabsModel')(sequelize)

  const EncryptedTabModel = sequelize.define("tblEncryptedTab", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    wrTabId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: TabsModel,
          key: 'wrTabId',
        },
    },
    wrEncryptedTabId: {
      type: DataTypes.STRING, // Use an appropriate data type for encrypted values
      allowNull: false,
    },
  });

  EncryptedTabModel.belongsTo(TabsModel, {
    foreignKey: 'wrTabId', // Foreign key in UserLoginInfoModel
    targetKey: 'wrTabId', // Target key in UserModel
  });

  return EncryptedTabModel;
};
