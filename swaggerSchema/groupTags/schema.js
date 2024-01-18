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
          isShowContent: { type: "boolean" }
        }
      },
    }
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
          pageId: { type: "string" },
          isActive: { type: "boolean" },
          menuItemTypeId: { type: "string" },
        },
        required: ["menuItemId"],
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
      body :{
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      }
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
          image: { type: "string" },
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
          image: { type: "string" },
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
          isStatic : {type : "boolean"},
          whiteLabelId : {type : "string"}
        },
        required: ["pageId"],
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
          eventTypeId: { type: "string" },
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
          eventTypeId: { type: "string" },
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
            items: { type: "string" },
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
            eventTypeId: { type: "string" },
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
          eventTypeId: { type: "string" },
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
          teamId: { type: "string" },
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
          teamId: { type: "string" },
          teamName: { type: "string" },
          teamShortName: { type: "string" },
          country: { type: "string" },
          eventTypeId: { type: "string" },
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
            items: { type: "string" },
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
          paneltyId: { type: "string" },
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
          paneltyId: { type: "string" },
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
            items: { type: "string" },
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
          eventTypeId: { type: "string" },
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
          playerId: { type: "string" },
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
          playerId: { type: "string" },
          eventTypeId: { type: "string" },
          country: { type: "string" },
          playerTypeId: { type: "string" },
          playerName: { type: "string" },
          bowlingTypeId: { type: "string" },
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
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["playerId"],
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
          matchTypeId: { type: "string" },
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
          matchTypeId: { type: "string" },
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
          matchTypeId: { type: "string" },
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
            items: { type: "string" },
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
      body :{
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      }
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
          id: { type: "string" },
        },
        required: ["id"],
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
          id: { type: "string" },
          key: { type: "string" },
          value: { type: "string" },
          desc: { type: "string" },
          isActive: { type: "boolean" },
          isForAdmin: { type: "boolean" },      
        },
        required: ["id"],
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
          id: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["id"],
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
          commentaryId: { type: "string" },
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

  getAllUpdatedIds: {
    schema: {
      tags: ["Commentary"],
      description: "get all CommentaryIDS",
      // security: [{ bearerAuth: [] }],
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
          commentaryId: { type: "string" },
          eventTypeId: { type: "string" },
          matchTypeId: { type: "string" },
          competitionId: { type: "string" },
          eventId: { type: "string" },
          eventDate: { type: "string" },
          eventName: { type: "string" },
          eventRefId: { type: "string" },
          team1Id: { type: "string" },
          team2Id: { type: "string" },
          location: { type: "string" },
          weather: { type: "integer" },
          pitch: { type: "integer" },
          // homeSideTeam: { type: "string" },
          // tossWonBy: { type: "string" },
          // choseTo: { type: "integer" },
          // winnerId: { type: "string" },
          // winnerName: { type: "string" },
          // isViewTable: { type: "boolean" },
          displayStatus: { type: "string" },
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
          team1Captain: { type: "string" },
          team1Kipper: { type: "string" },
          team2Captain: { type: "string" },
          team2Kipper: { type: "string" },
          team1Players: {
            type: "array",
            items: { type: "string" },
          },
          team2Players: {
            type: "array",
            items: { type: "string" },
          },
          currentInnings: { type: "integer" },
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
            items: { type: "string" },
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
          commentaryOverId: { type: "string" },
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
          commentaryBallByBallId: { type: "string" },
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
          commentaryDetails: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryPlayers: { type: "array", items: { type: "object" } },
          // commentaryOvers: { type: "array", items: { type: "object" } },
          commentaryOvers: { type: "object" },
        },
        required: [],
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
          eventTypeId: { type: "string" },
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
          competitionId: { type: "string" },
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
          eventTypeId: { type: "string" },
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
          competitionId: { type: "string" },
          competition: { type: "string" },
          eventTypeId: { type: "string" },
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
            items: { type: "string" },
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
            competitionId: { type: "string" },
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
          eventTypeId: { type: "string" },
          competitionId: { type: "string" },
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
          eventId: { type: "string" },
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
          competitionId: { type: "string" },
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
          eventId: { type: "string" },
          eventTypeId: { type: "string" },
          competitionId: { type: "string" },
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
            items: { type: "string" },
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
          eventTypeID: { type: "string" },
          eventTypeName: { type: "string" },
          compititionID: { type: "string" },
          comtitionName: { type: "string" },
          eventID: { type: "string" },
          eventName: { type: "string" },
          countryCode: { type: "string" },
          timeZome: { type: "string" },
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
};
