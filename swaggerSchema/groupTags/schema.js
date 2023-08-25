//! for every new route add a schema name you wish to group the api's on swagger
const Auth = {
  signUp: {
    schema: {
      tags: ["Auth"],
      description: "signup",
      body: {
        type: "object",
        properties: {
          WrUserName: { type: "string" },
          WrPassword: { type: "string" },
          WrRoleId: { type: "integer" },
          WrName: { type: "string" },
          WrUserType: { type: "integer", enum: [1, 2, 3] },
          WrMobile: { type: "string" },
          WrIsActive: { type: "boolean" },
          WrIsSuperAdmin: { type: "boolean" },
          WrCreatedBy: { type: "integer" },
          WrCreatedType: { type: "integer" },
          WrModifyBy: { type: "integer" },
          WrModifyType: { type: "integer" },
          WrParentId: { type: "integer" },
          WrIsDelete: { type: "boolean" },
          WrDeleteBy: { type: "integer" },
          WrDeleteDate: { type: "string", format: "date-time" },
          WrAllowMultipleLogin: { type: "boolean" },
          WrSubAdminId: { type: "integer" },
        },
        required: ["WrUserName", "WrPassword"],
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
          WrUserName: { type: "string" },
          WrPassword: { type: "string" },
        },
        required: ["WrUserName", "WrPassword"],
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

  deleteTabs: {
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
};

module.exports = {
  Auth,
  Admin,
  Role,
};
