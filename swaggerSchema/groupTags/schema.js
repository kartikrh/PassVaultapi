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
};

Admin = {
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
          wrTabName: { type: "string" },
          WrDisplayName: { type: "string" },
          wrDisplayType: { type: "integer", enum: [1, 2] },
          wrWebPage: { type: "string" },
          wrParentId: { type: "integer" },
          wrIsActive: { type: "boolean" },
          wrIsAdd: { type: "boolean" },
          wrIsEdit: { type: "boolean" },
          wrIsDelete: { type: "boolean" },
          wrIsView: { type: "boolean" },
          wrAddWebpage: { type: "string" },
          wrIsMenu: { type: "boolean" },
          wrIconName: { type: "string" },
          wrDisplayOrder: { type: "integer" },
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
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  },

  postById: {
    schema: {
      tags: ["Admin"],
      description: "post by Id tabs",
      //security: [{ bearerAuth: [] }],
    },
  },
};

module.exports = {
  Auth,
  Admin,
};
