//! for every new route add a schema name you wish to group the api's on swagger
const Auth = {
  signUp: {
    schema: {
      tags: ["Auth"],
      description: "signup",
      body: {
        type: "object",
        properties: {
          userName: { type: "string" },
          password: { type: "string" },
          name: { type: "string" },
          userType: { type: "integer", enum: [1, 2, 3] },
          isActive: { type: "boolean" },
        },
        required: ["userName", "password", "name", "userType", "isActive"],
      },
    },
  },
  signIn: {
    schema: {
      tags: ["Auth"],
      description: "signIn",
      body: {
        type: "object",
        properties: {
          userName: { type: "string" },
          password: { type: "string" },
        },
        required: ["userName", "password"],
      },
    },
  },
  signOut: {
    schema: {
      tags: ["Auth"],
      description: "signOut",
      headers: {
        type: "object",
        properties: {
          Authorization: { type: "string" },
        },
        required: ["Authorization"],
      },
    },
  },
  verifyToken: {
    schema: {
      tags: ["Auth"],
      description: "verifyToken",
      headers: {
        type: "object",
        properties: {
          Authorization: { type: "string" },
        },
        required: ["Authorization"],
      },
    },
  },
  encryption: {
    schema: {
      tags: ["Auth"],
      description: "Generate Encryption Data",
      body: {
        type: "object",
        properties: {
          length: { type: "string" },
        },
        required: ["length"],
      },
    },
  },
  loaddata: {
    schema: {
      tags: ["Auth"],
      description: "LoadAllData",
      security: [{ bearerAuth: [] }],
    },
  },
  validateUser: {
    schema: {
      tags: ["Auth"],
      description: "Validate User",
      headers: {
        type: "object",
        properties: {
          Authorization: { type: "string" },
        },
        required: ["Authorization"],
      },
    },
  },
  updatePassword: {
    schema: {
      tags: ["Auth"],
      description: "Update Password",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          oldPassword: { type: "string" },
          newPassword: { type: "string" },
        },
        required: ["oldPassword", "newPassword"],
      },
    },
  },
  ckUpload: {
    schema: {
      tags: ["ckUpload"],
      description: "CKEditor Image Upload",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          upload: { type: "array" },
        },
        required: ["upload"],
      },
    },
  },
  imgUpload: {
    schema: {
      tags: ["imgUpload"],
      description: "Image Upload",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          module: { type: "string" },
          image: { type: "array" },
        },
        required: ["module", "image"],
      },
    },
  },
};

const Tabs = {
  //all tabs related schema
  getTabs: {
    schema: {
      tags: ["Admin"],
      description: "get tabs",
      security: [{ bearerAuth: [] }],
    },
  },
  byparentId: {
    schema: {
      tags: ["Admin"],
      description: "get by Id tabs",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          parentId: { type: "string" },
          displayType: { type: "integer", enum: [0, 1, 2] },
          isActive: { type: "boolean" },
        },
      },
    },
  },
  deleteTabs: {
    schema: {
      tags: ["Admin"],
      description: "Deactivate tabs by encrypted tab IDs",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          encryptedTabIds: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["encryptedTabIds"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Admin"],
      description: "get by Id tabs",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
      },
      required: ["id"],
    },
  },
  saveTab: {
    schema: {
      tags: ["Admin"],
      description: "Update tab by ID",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          // Define properties for updated fields
          id: { type: "string" },
          tabName: { type: "string" },
          displayName: { type: "string" },
          displayType: { type: "integer", enum: [1, 2] },
          webPage: { type: "string" },
          parentId: { type: "string" },
          isActive: { type: "boolean" },
          isAdd: { type: "boolean" },
          isEdit: { type: "boolean" },
          isDelete: { type: "boolean" },
          isView: { type: "boolean" },
          addWebpage: { type: "string" },
          isMenu: { type: "boolean" },
          iconName: { type: "string" },
        },
      },
      required: ["id"],
    },
  },
  getByDisplayType: {
    schema: {
      tags: ["Admin"],
      description: "get by Display type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          displayType: {
            type: "integer",
            enum: [1, 2], // Allowable values
          },
        },
        required: ["displayType"], // Required property
      },
    },
  },
  changeDispalyOrder: {
    schema: {
      tags: ["Admin"],
      description: "change display order",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tabId: { type: "string" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
};

const Role = {
  //all roles related schema
  getRoles: {
    schema: {
      tags: ["Role"],
      description: "get roles",
      security: [{ bearerAuth: [] }],
    },
  },
  getByDisplayType: {
    schema: {
      tags: ["Role"],
      description: "get roles by display type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          displayType: {
            type: "integer",
            enum: [1, 2], // Allowable values
          },
        },
        required: ["displayType"], // Required property
      },
    },
  },
  deleteRoles: {
    schema: {
      tags: ["Role"],
      description: "Deactivate tabs by encrypted Role IDs",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          roleIds: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["roleIds"],
      },
    },
  },
  createRole: {
    schema: {
      tags: ["Role"],
      description: "post roles",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          roleId: { type: "string" },
          roleName: { type: "string" },
          description: { type: "string" },
          displayType: { type: "integer", enum: [1, 2] },
          permissions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                tabId: { type: "string" },
                isAdd: { type: "boolean" },
                isEdit: { type: "boolean" },
                isDelete: { type: "boolean" },
                isView: { type: "boolean" },
              },
            },
            minItems: 1,
          },
        },
        required: ["roleId", "permissions"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Role"],
      description: "get role details with permissions by Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          roleId: { type: "string" },
          displayType: { type: "integer", enum: [0, 1, 2] },
        },
        required: ["roleId", "displayType"],
      },
    },
  },
  getByTab: {
    schema: {
      tags: ["Role"],
      description: "get role details with permissions by tab",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          tabName: { type: "string" },
        },
        required: ["tabName"],
      },
    },
  },
};

const Block = {
  getBlocks: {
    schema: {
      tags: ["Block"],
      description: "get blocks",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isShowContent: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Block"],
      description: "get blocks",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          blockId: { type: "string" },
        },
        required: ["blockId"],
      },
    },
  },

  saveBlock: {
    schema: {
      tags: ["Block"],
      description: "block update",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          blockId: { type: "string" },
          blockName: { type: "string" },
          isShowContent: { type: "boolean" },
          content: { type: "string" },
          containerId: { type: "string" },
        },
        required: ["blockName", "blockId", "containerId"],
      },
    },
  },
  deleteBlock: {
    schema: {
      tags: ["Block"],
      description: "block delete",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          blockId: { type: "array", items: { type: "string" }, minItems: 1 },
        },
        required: ["blockId"],
      },
    },
  },
};

const MenuType = {
  getAll: {
    schema: {
      tags: ["Menu Types"],
      description: "get MenuType",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  blockList: {
    schema: {
      tags: ["Menu Types"],
      security: [{ bearerAuth: [] }],
      description: "get all event type",
      body: {
        type: "object",
        properties: {
          isShowContent: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Menu Types"],
      description: "get Menu Type by Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuTypeId: { type: "string" },
        },
        required: ["menuTypeId"],
      },
    },
  },
  update: {
    schema: {
      tags: ["Menu Types"],
      description: "Menu Type update",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuTypeId: { type: "string" },
          blockId: { type: "string" },
          isActive: { type: "boolean" },
          menuTypeName: { type: "string" },
          noOfLevel: { type: "integer" },
        },
        required: ["menuTypeId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Menu Types"],
      description: "Menu Types delete",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuTypeId: { type: "array", items: { type: "string" }, minItems: 1 },
        },
        required: ["menuTypeId"],
      },
    },
  },
};

const MenuItemType = {
  getAll: {
    schema: {
      tags: ["Menu Item Types"],
      description: "get MenuItemType",
      security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Menu Item Types"],
      description: "get Menu Item Type by Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuItemTypeId: { type: "string" },
        },
        required: ["menuItemTypeId"],
      },
    },
  },

  save: {
    schema: {
      tags: ["Menu Item Types"],
      description: "Menu Item Type update",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuItemTypeId: { type: "string" },
          isActive: { type: "boolean" },
          menuItemType: { type: "string" },
        },
        required: ["menuItemTypeId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Menu Item Types"],
      description: "Menu Item Types delete",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuItemTypeId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["menuItemTypeId"],
      },
    },
  },
};

const MenuItem = {
  getAll: {
    schema: {
      tags: ["Menu Item"],
      description: "get MenuItem",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  changeDispalyOrder: {
    schema: {
      tags: ["Menu Item"],
      description: "change display order",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            menuItemId: { type: "string" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
  getMenuItemByMenuType: {
    schema: {
      tags: ["Menu Item"],
      description: "get MenuItem",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          menuTypeId: { type: "string" },
        },
        required: ["menuTypeId"],
      },
    },
  },
  menuTypeList: {
    schema: {
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      description: "get all menu type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  pageList: {
    schema: {
      tags: ["Menu Item"],
      security: [{ bearerAuth: [] }],
      description: "get all page",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  activeInactiveMenuItem: {
    schema: {
      tags: ["Menu Item"],
      description: "active inactive menu item",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuItemId: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["menuItemId", "isActive"],
      },
    },
  },
  menuItemList: {
    schema: {
      tags: ["Menu Item"],
      description: "get Menu Type by parent Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuTypeId: { type: "string" },
          isActive: { type: "boolean" },
          parentId: { type: "string" },
        },
        required: ["isActive", "parentId"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Menu Item"],
      description: "get Menu Item by Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuItemId: { type: "string" },
        },
        required: ["menuItemId"],
      },
    },
  },
  update: {
    schema: {
      tags: ["Menu Item"],
      description: "Menu Item update",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuItemId: { type: "string" },
          menuTypeId: { type: "string" },
          menuItem: { type: "string" },
          parentId: { type: "string" },
          isActive: { type: "boolean" },
          pageId: { type: "string" },
          pageDetails: {
            type: "object",
            properties: {
              pageTitle: { type: "string" },
              pageHeading: { type: "string" },
              pageName: { type: "string" },
              alias: { type: "string" },
              isLink: { type: "boolean" },
              linkURL: { type: "string" },
              pageFormatId: { type: "string" },
              isOpenInNewTab: { type: "boolean" },
              pageContent: { type: "string" },
              seoWord: { type: "string" },
              seoDescription: { type: "string" },
              isDefault: { type: "boolean" },
              dynamicParameters: { type: "string" },
            },
          },
          // menuItemTypeId: { type: "string" },
        },
        required: [
          "menuItemId",
          "menuTypeId",
          "menuItem",
          "parentId",
          "pageId",
        ],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Menu Item"],
      description: "Menu Item delete",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          menuItemId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["menuItemId"],
      },
    },
  },
};

const PageFormate = {
  getAll: {
    schema: {
      tags: ["Page Formate"],
      description: "get all Page Formate",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Page Formate"],
      description: "get Page Formate by Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageFormatId: { type: "string" },
        },
        required: ["pageFormatId"],
      },
    },
  },
  create: {
    schema: {
      tags: ["Page Formate"],
      description: "Create Page Formate",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageFormatName: { type: "string" },
          pageName: { type: "string" },
          description: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["pageFormatName"],
      },
    },
  },
  update: {
    schema: {
      tags: ["Page Formate"],
      description: "Update Page Formate",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageFormatId: { type: "string" },
          pageFormatName: { type: "string" },
          pageName: { type: "string" },
          description: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["pageFormatId", "pageFormatName"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Page Formate"],
      description: "delete page formate",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageFormatId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["pageFormatId"],
      },
    },
  },
};
const Page = {
  getAll: {
    schema: {
      tags: ["Page"],
      description: "get all Page",
      security: [{ bearerAuth: [] }],
    },
  },
  pageFormateList: {
    schema: {
      tags: ["Page"],
      security: [{ bearerAuth: [] }],
      description: "get all Page Formate",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Page"],
      description: "get Page by Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageId: { type: "string" },
        },
        required: ["pageId"],
      },
    },
  },
  create: {
    schema: {
      tags: ["Page"],
      description: "Create Page",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageTitle: { type: "string" },
          pageHeading: { type: "string" },
          pageName: { type: "string" },
          alias: { type: "string" },
          isLink: { type: "boolean" },
          linkURL: { type: "string" },
          pageFormatId: { type: "string" },
          isOpenInNewTab: { type: "boolean" },
          pageContent: { type: "string" },
          seoWord: { type: "string" },
          seoDescription: { type: "string" },
          isDefault: { type: "boolean" },
          dynamicParameters: { type: "string" },
        },
        required: ["pageTitle", "pageHeading", "pageName"],
      },
    },
  },
  update: {
    schema: {
      tags: ["Page"],
      description: "Update Page",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageId: { type: "string" },
          pageTitle: { type: "string" },
          pageHeading: { type: "string" },
          pageName: { type: "string" },
          alias: { type: "string" },
          isLink: { type: "boolean" },
          linkURL: { type: "string" },
          pageFormatId: { type: "string" },
          isOpenInNewTab: { type: "boolean" },
          pageContent: { type: "string" },
          seoWord: { type: "string" },
          seoDescription: { type: "string" },
          isDefault: { type: "boolean" },
          dynamicParameters: { type: "string" },
          isStatic: { type: "boolean" },
          whiteLabelId: { type: "string" },
        },
        required: ["pageId", "pageName", "pageTitle", "alias"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Page"],
      description: "delete page",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["pageId"],
      },
    },
  },
};

const PageAlias = {
  getAll: {
    schema: {
      tags: ["Page Alias"],
      description: "get all Page Alias",
      security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Page Alias"],
      description: "get Page Alias by Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageAliasId: { type: "string" },
        },
        required: ["pageAliasId"],
      },
    },
  },
  create: {
    schema: {
      tags: ["Page Alias"],
      description: "Create Page Alias",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageId: { type: "string" },
          menuItemId: { type: "string" },
          pageName: { type: "string" },
          pageTitle: { type: "string" },
          alias: { type: "string" },
        },
        required: [],
      },
    },
  },
  update: {
    schema: {
      tags: ["Page Alias"],
      description: "Update Page Alias",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageAliasId: { type: "string" },
          pageId: { type: "string" },
          menuItemId: { type: "string" },
          pageName: { type: "string" },
          pageTitle: { type: "string" },
          alias: { type: "string" },
        },
        required: ["pageAliasId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Page Alias"],
      description: "delete page alias",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          pageAliasId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["pageAliasId"],
      },
    },
  },
};

const EventType = {
  getAll: {
    schema: {
      tags: ["Event Type"],
      security: [{ bearerAuth: [] }],
      description: "get all event type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Event Type"],
      security: [{ bearerAuth: [] }],
      description: "get event type by id",
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "integer" },
        },
        required: ["eventTypeId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Event Type"],
      security: [{ bearerAuth: [] }],
      description: "save event type",
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "integer" },
          eventType: { type: "string" },
          refId: { type: "string" },
          isActive: { type: "boolean" },
          remark: { type: "string" },
          isHighlight: { type: "boolean" },
        },
        required: ["eventTypeId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Event Type"],
      security: [{ bearerAuth: [] }],
      description: "delete event type",
      body: {
        type: "object",
        properties: {
          eventTypeId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["eventTypeId"],
      },
    },
  },
  changeDispalyOrder: {
    schema: {
      tags: ["Event Type"],
      description: "change display order",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            eventTypeId: { type: "integer" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
};
const Teams = {
  getAll: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "get all teams",
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "integer" },
        },
      },
    },
  },
  eventTypeList: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "get all event type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  playerList: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "get all Player",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          eventTypeId: { type: "integer" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "get teams by id",
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" },
        },
        required: ["teamId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "save teams",
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" },
          teamName: { type: "string" },
          teamShortName: { type: "string" },
          country: { type: "string" },
          eventTypeId: { type: "integer" },
          playerId: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["teamId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "delete teams",
      body: {
        type: "object",
        properties: {
          teamId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["teamId"],
      },
    },
  },
};

const PaneltyRuns = {
  getAll: {
    schema: {
      tags: ["Penalty Runs"],
      security: [{ bearerAuth: [] }],
      description: "get all Penalty Runs",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Penalty Runs"],
      security: [{ bearerAuth: [] }],
      description: "get Penalty Runs by id",
      body: {
        type: "object",
        properties: {
          paneltyId: { type: "integer" },
        },
        required: ["paneltyId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Penalty Runs"],
      security: [{ bearerAuth: [] }],
      description: "save Penalty Runs",
      body: {
        type: "object",
        properties: {
          paneltyId: { type: "integer" },
          run: { type: "integer" },
          desc: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["paneltyId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Penalty Runs"],
      security: [{ bearerAuth: [] }],
      description: "delete Penalty Runs",
      body: {
        type: "object",
        properties: {
          paneltyId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["paneltyId"],
      },
    },
  },
};

const Player = {
  getAll: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "get all Player",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          eventTypeId: { type: "integer" },
          teamId: { type: "integer" },
        },
      },
    },
  },
  updateSystemPlayer:{
    schema: {
      tags: ["Player"],
      description: "Update System Player",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
          isSystemPlayer: { type: "boolean" },
        },
        required: ["playerId", "isSystemPlayer"],
      },
    }
  },
  eventTypeList: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "get all event type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  teamList: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "get all teams",
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "integer" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "get Player by id",
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
        },
        required: ["playerId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "save Player",
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
          eventTypeId: { type: "integer" },
          country: { type: "string" },
          playerTypeId: { type: "integer" },
          playerName: { type: "string" },
          bowlingTypeId: { type: "integer" },
          isActive: { type: "boolean" },
          isKipper: { type: "boolean" },
          isLeftHandedBatting: { type: "boolean" },
          isLeftArmFielding: { type: "boolean" },
          batsmanAverage: { type: "number" },
          batsmanStrikeRate: { type: "number" },
          bowlerAverage: { type: "number" },
          bowlerEconomy: { type: "number" },
          displayName: { type: "string" },
          teamId: {
            type: "array",
            items: { type: "string" },
          },
          isSystemPlayer: { type: "boolean" },
        },
        required: ["playerId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "delete Player",
      body: {
        type: "object",
        properties: {
          playerId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["playerId"],
      },
    },
  },
  updatePlayerStats: {
    schema: {
      tags: ["Player"],
      description: "Update Player Stats",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            playerId: { type: "integer" },
            playerName: { type: "string" },
            batsmanAverage: { type: "number" },
            batsmanStrikeRate: { type: "number" },
            bowlerEconomy: { type: "number" },
            bowlerAverage: { type: "number" },
            isUpdate: { type: "number" },
          },
        },
        minItems: 1,
      },
    },
  },
};

const MatchType = {
  getAll: {
    schema: {
      tags: ["Match Type"],
      security: [{ bearerAuth: [] }],
      description: "get all Match Type",
    },
  },
  getById: {
    schema: {
      tags: ["Match Type"],
      security: [{ bearerAuth: [] }],
      description: "get Match Type by id",
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
        },
        required: ["matchTypeId"],
      },
    },
  },
  clone: {
    schema: {
      tags: ["Match Type"],
      security: [{ bearerAuth: [] }],
      description: "get Match Type by id",
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
          matchType: { type: "string" },
        },
        required: ["matchTypeId", "matchType"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Match Type"],
      security: [{ bearerAuth: [] }],
      description: "save Match Type",
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
          matchType: { type: "string" },
          matchRefType: { type: "string" },
          noOfIningsPerSide: { type: "integer" },
          noOfDays: { type: "integer" },
          noOfPlayer: { type: "integer" },
          substitutesPlayer: { type: "integer" },
          isLastManStand: { type: "boolean" },
          isLimitedOvers: { type: "boolean" },
          takeNewBallAfterOvers: { type: "integer" },
          oversInLastHour: { type: "integer" },
          totalOversInMatch: { type: "integer" },
          oversPerDay: { type: "integer" },
          maxOversInFirstInings: { type: "integer" },
          maxOversInSecondInings: { type: "integer" },
          isBowlersLimitedOvers: { type: "boolean" },
          oversPerBowler: { type: "integer" },
          isPowerPlay: { type: "boolean" },
          totalPowerPlay: { type: "integer" },
          isExtraInings: { type: "boolean" },
          oversPerInings: { type: "integer" },
          batsmenPerInings: { type: "integer" },
          ballsPerOver: { type: "integer" },
          valueOfNoBall: { type: "integer" },
          isExtraBallWhenNoBall: { type: "boolean" },
          valueOfNoBallInLastOver: { type: "integer" },
          isExtraBallWhenNoBallInLastOver: { type: "boolean" },
          valueOfWideBall: { type: "integer" },
          isExtraBallWhenWideBall: { type: "boolean" },
          valueOfWideBallInLastOver: { type: "integer" },
          isExtraBallWhenWideBallInLastOver: { type: "boolean" },
          isWideBallCountInPartnership: { type: "boolean" },
          isPenaltyRunsInPartnership: { type: "boolean" },
          valueOfFrontFootNoBall: { type: "integer" },
        },
        required: ["matchTypeId"],
      },
    },
  },
  delete: {
    schema: {
      security: [{ bearerAuth: [] }],
      tags: ["Match Type"],
      description: "delete Match Type",
      body: {
        type: "object",
        properties: {
          matchTypeId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["matchTypeId"],
      },
    },
  },
};

const User = {
  getAll: {
    schema: {
      tags: ["User"],
      description: "get all User",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  roleList: {
    schema: {
      tags: ["User"],
      description: "get roles",
      security: [{ bearerAuth: [] }],
    },
  },
  getAllWithCurrent: {
    schema: {
      tags: ["User"],
      description: "get all User including current user",
      security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["User"],
      description: "get User by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          userId: { type: "string" },
        },
        required: ["userId"],
      },
    },
  },
  decryptPassword: {
    schema: {
      tags: ["User"],
      description: "decryptPassword child user's password",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          userId: { type: "string" },
        },
        required: ["userId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["User"],
      description: "save User",
      security: [{ bearerAuth: [] }],

      body: {
        type: "object",
        properties: {
          userId: { type: "string" },
          parentId: { type: "string" },
          roleId: { type: "string" },
          userName: { type: "string" },
          password: { type: "string" },
          name: { type: "string" },
          mobile: { type: "string" },
          isActive: { type: "boolean" },
          userType: { type: "integer" },
          allowMultipleLogin: { type: "boolean" },
        },
        required: ["userId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["User"],
      description: "delete User",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          userId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["userId"],
      },
    },
  },
  changePassword: {
    schema: {
      tags: ["User"],
      description: "get User by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          oldPassword: { type: "string" },
          newPassword: { type: "string" },
        },
        required: ["oldPassword", "newPassword"],
      },
    },
  },
};

const Config = {
  getAll: {
    schema: {
      tags: ["Config"],
      description: "get all Config",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Config"],
      description: "get Config by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          configId: { type: "string" },
        },
        required: ["configId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Config"],
      description: "save Config",
      security: [{ bearerAuth: [] }],

      body: {
        type: "object",
        properties: {
          configId: { type: "string" },
          key: { type: "string" },
          value: { type: "string" },
          desc: { type: "string" },
          isActive: { type: "boolean" },
          isForAdmin: { type: "boolean" },
        },
        required: ["configId", "key", "value"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Config"],
      description: "delete Config",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          configId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["configId"],
      },
    },
  },
};

const Commentary = {
  getAll: {
    schema: {
      tags: ["Commentary"],
      description: "get all Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryStatus: { type: "integer" },
          eventTypeId: { type: "integer" },
          competitionId: { type: "integer" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
  },
  activeInactiveCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "active inactive Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["commentaryId", "isActive"],
      },
    },
  },
  closeCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "close Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["commentaryId"],
      },
    },
  },
  changeMatchType: {
    schema: {
      tags: ["Commentary"],
      description: "change match type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          matchTypeId: { type: "integer" },
        },
        required: ["commentaryId", "matchTypeId"],
      },
    },
  },
  changeDelay: {
    schema: {
      tags: ["Commentary"],
      description: "change delay",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          delay: { type: "integer" },
        },
        required: ["commentaryId", "delay"],
      },
    },
  },
  changePredictMarket: {
    schema: {
      tags: ["Commentary"],
      description: "change PredictMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isPredictMarket: { type: "boolean" },
        },
        required: ["commentaryId", "isPredictMarket"],
      },
    },
  },
  matchTypeList: {
    schema: {
      tags: ["Commentary"],
      security: [{ bearerAuth: [] }],
      description: "get all Match Type",
    },
  },
  getMatchTypeListByCommentary: {
    schema: {
      tags: ["Commentary"],
      security: [{ bearerAuth: [] }],
      description: "get all Match Type",
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
        },
        required: ["commentaryId"],
      },
    },
  },
  teamList: {
    schema: {
      tags: ["Commentary"],
      security: [{ bearerAuth: [] }],
      description: "get all teams",
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "integer" },
        },
      },
    },
  },
  eventTypeList: {
    schema: {
      tags: ["Commentary"],
      security: [{ bearerAuth: [] }],
      description: "get all event type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  competitionListByEventTypeId: {
    schema: {
      tags: ["Commentary"],
      description: "get Compitition by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "integer" },
        },
        required: ["eventTypeId"],
      },
    },
  },
  eventListByCompetitionId: {
    schema: {
      tags: ["Commentary"],
      description: "get Event by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
        },
        required: ["competitionId"],
      },
    },
  },
  eventDataById: {
    schema: {
      tags: ["Commentary"],
      description: "get Event by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "integer" },
        },
        required: ["eventId"],
      },
    },
  },
  playerListByTeamId: {
    schema: {
      tags: ["Commentary"],
      security: [{ bearerAuth: [] }],
      description: "get teams by id",
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" },
        },
        required: ["teamId"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Commentary"],
      description: "get Commentary by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
        },
        required: ["commentaryId"],
      },
    },
  },
  getDetailsByCId: {
    schema: {
      tags: ["Commentary"],
      description: "get Commentary by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
        },
        required: ["commentaryId"],
      },
    },
  },
  getByeventId: {
    schema: {
      tags: ["Commentary"],
      description: "get Commentary by evrentid",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "integer" },
        },
        required: ["eventId"],
      },
    },
  },

  getBycommentaryId: {
    schema: {
      tags: ["Commentary"],
      description: "get Commentary by evrentid",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "string" },
        },
        required: ["commentaryId"],
      },
    },
  },

  getBycommentaryEId: {
    schema: {
      tags: ["Commentary"],
      description: "get Commentary by evrentid",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
  getAllUpdatedIds: {
    schema: {
      tags: ["Commentary"],
      description: "get all CommentaryIDS",
      // security: [{ bearerAuth: [] }],
    },
  },
  addTeamPlayers: {
    schema: {
      tags: ["Commentary"],
      description: "add team players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          teamId: { type: "integer" },
          playerId: { type: "integer" },
        },
        required: ["commentaryId", "teamId", "playerId"],
      },
    },
  },
  loadTeamPlayer: {
    schema: {
      tags: ["Commentary"],
      description: "load team players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" },
        },
        required: ["teamId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Commentary"],
      description: "save Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          eventTypeId: { type: "integer" },
          matchTypeId: { type: "integer" },
          competitionId: { type: "integer" },
          eventId: { type: "integer" },
          eventDate: { type: "string" },
          eventName: { type: "string" },
          eventRefId: { type: "string" },
          team1Id: { type: "integer" },
          team2Id: { type: "integer" },
          location: { type: "string" },
          weather: { type: "integer" },
          pitch: { type: "integer" },
          // homeSideTeam: { type: "string" },
          // tossWonBy: { type: "string" },
          // choseTo: { type: "integer" },
          // winnerId: { type: "string" },
          // winnerName: { type: "string" },
          // isClientShow: { type: "boolean" },
          // displayStatus: { type: "string" },
          // commentaryStatus: { type: "integer" },
          // rmk: { type: "string" },
          // commentaryUserId: { type: "integer" },
          // updateTime: { type: "string" },
          // isMatchDraw: { type: "boolean" },
          target: { type: "integer" },
          marketId: { type: "integer" },
          tpId: { type: "integer" },
          isSignalROn: { type: "boolean" },
          isMatchTypeUpdated: { type: "boolean" },
          team1Captain: { type: "integer" },
          team1Kipper: { type: "integer" },
          team2Captain: { type: "integer" },
          team2Kipper: { type: "integer" },
          team1Players: {
            type: "array",
            items: { type: "integer" },
          },
          team2Players: {
            type: "array",
            items: { type: "integer" },
          },
          currentInnings: { type: "integer" },
          addSystemPlayer: { type: "boolean" },
          systemPlayerCount: { type: "integer" },
          isPredictMarket: { type: "boolean" },
        },
        required: ["commentaryId"],
      },
    },
  },
  updateCommentaryStatus: {
    schema: {
      tags: ["Commentary"],
      description: "update Commentary status",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          displayStatus: { type: "string" },
        },
        required: ["commentaryId"],
      },
    },
  },
  saveShortCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "save Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryDetails: { type: "object" },
        },
        required: ["commentaryDetails"],
      },
    },
  },
  clone: {
    schema: {
      tags: ["Commentary"],
      security: [{ bearerAuth: [] }],
      description: "Clone Commentary by id",
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          eventName: { type: "string" },
          eventRefId: { type: "string" },
        },
        required: ["commentaryId", "eventName", "eventRefId"],
      },
    },
  },
  loadMultiCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "Load Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["commentaryId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Commentary"],
      description: "delete Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["commentaryId"],
      },
    },
  },
  deleteOvers: {
    schema: {
      tags: ["Commentary"],
      description: "delete specific over based on overId ",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryOverId: { type: "integer" },
        },
        required: ["commentaryOverId"],
      },
    },
  },
  deleteBallByBall: {
    schema: {
      tags: ["Commentary"],
      description: "delete Commentary ball by ball",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryBallByBallId: { type: "integer" },
        },
        required: ["commentaryBallByBallId"],
      },
    },
  },
  saveDetails: {
    schema: {
      tags: ["Commentary"],
      description: "save Commentary details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          commentaryDetails: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryPlayers: { type: "array", items: { type: "object" } },
          // commentaryOvers: { type: "array", items: { type: "object" } },
          commentaryOvers: { type: "object" },
        },
        required: ["commentaryId"],
      },
    },
  },
  saveCommentaryDetails: {
    schema: {
      tags: ["Commentary"],
      description: "save Commentary details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryDetails: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryOvers: { type: "array", items: { type: "object" } },
          commentaryBallByBall: { type: "array", items: { type: "object" } },
          commentaryWickets: { type: "array", items: { type: "object" } },
          commentaryPartnership: { type: "array", items: { type: "object" } },
        },
        required: [],
      },
    },
  },
  changeBowler: {
    schema: {
      tags: ["Commentary"],
      description: "change bowler",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          bowlerId: { type: "integer" },
          currentInnings: { type: "integer" },
          overId: { type: "integer" },
        },
        required: ["commentaryId", "bowlerId", "currentInnings", "overId"],
      },
    },
  },
  updateShowClient: {
    schema: {
      tags: ["Commentary"],
      description: "update ShowClient",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isClientShow: { type: "boolean" },
        },
        required: ["commentaryId", "isClientShow"],
      },
    },
  },
  updatePlayersShow: {
    schema: {
      tags: ["Commentary"],
      description: "update ShowClient",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isPlayersShow: { type: "boolean" },
        },
        required: ["commentaryId", "isPlayersShow"],
      },
    },
  },
};

const Compitition = {
  getAll: {
    schema: {
      tags: ["Compitition"],
      description: "get all Compitition",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          eventTypeId: { type: "integer" },
        },
      },
    },
  },
  eventTypeList: {
    schema: {
      tags: ["Compitition"],
      security: [{ bearerAuth: [] }],
      description: "get all event type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Compitition"],
      description: "get Compitition by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
        },
        required: ["competitionId"],
      },
    },
  },
  getByeventTypeId: {
    schema: {
      tags: ["Compitition"],
      description: "get Compitition by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "integer" },
        },
        required: ["eventTypeId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Compitition"],
      description: "save Compitition",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          competition: { type: "string" },
          eventTypeId: { type: "integer" },
          refId: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["competitionId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Compitition"],
      description: "delete Compitition",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["competitionId"],
      },
    },
  },
  changeDispalyOrder: {
    schema: {
      tags: ["Compitition"],
      description: "change display order",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            competitionId: { type: "integer" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
};

const Event = {
  getAll: {
    schema: {
      tags: ["Event"],
      description: "get all Event",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          eventTypeId: { type: "integer" },
          competitionId: { type: "integer" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
  },
  eventTypeList: {
    schema: {
      tags: ["Event"],
      security: [{ bearerAuth: [] }],
      description: "get all event type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  competitionList: {
    schema: {
      tags: ["Event"],
      description: "get all Compitition",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          eventTypeId: { type: "integer" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Event"],
      description: "get Event by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "integer" },
        },
        required: ["eventId"],
      },
    },
  },
  getBycompetitionId: {
    schema: {
      tags: ["Event"],
      description: "get Event by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
        },
        required: ["competitionId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Event"],
      description: "save Event",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "integer" },
          eventTypeId: { type: "integer" },
          competitionId: { type: "integer" },
          eventDate: { type: "string" },
          eventName: { type: "string" },
          refId: { type: "string" },
          isActive: { type: "boolean" },
          countryCode: { type: "string" },
          timeZone: { type: "string" },
          venue: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Event"],
      description: "delete Event",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["eventId"],
      },
    },
  },
};

const ImportMarket = {
  setMarket: {
    schema: {
      tags: ["ImportMarket"],
      security: [{ bearerAuth: [] }],
      description: "Set Market",
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "string" },
          eventTypeName: { type: "string" },
          competitionId: { type: "string" },
          competitionName: { type: "string" },
          eventId: { type: "string" },
          eventName: { type: "string" },
          countryCode: { type: "string" },
          timeZone: { type: "string" },
          venue: { type: "string" },
          openDate: { type: "string" },
        },
      },
    },
  },
  getMarket: {
    schema: {
      tags: ["ImportMarket"],
      description: "Get Markets",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          refID: { type: "string" },
          isAustralian: { type: "string" },
          isEvent: { type: "boolean" },
          isCompitition: { type: "boolean" },
        },
      },
    },
  },
};

const MarketTemplate = {
  getAll: {
    schema: {
      tags: ["Market Template"],
      security: [{ bearerAuth: [] }],
      description: "get all market template",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          matchTypeId: { type: "integer" },
        },
      },
    },
  },
  markeTypeList: {
    schema: {
      tags: ["EventMarket"],
      description: "get all market type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getCategoryByMarketType: {
    schema: {
      tags: ["EventMarket"],
      description: "get all category by market type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTypeId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["marketTypeId"],
      },
    },
  },
  getByMatchTypeId: {
    schema: {
      tags: ["EventMarket"],
      description: "get all EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
        },
        required: ["matchTypeId"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Market Template"],
      security: [{ bearerAuth: [] }],
      description: "get market template by id",
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
        },
        required: ["marketTemplateId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Market Template"],
      security: [{ bearerAuth: [] }],
      description: "save market template",
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
          templateName: { type: "string" },
          matchTypeID: { type: "integer" },
          isPredefineMarket: { type: "boolean" },
          isPreMatchOnly: { type: "boolean" },
          isPreMatchMarket: { type: "boolean" },
          isOver: { type: "boolean" },
          over: { type: "string" },
          isPlayer: { type: "boolean" },
          playerName: { type: "string" },
          isAutoCancel: { type: "boolean" },
          createType: { type: "integer" },
          create: { type: "number" },
          autoOpenType: { type: "integer" },
          autoOpen: { type: "number" },
          autoCloseType: { type: "integer" },
          beforeAutoClose: { type: "number" },
          autoSuspendType: { type: "integer" },
          beforeAutoSuspend: { type: "number" },
          isBallStart: { type: "boolean" },
          isAutoResultSet: { type: "boolean" },
          autoResultType: { type: "integer" },
          autoResultafterBall: { type: "number" },
          afterWicketAutoSuspend: { type: "integer" },
          afterWicketNotCreated: { type: "integer" },
          isActive: { type: "boolean" },
          marketTypeId: { type: "integer" },
          marketTypeCategoryId: { type: "integer" },
          margin: { type: "number" },
          createRefId: { type: "string" },
          openRefId: { type: "string" },
          templateType: { type: "integer" },
        },
        required: [
          "marketTemplateId",
          "matchTypeID",
          "playerName",
          "marketTypeId",
          "marketTypeCategoryId",
          "margin",
        ],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Market Template"],
      description: "delete market template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["marketTemplateId"],
      },
    },
  },
  activeInactiveTemplate: {
    schema: {
      tags: ["Market Template"],
      description: "delete market template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["marketTemplateId"],
      },
    },
  },
  changePredefineRunner: {
    schema: {
      tags: ["Market Template"],
      description: "change predefine runner",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
          isPredefineRunnerValue: { type: "boolean" },
        },
        required: ["marketTemplateId", "isPredefineRunnerValue"],
      },
    },
  },
};
const Score = {
  getAllUpdatedIds: {
    schema: {
      tags: ["Score"],
      description: "get all CommentaryIDS",
      // security: [{ bearerAuth: [] }],
    },
  },
  getscoreByCId: {
    schema: {
      tags: ["Score"],
      description: "get Commentary by eventId",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "string" },
        },
        required: ["commentaryId"],
      },
    },
  },
  getscoreByEId: {
    schema: {
      tags: ["Score"],
      description: "get Commentary by evrentid",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
  getsquadList: {
    schema: {
      tags: ["Score"],
      description: "get Players List by evrentid",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },

  getPartnershipList: {
    schema: {
      tags: ["Score"],
      description: "getPartnershipList",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
  getCIds: {
    schema: {
      tags: ["Score"],
      description: "get all CommentaryIDS",
      // security: [{ bearerAuth: [] }],
    },
  },
  getmenuitemlist: {
    schema: {
      tags: ["Menu Types"],
      description: "get MenuType",
      security: [{ bearerAuth: [] }],
    },
  },
  getEventDetails: {
    schema: {
      tags: ["Score"],
      description: "getEventbyEventID",
      security: [{ bearerAuth: [] }],
      querystring: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
};
const News = {
  getAll: {
    schema: {
      tags: ["News"],
      description: "get all News",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["News"],
      description: "get News by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          newsId: { type: "integer" },
        },
        required: ["newsId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["News"],
      description: "save News",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          newsId: { type: "integer" },
          title: { type: "string" },
          news: { type: "string" },
          isPermanent: { type: "boolean" },
          isActive: { type: "boolean" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["newsId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["News"],
      description: "delete News",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          newsId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["newsId"],
      },
    },
  },
  activeInactiveNews: {
    schema: {
      tags: ["News"],
      description: "active inactive news",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          newsId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["newsId", "isActive"],
      },
    },
  },
};
const SubScribesDomain = {
  getAll: {
    schema: {
      tags: ["SubScribesDomain"],
      description: "get all SubScribesDomain",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isApproved: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["SubScribesDomain"],
      description: "get SubScribesDomain by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          subScribesDomainId: { type: "integer" },
        },
        required: ["subScribesDomainId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["SubScribesDomain"],
      description: "save SubScribesDomain",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          siteName: { type: "string" },
          siteDomain: { type: "string" },
          isApproved: { type: "boolean" },
          subDomains: { type: "array", items: { type: "string" } },
        },
        required: ["siteDomain"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["SubScribesDomain"],
      description: "delete SubScribesDomain",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          subScribesDomainId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["subScribesDomainId"],
      },
    },
  },
  domainApprove: {
    schema: {
      tags: ["SubScribesDomain"],
      description: "active inactive SubScribesDomain",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          subScribesDomainId: { type: "integer" },
          isApproved: { type: "boolean" },
        },
        required: ["subScribesDomainId", "isApproved"],
      },
    },
  },
};
const MatchTypePredictor = {
  getAll: {
    schema: {
      tags: ["MatchTypePredictor"],
      description: "get all MatchTypePredictor",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {},
      },
    },
  },
  getById: {
    schema: {
      tags: ["MatchTypePredictor"],
      description: "get MatchTypePredictor by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          matchTypePredictorId: { type: "integer" },
        },
        required: ["matchTypePredictorId"],
      },
    },
  },
  getByMatchTypeId: {
    schema: {
      tags: ["MatchTypePredictor"],
      description: "get MatchTypePredictor by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
        },
        required: ["matchTypeId"],
      },
    },
  },
  deleteByMatchTypeId: {
    schema: {
      tags: ["MatchTypePredictor"],
      description: "get MatchTypePredictor by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
        },
        required: ["matchTypeId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["MatchTypePredictor"],
      description: "save MatchTypePredictor",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
          predictorData: {
            type: "array",
            items: {
              type: "object",
              properties: {
                over: { type: "integer" },
                ball: { type: "number" },
                runPerBall: { type: "number" },
                order: { type: "integer" },
              },
            },
          },
        },
        required: ["matchTypeId", "predictorData"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["MatchTypePredictor"],
      description: "delete MatchTypePredictor",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          matchTypePredictorId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["matchTypePredictorId"],
      },
    },
  },
};
const EventMarket = {
  getDetailsByCId: {
    schema: {
      tags: ["EventMarket"],
      description: "get all EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
        },
        required: ["commentaryId"],
      },
    },
  },
  getDSReport: {
    schema: {
      tags: ["EventMarket"],
      description: "get DS Report",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
        },
        required: ["eventMarketId"],
      },
    },
  },
  byId: {
    tags: ["EventMarket"],
    description: "get market by id",
    security: [{ bearerAuth: [] }],
    body: {
      type: "object",
      properties: {
        eventMarketId: { type: "integer" },
      },
      required: ["eventMarketId"],
    },
  },
  updateMarketRate: {
    schema: {
      tags: ["EventMarket"],
      description: "update market rate",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarket: {
            type: "array",
            items: {
              type: "object",
              properties: {
                marketRunners: {
                  type: "array",
                  items: {
                    type: "object",
                  },
                },
              },
              required: ["marketRunners"],
            },
          },
        },
        required: ["eventMarket"],
      },
    },
  },
  suspendMarketByCId: {
    schema: {
      tags: ["EventMarket"],
      description: "suspend market",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: {
            type: "array",
            items: { type: "integer" },
          },
        },
        required: ["commentaryId"],
      },
    },
  },
  commentaryTypeList: {
    schema: {
      tags: ["EventMarket"],
      description: "get all commentary type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  marketTemplateTypeList: {
    schema: {
      tags: ["EventMarket"],
      description: "get market template by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
        },
      },
    },
  },
  setdelay: {
    schema: {
      tags: ["EventMarket"],
      description: "set delay EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
          delay: { type: "integer" },
        },
        required: ["eventMarketId", "delay"],
      },
    },
  },
  save: {
    schema: {
      tags: ["EventMarket"],
      description: "save market",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          eventMarketId: { type: "integer" },
          commentaryId: { type: "integer" },
          eventRefId: { type: "string" },
          teamId: { type: "integer" },
          inningsId: { type: "integer" },
          marketName: { type: "string" },
          margin: { type: "number" },
          status: { type: "integer" },
          isPredefineMarket: { type: "boolean" },
          isPreMatchOnly: { type: "boolean" },
          isOver: { type: "boolean" },
          over: { type: "number" },
          isPlayer: { type: "boolean" },
          playerName: { type: "string" },
          isAutoCancel: { type: "boolean" },
          autoOpenType: { type: "integer" },
          autoOpen: { type: "number" },
          autoCloseType: { type: "integer" },
          beforeAutoClose: { type: "number" },
          autoSuspendType: { type: "integer" },
          beforeAutoSuspend: { type: "number" },
          isBallStart: { type: "boolean" },
          isAutoResultSet: { type: "boolean" },
          autoResultType: { type: "integer" },
          autoResultafterBall: { type: "number" },
          afterWicketAutoSuspend: { type: "integer" },
          afterWicketNotCreated: { type: "integer" },
          isActive: { type: "boolean" },
          isAllow: { type: "boolean" },
          data: { type: "string" },
          isSendData: { type: "boolean" },
          actionType: { type: "integer" },
          marketTemplateId: { type: "integer" },
          marketTypeId: { type: "integer" },
          marketTypeCategoryId: { type: "integer" },
          createRefId: { type: "string" },
          openRefId: { type: "string" },
          createType: { type: "integer" },
          create: { type: "number" },
          templateType: { type: "integer" },
        },
        required: ["eventMarketId", "marketTypeId", "marketTypeCategoryId"],
      },
    },
  },
  changeResultOfMarket: {
    schema: {
      tags: ["EventMarket"],
      description: "change result of market",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          isResult: { type: "boolean" },
        },
        required: ["eventMarketId", "isResult"],
      },
    },
  },
  changeMarketCancel: {
    schema: {
      tags: ["EventMarket"],
      description: "change market to cancel",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          commentaryId: { type: "integer" },
          password: { type: "string" },
        },
        required: ["eventMarketId", "commentaryId", "password"],
      },
    },
  },
  changeMarketResult: {
    schema: {
      tags: ["EventMarket"],
      description: "change market to result",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          commentaryId: { type: "integer" },
          result: { type: "string" },
        },
        required: ["eventMarketId", "commentaryId", "result"],
      },
    },
  },
  getAll: {
    schema: {
      tags: ["EventMarket"],
      description: "get all EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          eventTypeId: { type: "integer" },
          competitionId: { type: "integer" },
          eventId: { type: "integer" },
          status: { type: "integer" },
        },
      },
    },
  },
  marketListByCId: {
    schema: {
      tags: ["EventMarket"],
      description: "get all EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
        },
        required: ["commentaryId"],
      },
    },
  },
  createEventMarket: {
    schema: {
      tags: ["EventMarket"],
      description: "create EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarket: {
            type: "array",
            items: {
              type: "object",
              properties: {
                eventMarketId: { type: "integer" },
                commentaryId: { type: "integer" },
                eventRefId: { type: "string" },
                teamId: { type: "integer" },
                inningsId: { type: "integer" },
                marketName: { type: "string" },
                margin: { type: "number" },
                status: { type: "integer" },
                isPredefineMarket: { type: "boolean" },
                isPreMatchOnly: { type: "boolean" },
                isOver: { type: "boolean" },
                over: { type: "number" },
                isPlayer: { type: "boolean" },
                playerName: { type: "string" },
                isAutoCancel: { type: "boolean" },
                autoOpenType: { type: "integer" },
                autoOpen: { type: "number" },
                autoCloseType: { type: "integer" },
                beforeAutoClose: { type: "number" },
                autoSuspendType: { type: "integer" },
                beforeAutoSuspend: { type: "number" },
                isBallStart: { type: "boolean" },
                isAutoResultSet: { type: "boolean" },
                autoResultType: { type: "integer" },
                autoResultafterBall: { type: "number" },
                afterWicketAutoSuspend: { type: "integer" },
                afterWicketNotCreated: { type: "integer" },
                isActive: { type: "boolean" },
                isAllow: { type: "boolean" },
                data: { type: "string" },
                isSendData: { type: "boolean" },
                marketTemplateId: { type: "integer" },
                marketTypeId: { type: "integer" },
                marketTypeCategoryId: { type: "integer" },
                createRefId: { type: "string" },
                openRefId: { type: "string" },
                createType: { type: "integer" },
                create: { type: "number" },
                templateType: { type: "integer" },
              },
              required: ["marketTypeId", "marketTypeCategoryId"],
            },
          },
        },
      },
    },
  },
  delete: {
    schema: {
      tags: ["EventMarket"],
      description: "delete EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["eventMarketId"],
      },
    },
  },
  activeInactiveMarket: {
    schema: {
      tags: ["EventMarket"],
      description: "active inactive EventMarket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["eventMarketId", "isActive"],
      },
    },
  },
  updateAllowMarket: {
    schema: {
      tags: ["EventMarket"],
      description: "update allow market",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          isAllow: { type: "boolean" },
        },
        required: ["eventMarketId", "isAllow"],
      },
    },
  },
  changeMarketClose: {
    schema: {
      tags: ["EventMarket"],
      description: "change market to close",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          commentaryId: { type: "integer" },
        },
        required: ["eventMarketId", "commentaryId"],
      },
    },
  },
};
const MarketTemplateRunner = {
  getAll: {
    schema: {
      tags: ["Market Template Runner"],
      description: "get all Market Template Runner",
      security: [{ bearerAuth: [] }],
    },
  },
  getByTemplateId: {
    schema: {
      tags: ["Market Template Runner"],
      description: "get all Market Template Runner",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
        },
        required: ["marketTemplateId"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Market Template Runner"],
      description: "get Market Template Runner by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateRunnerId: { type: "integer" },
        },
        required: ["marketTemplateRunnerId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Market Template Runner"],
      description: "save Market Template Runner",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateRunnerId: { type: "integer" },
          marketTemplateId: { type: "integer" },
          runner: { type: "string" },
          line: { type: "number" },
          overRate: { type: "number" },
          underRate: { type: "number" },
          yesRate: { type: "number" },
          noRate: { type: "number" },
          yesPoint: { type: "number" },
          noPoint: { type: "number" },
        },
        required: ["marketTemplateId", "marketTemplateRunnerId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Market Template Runner"],
      description: "delete Market Template Runner",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateRunnerId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["marketTemplateRunnerId"],
      },
    },
  },
};
const Vendor = {
  getAll: {
    schema: {
      tags: ["Vendors"],
      description: "get all Vendors",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["Vendors"],
      description: "get Vendors by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorId: { type: "integer" },
        },
        required: ["vendorId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Vendors"],
      description: "save Vendors",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorId: { type: "integer" },
          name: { type: "string" },
          expiryDate: {
            type: "string",
          },
          isActive: { type: "boolean" },
          isIPCheck: { type: "boolean" },
        },
        required: ["vendorId", "name"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Vendors"],
      description: "delete Vendors",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["vendorId"],
      },
    },
  },
  activeInactive: {
    schema: {
      tags: ["Vendors"],
      description: "active inactive Vendors",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["vendorId", "isActive"],
      },
    },
  },
  isIPCheck: {
    schema: {
      tags: ["Vendors"],
      description: "get all Vendors",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorId: { type: "integer" },
          isIPCheck: { type: "boolean" },
        },
        required: ["vendorId", "isIPCheck"],
      },
    },
  },
};
const VendorIp = {
  getAll: {
    schema: {
      tags: ["Vendor IP"],
      description: "get all Vendor IP",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getByVendorId: {
    schema: {
      tags: ["Vendor IP"],
      description: "get all Vendor IP",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorId: { type: "integer" },
        },
        required: ["vendorId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Vendor IP"],
      description: "save Vendor IP",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorIpId: { type: "integer" },
          vendorId: { type: "integer" },
          ipAddress: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["vendorIpId", "vendorId", "ipAddress"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Vendor IP"],
      description: "delete Vendor IP",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorIpId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["vendorIpId"],
      },
    },
  },
  activeInactive: {
    schema: {
      tags: ["Vendor IP"],
      description: "active inactive Vendor IP",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorIpId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["vendorIpId", "isActive"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Vendor IP"],
      description: "get Vendor IP by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          vendorIpId: { type: "integer" },
        },
        required: ["vendorIpId"],
      },
    },
  },
};

const DisplayStatus = {
  getAll: {
    schema: {
      tags: ["DisplayStatus"],
      security: [{ bearerAuth: [] }],
      description: "get all DisplayStatus",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  getById: {
    schema: {
      tags: ["DisplayStatus"],
      security: [{ bearerAuth: [] }],
      description: "get DisplayStatus by id",
      body: {
        type: "object",
        properties: {
          displayStatusId: { type: "integer" },
        },
        required: ["displayStatusId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["DisplayStatus"],
      security: [{ bearerAuth: [] }],
      description: "save DisplayStatus",
      body: {
        type: "object",
        properties: {
          displayStatusId: { type: "integer" },
          displayStatus: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["displayStatusId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["DisplayStatus"],
      security: [{ bearerAuth: [] }],
      description: "delete DisplayStatus",
      body: {
        type: "object",
        properties: {
          displayStatusId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["displayStatusId"],
      },
    },
  },
};
module.exports = {
  Auth,
  Tabs,
  Role,
  Block,
  MenuType,
  MenuItem,
  MenuItemType,
  PageFormate,
  Page,
  PageAlias,
  EventType,
  Teams,
  PaneltyRuns,
  Player,
  MatchType,
  User,
  Config,
  Commentary,
  Compitition,
  Event,
  ImportMarket,
  MarketTemplate,
  Score,
  SubScribesDomain,
  News,
  MatchTypePredictor,
  EventMarket,
  MarketTemplateRunner,
  Vendor,
  VendorIp,
  DisplayStatus,
};
