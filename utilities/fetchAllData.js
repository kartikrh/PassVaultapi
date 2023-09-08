const { getAllActiveInactiveTabsQuery } = require("../repository/TableTabs");
const { getAllBlocksQuery } = require("../repository/TableBlock");
const { getAllMenuTypesQuery } = require("../repository/TableMenuTypes");
const { getAllMenuItemTypesQuery } = require("../repository/TableMenuItemType");
const { allPageQuery } = require("../repository/TablePage");
const { allPageFormateQuery } = require("../repository/TablePageFormate");
const { allPageAliases } = require("../repository/TablePageAlias");
const { allMenuItemsQuery } = require("../repository/TableMenuItem");
const { getAllRolesQuery } = require("../repository/TableRoles");

const fetchAllDataFromDb = async (fastify) => {
  try {
    const getAllTabs = await getAllActiveInactiveTabsQuery(fastify);
    const getAllRoles = await getAllRolesQuery(fastify);

    const getAllBlocks = await getAllBlocksQuery(fastify);
    const getAllMenuTypes = await getAllMenuTypesQuery(fastify);
    const getAllMenuItemTypes = await getAllMenuItemTypesQuery(fastify);
    const getAllPageFormats = await allPageFormateQuery(fastify);
    const getAllPages = await allPageQuery(fastify);
    const getAllPageAliases = await allPageAliases(fastify);
    const getAllMenuItems = await allMenuItemsQuery(fastify);

    global.tblTabs = getAllTabs;
    global.tblRoles = getAllRoles;
    global.tblBlocks = getAllBlocks;
    global.tblMenuTypes = getAllMenuTypes;
    global.tblMenuItemTypes = getAllMenuItemTypes;
    global.tblPageFormats = getAllPageFormats;
    global.tblPages = getAllPages;
    global.tblPageAliases = getAllPageAliases;
    global.tblMenuItems = getAllMenuItems;

    console.log("Okkkk");
  } catch (error) {
    console.log("error in fetchAllDataFromDb", error.message);
  }
};

module.exports = fetchAllDataFromDb;
