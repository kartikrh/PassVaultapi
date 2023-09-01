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

const Admin = {
  //all tabs related schema
  getTabs: {
    schema: {
      tags: ["Admin"],
      description: "get tabs",
      //security: [{ bearerAuth: [] }],
    },
  },

  createTab: {
    schema: {
      tags: ["Admin"],
      description: "post tabs",
      //security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
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

  postById: {
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
        type: "object",
        properties: {
          tabId: { type: "string" },
          belowWho: { type: "string" },
        },
        required: ["tabId", "belowWho"],
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
  createBlock: {
    schema: {
      tags: ["Block"],
      description: "block create",
      //security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          blockName: { type: "string" },
          isShowContent: { type: "boolean" },
          content: { type: "string" },
          controlId: { type: "string" },
        },
        required: ["blockName", "isShowContent"],
      },
    },
  },
  updateBlock: {
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

module.exports = {
  Auth,
  Admin,
  Role,
  Block,
};
