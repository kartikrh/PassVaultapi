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
};

const Tabs = {
  //all tabs related schema
  getTabs: {
    schema: {
      tags: ["Admin"],
      description: "get tabs",
      //security: [{ bearerAuth: [] }],
    },
  },
  deleteTabs: {
    schema: {
      tags: ["Admin"],
      description: "Deactivate tabs by encrypted tab IDs",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getByDisplayType: {
    schema: {
      tags: ["Role"],
      description: "get roles by display type",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Block"],
      description: "get blocks",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          blockId: { type: "string" },
          blockName: { type: "string" },
          isShowContent: { type: "boolean" },
          content: { type: "string" },
          controlId: { type: "string" },
        },
        required: ["blockName", "blockId"],
      },
    },
  },
  deleteBlock: {
    schema: {
      tags: ["Block"],
      description: "block delete",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Menu Types"],
      description: "get Menu Type by Id",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Menu Item Types"],
      description: "get Menu Item Type by Id",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Menu Item"],
      description: "get Menu Item by Id",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Page Formate"],
      description: "get Page Formate by Id",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
        required: ["pageFormatId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Page Formate"],
      description: "delete page formate",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Page"],
      description: "get Page by Id",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
        },
        required: ["pageId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Page"],
      description: "delete page",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
    },
  },
  getById: {
    schema: {
      tags: ["Page Alias"],
      description: "get Page Alias by Id",
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      //security: [{ bearerAuth: [] }],
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
      description: "get all event type",
    },
  },
  getById: {
    schema: {
      tags: ["Event Type"],
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
      description: "save event type",
      body: {
        type: "object",
        properties: {
          eventTypeId: { type: "string" },
          eventType: { type: "string" },
          refId: { type: "string" },
          image: { type: "string" },
          icon: { type: "string" },
          isActive: { type: "boolean" },
          displayOrder: { type: "integer" },
          remark: { type: "string" },
          eEventTypeId: { type: "string" },
          eRefId: { type: "string" },
          displayType: { type: "integer", enum: [1, 2] },
          isHighlight: { type: "boolean" },
        },
        required: ["eventTypeId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Event Type"],
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
};

const Teams = {
  getAll: {
    schema: {
      tags: ["Teams"],
      description: "get all teams",
    },
  },
  getById: {
    schema: {
      tags: ["Teams"],
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
      description: "save teams",
      body: {
        type: "object",
        properties: {
          teamId: { type: "string" },
          teamName: { type: "string" },
          teamShortName: { type: "string" },
          country: { type: "string" },
          eventTypeId: { type: "string" },
          image: { type: "string" },
          imageUrl: { type: "string" },
        },
        required: ["teamId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Teams"],
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
      tags: ["Panelty Runs"],
      description: "get all Panelty Runs",
    },
  },
  getById: {
    schema: {
      tags: ["Panelty Runs"],
      description: "get Panelty Runs by id",
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
      tags: ["Panelty Runs"],
      description: "save Panelty Runs",
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
      tags: ["Panelty Runs"],
      description: "delete Panelty Runs",
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
      description: "get all Player",
    },
  },
  getById: {
    schema: {
      tags: ["Player"],
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
      description: "save Player",
      body: {
        type: "object",
        properties: {
          playerId: { type: "string" },
          eventTypeId: { type: "string" },
          country: { type: "string" },
          teamId: { type: "string" },
          playerName: { type: "string" },
          image: { type: "string" },
          bowlingStyle: { type: "integer" },
          isActive: { type: "boolean" },
          isKipper: { type: "boolean" },
          isLeftHandedBatting: { type: "boolean" },
          isLeftArmFielding: { type: "boolean" },
          playerType: { type: "integer" },
          imageUrl: { type: "string" },
          batsmanAverage: { type: "number" },
          batsmanStrikeRate: { type: "number" },
          bowlerAverage: { type: "number" },
          bowlerEconomy: { type: "number" },
          displayName: { type: "string" },
        },
        required: ["playerId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Player"],
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

const TeamPlayer = {
  getAll: {
    schema: {
      tags: ["Team Player"],
      description: "get all Team Player",
    },
  },
  getById: {
    schema: {
      tags: ["Team Player"],
      description: "get Team Player by id",
      body: {
        type: "object",
        properties: {
          teamPlayerId: { type: "string" },
        },
        required: ["teamPlayerId"],
      },
    },
  },
  byTeamId: {
    schema: {
      tags: ["Team Player"],
      description: "get Team Player by id",
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
      tags: ["Team Player"],
      description: "save Team Player",
      body: {
        type: "object",
        properties: {
          teamPlayerId: { type: "string" },
          teamId: { type: "string" },
          refPlayerId: { type: "string" },
          playerOrder: { type: "integer" },
        },
        required: ["teamPlayerId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Team Player"],
      description: "delete Team Player",
      body: {
        type: "object",
        properties: {
          teamPlayerId: {
            type: "array",
            items: { type: "string" },
            minItems: 1,
          },
        },
        required: ["teamPlayerId"],
      },
    },
  },
};

const MatchType = {
  getAll: {
    schema: {
      tags: ["Match Type"],
      description: "get all Match Type",
    },
  },
  getById: {
    schema: {
      tags: ["Match Type"],
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
  save: {
    schema: {
      tags: ["Match Type"],
      description: "save Match Type",
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "string" },
          matchType: { type: "string" },
          matchRefType: { type: "integer" },
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
    },
  },
  getById: {
    schema: {
      tags: ["User"],
      description: "get User by id",
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
  TeamPlayer,
  MatchType,
  User,
};
