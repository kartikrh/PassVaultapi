const { isDefaultChange } = require("../../controller/users/admin/packages");

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
  signupAppAPI :{
    schema: {
      tags: ["Auth"],
      description: "signupAppAPI",
      body: {
        type: "object",
        properties: {
          mobileNo : {type: "string"},
          countryCode : {type: "string"},
          password : {type: "string"},
        },
        required: ["mobileNo","countryCode","password"],
      }
    }
  }, 
  signinClientApp : {
    schema: {
      tags: ["Auth"],
      description: "signinClientApp",
      body: {
        type: "object",
        properties: {
          mobileNo : {type: "string"},
          countryCode : {type: "string"},
          password : {type: "string"},
        },
        required: ["mobileNo","countryCode","password"],
      }
    }
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
  panelLoadData: {
    schema: {
      tags: ["Auth"],
      description: "LoadEnumData",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          module: { type: "array", items: { type: "integer" }, minItems: 1 },
        },
        required: ["module"],
      }
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
  clientLogin: {
    schema: {
      tags: ["Auth"],
      description: "clinetLogin",
      body: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          userName: { type: "string" },
          password: { type: "string" },
          deviceInfo: { type: "string" },
          token: { type: "string" },
          googleID: { type: "string" },
          ipAddress: { type: "string" },
        },
        required: ["userName"],
      },
    },
  },
  clientregistration: {
    schema: {
      tags: ["Auth"],
      description: "clientregistration",
      body: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          userName: { type: "string" },
          password: { type: "string" },
          token: { type: "string" },
          googleID: { type: "string" },
          mobileNo: { type: "string" },
          ipAddress: { type: "string" },
        },
        required: ["email","mobileNo"],
      },
    },
  },
  signupClientDetails: {
    schema: {
      tags: ["Auth"],
      description: "signupClientDetails",
      body: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          email: { type: "string" },
          userName: { type: "string" },
          mobileNo: { type: "string" },
          token: { type: "string" },
          googleID: { type: "string" },
          ipAddress: { type: "string" },
        },
        required: ["email"],
      },
    },
  },
  resendOtp: {
    schema: {
      tags: ["Auth"],
      description: "resendOtp",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
      },
    },
  },
  verifyMobile: {
    schema: {
      tags: ["Auth"],
      description: "verifyMobile",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
      },
    },
  },
  verifyMobileOtp: {
    schema: {
      tags: ["Auth"],
      description: "verifyMobileOtp",
      body: {
        type: "object",
        properties: {
          otp: { type: "string" },
          email: { type: "string" },
        },
        required: ["email", "otp"],
      },
    },
  },
  verifyEmail: {
    schema: {
      tags: ["Auth"],
      description: "verifyEmail",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
      },
    },
  },
  verifyEmailToken: {
    schema: {
      tags: ["Auth"],
      description: "verifyEmailToken",
      body: {
        type: "object",
        properties: {
          token: { type: "string" },
        },
        required: ["token"],
      },
    },
  },
  clientDetailsByEmailId: {
    schema: {
      tags: ["Auth"],
      description: "clientDetailsByEmailId",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
      },
    },
  },
  verifyOtp: {
    schema: {
      tags: ["Auth"],
      description: "verifyOtp",
      body: {
        type: "object",
        properties: {
          otp: { type: "string" },
          email: { type: "string" },
          isMobileVerify: {type: "boolean"},
          isEmailVerify: {type: "boolean"},
        },
        required: ["email", "otp"],
      },
    },
  },
  setPassword: {
    schema: {
      tags: ["Auth"],
      description: "setPassword",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
          password: { type: "string" },
        },
        required: ["email", "password"],
      },
    },
  },
  updateClientPassword: {
    schema: {
      tags: ["Auth"],
      description: "updateClientPassword",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
          oldPassword: { type: "string" },
          newPassword: {type: "string"},
          clientId: { type: "integer"},
        },
        required: ["clientId", "oldPassword", "newPassword"],
      },
    },
  },
  forgetPassword: {
    schema: {
      tags: ["Auth"],
      description: "forgetPassword",
      body: {
        type: "object",
        properties: {
          email: { type: "string" },
        },
        required: ["email"],
      },
    },
  },
  clientUpdate: {
    schema: {
      tags: ["Auth"],
      description: "clientUpdate",
      body: {
        type: "object",
        properties: {
          clientId : {type: "integer"},
          fullName: { type: "string" },
          email: { type: "string" },
          mobileNo: { type: "string" },
        },
        required: ["clientId"],
      },
    },
  },
  verifyMobileNo : {
    schema: {
      tags: ["Auth"],
      description: "verifyMobileNo",
      body: {
        type: "object",
        properties: {
          mobileNo : {type: "string"},
          countryCode : {type: "string"},
          otp : {type: "string"},
        },
        required: ["mobileNo","countryCode","otp"],
      }
    }
  },
  editClientProfile: {
    schema: {
      tags: ["Auth"],
      description: "edit client profile",
      body: {
        type: "object",
        properties: {
          clientId : {type: "string"},
          fullName: { type: "string" },
          email: { type: "string" },
        },
        required: ["clientId"],
      },
    },
  },
  changePassword: {
    schema: {
      tags: ["Auth"],
      description: "change client password",
      body: {
        type: "object",
        properties: {
          clientId : {type: "string"},
          oldPassword: { type: "string" },
          newPassword: { type: "string" },
        },
        required: ["clientId", "oldPassword", "newPassword"],
      },
    },
  },
  ResendOTP: {
    schema: {
      tags: ["Auth"],
      description: "OTP Resend",
      body: {
        type: "object",
        properties: {
          mobileNo: { type: "string" },
          countryCode: { type: "string" },
        },
        required: ["mobileNo"],
      },
    },
  },
  ForgotPassword: {
    schema: {
      tags: ["Auth"],
      description: "Forgot Password",
      body: {
        type: "object",
        properties: {
          mobileNo: { type: "string" },
          countryCode: { type: "string" },
        },
        required: ["mobileNo", "countryCode"],
      },
    },
  },
  VerifyForgotPassOTP: {
    schema: {
      tags: ["Auth"],
      description: "Verify forgot password OTP",
      body: {
        type: "object",
        properties: {
          clientId: { type: "string" },
          countryCode: { type: "string" },
          mobileNo: { type: "string" },
          otp: { type: "string" },
        },
        required: ["clientId", "countryCode", "mobileNo", "otp"],
      },
    },
  },
  UpdatePassword: {
    schema: {
      tags: ["Auth"],
      description: "Update client password",
      body: {
        type: "object",
        properties: {
          clientId: { type: "string" },
          password: { type: "string" },
        },
        required: ["clientId", "password"],
      },
    },
  },
  clientById: {
    schema: {
      tags: ["Auth"],
      description: "get client details",
      body: {
        type: "object",
        properties: {
          clientId: { type: "string" },
        },
        required: ["clientId"],
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
          competitionId: { type: "integer" },
        },
      },
    },
  },
  getTeamPoint : {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "get team point",
      body: {
        type: "object",
        properties: {
          teamId : { type: "integer" },
        },
        required: ["teamId"],
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
  competitionTypeList: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "get all competition type",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
          eventTypeId: { type: "integer" },
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
  getByTeamIdAndCompetitionId: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "get teams by id",
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" },
          competitionId: { type: "integer" },
        },
        required: ["teamId", "competitionId"],
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
          teamColor: { type: "string" },
          playerId: {
            type: "array",
            items: { type: "string" },
          },
          competitionId: {
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
  mergeImages: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "Merge team jersey and player images",
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
  updateSystemPlayer: {
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
    },
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
  mergeImage: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "Merge player image and jersey",
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
  getAllPlayerTeams: {
    schema: {
      tags: ["Player"],
      security: [{ bearerAuth: [] }],
      description: "get all Player Teams",
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
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
          isAutoChangeStriker: { type: "boolean" },
          autoChangeStrikerAfterBall: { type: "integer" },
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
  isHistory: {
    schema: {
      security: [{ bearerAuth: [] }],
      tags: ["Match Type"],
      description: "Change isHistory Match Type",
      body: {
        type: "object",
        properties: {
          matchTypeId: { type: "integer" },
          isHistory: { type: "boolean" },
        },
        required: ["matchTypeId", "isHistory"],
      },
    },
  },
};
const MatchTypeBowlingPredictor = {
  getAll: {
    schema: {
      tags: ["MatchType Bowling Predictor"],
      security: [{ bearerAuth: [] }],
      description: "get all MatchType Bowling Predictor",
    },
  },
  getById: {
    schema: {
      tags: ["MatchType Bowling Predictor"],
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
  save: {
    schema: {
      tags: ["MatchType Bowling Predictor"],
      security: [{ bearerAuth: [] }],
      description: "save MatchType Bowling Predictor",
      body: {
        type: "object",
        properties: {
          matchTypeData : {
            type : "array",
            items : {
              type : "object",
              properties : {
                matchTypeId: { type: "integer" },
                bowlingTypeId: { type: "integer" },
                possibility: { type: "number" },
                id: { type: "integer" },
              },
              required: ["matchTypeId" , "bowlingTypeId" , "possibility", "id"],
            },
          },
        },
        required: ["matchTypeData"],
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
  getByMatchType : {
    schema: {
      tags: ["MatchType Bowling Predictor"],
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
          evenTypeId : { type: "integer" },
          competitionId : { type: "integer" },
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
  allConfig: {
    schema: {
      tags: ["Config"],
      description: "Get filtered config details",
      body: {
        type: "object",
        properties: {
          keys: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        required: ["keys"],
      },
    },
  }
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
  changeIsTest: {
    schema: {
      tags: ["Commentary"],
      description: "change IsTest Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isTest: { type: "boolean" },
        },
        required: ["commentaryId", "isTest"],
      },
    },
  },
  getAllCommentaryHistory: {
    schema: {
      tags: ["Commentary"],
      description: "get all Commentary History",
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
  revertCommentary : {
    schema: {
      tags: ["Commentary"],
      description: "revert Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
        },
        required: ["commentaryId"],
      },
    }
  },
  saveComTemplate: {
    schema: {
      tags: ["Commentary"],
      description: "save Commentary Template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          saveTemplates : {
            type: "array",
            items: {
              type: "object",
              properties: {
                commentaryId: { type: "integer" },
                marketTemplateId: { type: "integer" },
              },
            },
          },
          dltTemplate: {
            type: "array",
            items: { type: "integer" },
          }
        },
        required: ["saveTemplates", "dltTemplate"],
      },
    },
  },
  upShotType : {
    schema: {
      tags: ["Commentary"],
      description: "update Shot Type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          shotType: { type: "boolean" },
        },
        required: ["commentaryId", "shotType"],
      },
    },
  },
  upIsWheelShow : {
    schema: {
      tags: ["Commentary"],
      description: "update Shot Type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isWheelShow: { type: "boolean" },
        },
        required: ["commentaryId", "isWheelShow"],
      },
    },
  },
  dltBallfromMeomory: {
    schema: {
      tags: ["Commentary"],
      description: "delete Commentary Data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          body : {
            type: "object",
            properties: {
              commentaryBallByBallId : {
                type: "array",
                items: { type: "integer" },
                },
              }
            },
        },
        required: ["commentaryBallByBallId"],
      },
    },
  },
  getLiveCommentaries : {
    schema: {
      tags: ["Commentary"],
      description: "get all Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventId : { type: "string" },
        },
      },
    },
  },
  deleteCommentaryData: {
    schema: {
      tags: ["Commentary"],
      description: "delete Commentary Data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          deleteBallByBall: {
            type: "array",
            items: { type: "integer" },
          },
          deleteOvers: {
            type: "array",
            items: { type: "integer" },
          },
          deleteWickets: {
            type: "array",
            items: { type: "integer" },
          },
          deletePartnership: {
            type: "array",
            items: { type: "integer" },
          },
        },
      },
    },
  },
  changeMaxOverDetail: {
    schema: {
      tags: ["Commentary"],
      description: "change Max Over Detail",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          teamMaxOver: { type: "integer" },
        },
        required: ["commentaryId", "teamMaxOver"],
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
  isCountInPointCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "isCountInPoint Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isCountInPoint: { type: "boolean" },
        },
        required: ["commentaryId", "isCountInPoint"],
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
  cancelCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "cancel Commentary",
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
  changeEventRefId: {
    schema: {
      tags: ["Commentary"],
      description: "change Event Ref Id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          eventRefId: { type: "string" },
        },
        required: ["commentaryId", "eventRefId"],
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
  changeResult: {
    schema: {
      tags: ["Commentary"],
      description: "Change Result",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          result: { type: "string" },
        },
        required: ["commentaryId", "result"],
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
  getByIdDetails: {
    schema: {
      tags: ["Commentary"],
      description: "get Commentary by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isStopLoadCommerty: { type: "boolean" },
        },
        required: ["commentaryId"],
      },
    },
  },
  getPredictorlogsById: {
    schema: {
      tags: ["Commentary"],
      description: "get Predictor Logs by id",
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
  updateTeamPlayer: {
    schema: {
      tags: ["Commentary"],
      description: "edit team players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        properties: {
          commentaryId: { type: "integer" },
          teamId: { type: "integer" },
          playerId: { type: "integer" },
          batsmanAverage: { type: "integer" },
          batsmanStrikeRate: { type: "integer" },
          isInPlayingEleven: { type: "boolean" },
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
  saveSuperOver: {
    schema: {
      tags: ["Commentary"],
      description: "save SuperOver Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          teamMaxOver: { type: "integer" },
          battingTeamId : { type: "integer" },
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
  changeIsCountInPoint: {
    schema: {
      tags: ["Commentary"],
      description: "change Commentary isCountInPoint",
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
  updateTeamPrediction: {
    schema: {
      tags: ["Commentary"],
      description: "updateTeamPrediction Commentary",
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
  updateLineRatio: {
    schema: {
      tags: ["Commentary"],
      description: "update Line ratio",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          // lineRatio: { type: "" },
        },
        required: ["commentaryId", "lineRatio"],
      },
    },
  },
  getAllAwards : {
    schema : {
      tags : ["Commentary"],
      description : "get all Awards",
      security : [{bearerAuth : []}]
    }
  },
  assignAward :{
    schema : {
      tags : ["Commentary Award"],
      description : "assign Award",
      security : [{bearerAuth : []}],
      body : {
        type :"object",
        properties : {
          comAward : {
            type : "array",
            items : {
              type : "object",
              properties : {
                commentaryId : {type : "integer"},
                awardId : {type : "integer"},
                teamId : {type : "integer"},
                playerId : {type : "integer"}
              },
              required : ["commentaryId", "awardId"]
            },
          }
        },
      },
    },
  },
  getAssignAward: {
    schema: {
      tags: ["Commentary Award"],
      description: "get assign award",
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
  completedCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "completed Commentary",
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
  getCommentaryBallByBallData: {
    schema: {
      tags: ["Commentary"],
      description: "get CommentaryBallByBall data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryBallByBallId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["commentaryBallByBallId"],
      },
    },
  },
  saveWagonWheel: {
    schema: {
      tags: ["Commentary"],
      description: "Save positions on wagon wheel",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryBallByBallId: { type: "integer" },
          x2: { type: "number" },
          y2: { type: "number" },
          shortType: { type: "string" },
          commentryRemark: { type: "string" },
        },
        required: ["commentaryBallByBallId", "x2", "y2"],
      },
    },
  },
  getEventMarketsByCommentaryId: {
    schema: {
      tags: ["Commentary"],
      description: "get eventMarkets by Commentary",
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
  upDLSDetail : {
    schema: {
      tags: ["Commentary"],
      description: "update DLS detail",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          comTeams : {
            type : "array",
            items : {
              type : "object",
              properties : {
                teamId : {type : "integer"},
                commentaryTeamId : {type : "integer"},
                teamMaxOver : {type : "integer"},
                teamTrialRuns : {type : "integer"},
              }
            }
          }
        },
        required: ["commentaryId", "comTeams"],
      },
    },
  },
  MergeImage: {
    schema: {
      tags: ["Commentary"],
      description: "Merge image on Commentary players",
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
  DRSLog: {
    schema: {
      tags: ["Commentary"],
      description: "Create drs log data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          commentaryId: { type: "integer" },
          commentaryTeamId: { type: "integer" },
          teamId: { type: "integer" },
          result: { type: "boolean" },
        },
        required: ["id", "commentaryId", "result"],
      },
    },
  },
  changeIsEventStart: {
    schema: {
      tags: ["Commentary"],
      description: "change isEventStart Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          isEventStart: { type: "boolean" },
        },
        required: ["commentaryId", "isEventStart"],
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
          isTrending : { type: "boolean" },
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
  isTrendingStatus: {
    schema: {
      tags: ["Compitition"],
      description: "change isTrending status",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          isTrending: { type: "boolean" },
        },
        required: ["competitionId", "isTrending"],
      },
    },
  },
  isEventSnap: {
    schema: {
      tags: ["Compitition"],
      description: "change isEventSnap status",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          isEventSnap: { type: "boolean" },
        },
        required: ["competitionId", "isEventSnap"],
      },
    },
  },
  isPointTable: {
    schema: {
      tags: ["Compitition"],
      description: "change isPointTable status",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          isPointTable: { type: "boolean" },
        },
        required: ["competitionId", "isPointTable"],
      },
    },
  },
  getMatchTypes: {
    schema: {
      tags: ["Compitition"],
      security: [{ bearerAuth: [] }],
      description: "get all Match Types",
    },
  },
  getEventSnapByCompetitionId: {
    schema: {
      tags: ["Compitition"],
      description: "get all Match Types",
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
  getCompetitionResult: {
    schema: {
      tags: ["Compitition"],
      description: "get all completed commentaries",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          teamId: { type: "integer" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
      },
    },
  },
  updateEventSnap: {
    schema: {
      tags: ["Compitition"],
      description: "get all Match Types",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          payload: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              commentaryId: { type: "integer" },
              commentaryPlayerId: { type: "integer" },
              matchCount: { type: "integer" },
              inningsCount: { type: "integer" },
              notOut: { type: "integer" },
              totalRuns: { type: "integer" },
              highestScore: { type: "string" },
              average: { type: "number" },
              ballsFacedCount: { type: "integer" },
              strikeRate: { type: "number" },
              countOf100: { type: "integer" },
              countOf50: { type: "integer" },
              countOf4: { type: "integer" },
              countOf6: { type: "integer" },
              catchCount: { type: "integer" },
              stumpCount: { type: "integer" },
            },
            required: ["id"],
          },
        },
       },
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
  competitionList: {
    schema : {
      tags : ["ImportMarket"],
      description : "get all Compitition",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
            eventTypeRefId : {type : "string"},
        },
        required : ["eventTypeRefId"]
      }
    }
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
          isMarket: { type: "boolean" },
        },
      },
    },
  },
  setMarketDetails: {
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
          marketID: { type: "string" },
          marketName: { type: "string" },
          marketStatus: { type: "integer" },
          marketType: { type: "integer" },
          marketTypeName: { type: "string" },
        },
      },
    },
  },
  updateTeamIdForSelectionId: {
    schema: {
      tags: ["ImportMarket"],
      description: "Update Team Id for selection",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            selectionId: { type: "string" },
            teamId: { type: "integer" },
          },
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
  clone: {
    schema: {
      tags: ["Market Template"],
      security: [{ bearerAuth: [] }],
      description: "clone market template",
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
          matchTypeID: { type: "integer" },
        },
        required: ["marketTemplateId", "matchTypeID"],
      },
    },
  },
  multiClone: {
    schema: {
      tags: ["Market Template"],
      security: [{ bearerAuth: [] }],
      description: "clone market template",
      body: {
        type: "object",
        properties: {
          marketTemplates: {
            type : "array",
            items: {
              type: "object",
              properties: {
                marketTemplateId: { type: "integer" },
                matchTypeID: { type: "integer" },
              },
              required: ["marketTemplateId", "matchTypeID"],
            }
          }
        },
        required: ["marketTemplates"],
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
          isDefaultBetAllowed: { type: "boolean" },
          isDefaultMarketActive: { type: "boolean" },
          isShowInAdvanceMarket: { type: "boolean" },
          lineType: { type: "integer" },
          defaultBackSize: { type: "integer" },
          defaultLaySize: { type: "integer" },
          beforeSuspendMin: { type: "string" },
          beforeCloseMin: { type: "string" },
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
  getCategoriesByMarketType: {
    schema: {
      tags: ["Market Template"],
      description: "get market categories based on the market type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  isPerEventStatus: {
    schema: {
      tags: ["Market Template"],
      description: "update isPerEvent status for Market Template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
          isPerEvent: { type: "boolean" },
        },
        required: ["marketTemplateId", "isPerEvent"],
      },
    },
  },
  isShowInAdvanceMarket: {
    schema: {
      tags: ["Market Template"],
      description: "update isShowInAdvanceMarket status for Market Template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
          isShowInAdvanceMarket: { type: "boolean" },
        },
        required: ["marketTemplateId", "isShowInAdvanceMarket"],
      },
    },
  },
  defaultIsSendData: {
    schema: {
      tags: ["Market Template"],
      description: "update defaultIsSendData change in Market Template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          marketTemplateId: { type: "integer" },
          defaultIsSendData: { type: "boolean" },
        },
        required: ["marketTemplateId", "defaultIsSendData"],
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
  getMarkets: {
    schema: {
      tags: ["Score"],
      description: "get all Markets",
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
  getNotificationByClient:{
    schema : {
      tags : ["Notification"],
      description : "get Notification By Client",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          clientId : {type : "integer"},
          page : {type : "integer"},
        },
        required : ["clientId", "page"]
      }
    }
  },
  markreadNotification :{
    schema : {
      tags : ["Score"],
      description : "Mark Read Notification",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          notificationId : {
            type : "array",
            items : {type : "integer"},
          },
          clientId : {type : "integer"}
        },
        required : ["notificationId", "clientId"]
      },
    }
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
  getGraphsEvent: {
    schema: {
      tags: ["Score"],
      description: "get Markets Graphs by EventID",
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
  getMarketRunners: {
    schema: {
      tags: ["Score"],
      description: "get Markets Runners data by EventID",
      body: {
        type: "object",
        properties: {
          eventId: { type: "string" },
        },
        required: ["eventId"],
      },
    },
  },
  getBanners: {
    schema: {
      tags: ["Score"],
      description: "get Banners",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  commentaryConsoleFe: {
    schema: {
      tags: ["commentaryConsoleFe"],
      description: "save commentaryConsoleFe",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          over: { type: "integer" },
          ballCount: { type: "string" },
          temporaryState: { type: "string" },
          currentState: { type: "string" },
          teamScore: { type: "string" },
        },
        required: ["ballCount"],
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
          tags: { type: "string" },
          viewerCount: { type: "integer" },
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
  upSusTime : {
    schema : {
      tags : ["EventMarket"],
      description : "update suspend time",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          eventMarketId : {
            type : "array",
            items : {type : "integer"},
          },
          afterSuspendTime : {type : "string"}
        },
        required : ["eventMarketId", "afterSuspendTime"]
      }
    }
  },
  upCloseTime : {
    schema : {
      tags : ["EventMarket"],
      description : "update close time",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          eventMarketId : {
            type : "array",
            items : {type : "integer"},
          },
          afterCloseTime : {type : "string"}
        },
        required : ["eventMarketId", "afterCloseTime"]
      }
    }
  },
  upSendMarket : {
    schema : {
      tags : ["EventMarket"],
      description : "update send market",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          eventMarketId : {
            type : "array",
            items : {type : "integer"},
          },
        },
        required : ["eventMarketId"]
      }
    }
  },  
  getManualMarket: {
    schema: {
      tags: ["EventMarket"],
      description: "get all Manual Market",
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
  saveManualMarket:{
    schema : {
      tags : ["EventMarket"],
      description : "save Manual Market",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          commentaryId : {type : "integer"},
          eventRefId : {type : "string"},
          inningsId : {type : "integer"},
          marketName : {type : "string"},
          isActive : {type : "boolean"},
          isAllow : {type : "boolean"},
          marketTypeId : {type : "integer"},
          marketTypeCategoryId : {type : "integer"},
          delay : {type : "integer"},
          lineRatio : {type : "number"},
          rateSourceRefID : {type : "string"},
          rateDiff : {type : "number"},
          runners : {
            type : "array",
            properties : {
              runner : {type : "string"},
              selectionId : {type : "integer"},
            },
            required : []
          }
        },
        required : [
          "commentaryId",
          "eventRefId",
          "inningsId",
          "marketName",
          "isActive",
          "isAllow",
          "marketTypeId",
          "marketTypeCategoryId",
          "delay",
          "lineRatio",
          "rateSourceRefID",
          "rateDiff",
          "runners"
        ]
      }
    }
  },
  upManualMarket:{
    schema : {
      tags : ["EventMarket"],
      description : "update Manual Market",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          eventMarkets : {
            type : "array",
            items : {
              type : "object",
              properties : {
                eventMarketId : {type : "integer"},
                runner : {
                  type : "array",
                  items : {
                    type : "object",
                    properties : {
                      runnerId : {type : "integer"},
                    },
                    required : ["runner"]
                  }
                }
              },
              required : ["eventMarketId", "runner"]
            }
          }
        },
        required : ["eventMarket"]
      }
    }
  },
  getComByComp:{
    schema : {
      tags : ["EventMarket"],
      description : "get Commentary by Competition",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          competitionId : {type : "integer"}
        },
        required : ["competitionId"]
      }
    }
  },
  closeSuspendTime:{
    schema : {
      tags : ["EventMarket"],
      description : "upate close and suspend time of event market",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          afterSuspendTime : {type : "string"},
          afterCloseTime : {type : "string"},
          eventMarketId : {type : "integer"}
        },
        required : ["eventMarketId"]
      }
    }
  },
  getMarketTypeCategory:{
    schema : {
      tags : ["EventMarket"],
      description : "get all Market Type Category",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          marketTypeCategoryId : {type : "integer"},
        },
        required : ["marketTypeCategoryId"]
      }
    },
  },
  getMarketTypeCategory : {
    schema  : {
      tags : ["EventMarket"],
      description : "get all Market Type Category",
      secaurity : [{bearerAuth : []}]
    }
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
  getRunnerByMarket:{
    schema : {
      tags : ["EventMarket"],
      description : "get Runner by market",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          eventMarketId : {type : "integer"}
        },
        required : ["eventMarketId"]
      }
    }
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
                runner: {
                  type: "array",
                  items: {
                    type: "object",
                  },
                },
              },
              required: ["runner"],
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
  setIsResult: {
    schema: {
      tags: ["EventMarket"],
      description: "Set EventMarket result",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
          isResult: { type: "boolean" }
        },
        required: ["eventMarketId", "isResult"],
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
          isDefaultBetAllowed: { type: "boolean" },
          isDefaultMarketActive: { type: "boolean" },
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
  updateOrApproveResultOfMarket: {
    schema: {
      tags: ["EventMarket"],
      description: "change result of market",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          isResult: { type: "boolean" },
          result: { type: "integer" },
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
          startDate: { type: "string" },
          endDate: { type: "string" },
          rateSourceRefId : {type : "integer"}
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
                // teamId: { type: "integer" },    
                inningsId: { type: "integer" },
                // marketName: { type: "string" },
                margin: { type: "number" },
                status: { type: "integer" },
                isPredefineMarket: { type: "boolean" },
                isPreMatchOnly: { type: "boolean" },
                isOver: { type: "boolean" },
                // over: { type: "number" },
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
  changeStatus : {
    schema : {
      tags : ["EventMarket"],
      description : "change market status",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          password : {type : "string"},
        },
        required : ["password"]
      }
    }
  },
  getDetailsByCIdV1: {
    schema: {
      tags: ["EventMarket"],
      description: "get all EventMarkets with Market types",
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
  closeMarkets: {
    schema: {
      tags: ["EventMarket"],
      description: "close EventMarket(s)",
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
  cancelMarkets: {
    schema: {
      tags: ["EventMarket"],
      description: "cancel EventMarket(s)",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          password: { type: "string"},
          eventMarketId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["eventMarketId", "password"],
      },
    },
  },
  upIsInningRun: {
    schema: {
      tags: [""],
      description: "update isinningRun Api",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          eventMarketId: { type: "integer" },
          isInningRun: { type: "boolean" },
        },
        required: ["eventMarketId", "isInningRun"],
      },
    },
  },
  loadMarketByCom :{
    schema : {
      tags : ["EventMarket"],
      description : "load market by commentary",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          commentaryId : {type : "integer"}
        },
        required : ["commentaryId"]
      }
    }
  }
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
          predefinedValue: { type: "number" },
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
  }
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
const ClientSocket = {
  getAll: {
    schema: {
      tags: ["ClientSocket"],
      description: "get all ClientSocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  byId: {
    schema: {
      tags: ["ClientSocket"],
      description: "get ClientSocket by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientSocketId: { type: "integer" },
        },
        required: ["clientSocketId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["ClientSocket"],
      description: "save ClientSocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientSocketId: { type: "integer" },
          serverName: { type: "string" },
          url: { type: "string" },
          isActive: { type: "boolean" },
          status: { type: "integer" },
          reconnectDelay: { type: "integer" },
          reconnectAttempts: { type: "integer" },
          reconnectMaxDelay: { type: "integer" },
          reconnectCount: { type: "integer" },
          actionType: { type: "integer" },
        },
        required: ["clientSocketId", "url"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["ClientSocket"],
      description: "delete ClientSocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientSocketId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["clientSocketId"],
      },
    },
  },
  changeActionType: {
    schema: {
      tags: ["ClientSocket"],
      description: "change action type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientSocketId: {
            type: "array",
            items: { type: "integer" },
          },
          actionType: { type: "integer" },
        },
        required: ["clientSocketId", "actionType"],
      },
    },
  },
  activeInactive: {
    schema: {
      tags: ["ClientSocket"],
      description: "active inactive ClientSocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientSocketId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["clientSocketId", "isActive"],
      },
    },
  },
};
const ActivityLog = {
  getAll: {
    schema: {
      tags: ["ActivityLog"],
      description: "get all ActivityLog",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        // properties: {
        //   isActive: { type: "boolean" },
        // },
      },
    },
  },
  getById: {
    schema: {
      tags: ["ActivityLog"],
      description: "get ActivityLog by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          activityLogId: { type: "integer" },
        },
        required: ["activityLogId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["ActivityLog"],
      description: "delete ActivityLog",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          activityLogId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["activityLogId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["ActivityLog"],
      description: "save ActivityLog",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          activityLogId: { type: "integer" },
          activityType: { type: "integer" },
          refId: { type: "string" },
          ipAddress: { type: "string" },
        },
        required: ["activityLogId"],
      },
    },
  },
};
const Banner = {
  getAll: {
    schema: {
      tags: ["Banner"],
      description: "get all Banners",
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
      tags: ["Banner"],
      description: "get Banner by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          bannerId: { type: "integer" },
        },
        required: ["bannerId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Banner"],
      description: "save Banner",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          bannerId: { type: "integer" },
          bannerType: { type: "integer" },
          title: { type: "string" },
          isPermanent: { type: "boolean" },
          isActive: { type: "boolean" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          link: { type: "string" },
          viewerCount: { type: "integer" },
        },
        required: ["bannerId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Banner"],
      description: "delete Banner",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          bannerId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["bannerId"],
      },
    },
  },
  activeInactiveBanner: {
    schema: {
      tags: ["Banner"],
      description: "active inactive banner",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          bannerId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["bannerId", "isActive"],
      },
    },
  },
};
const ApiEndpoints = {
  getAll: {
    schema: {
      tags: ["ApiEndpoints"],
      description: "get all ApiEndpoints",
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
      tags: ["ApiEndpoints"],
      description: "get ApiEndpoints by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiEndPointId: { type: "integer" },
        },
        required: ["apiEndPointId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["ApiEndpoints"],
      description: "delete ApiEndpoints",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiEndPointId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["apiEndPointId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["ApiEndpoints"],
      description: "save ApiEndpoints",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiEndPointId: { type: "integer" },
          serviceType: { type: "integer" },
          endPoint: { type: "string" },
          moduleType: { type: "integer" },
          timeOut: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["apiEndPointId"],
      },
    },
  },
  activeInactiveApiEndpoints: {
    schema: {
      tags: ["ApiEndpoints"],
      description: "active inactive ApiEndpoints",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiEndPointId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["apiEndPointId", "isActive"],
      },
    },
  },
};
const Api = {
  getAll: {
    schema: {
      tags: ["Api"],
      description: "get all Api",
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
      tags: ["Api"],
      description: "get Api by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiId: { type: "integer" },
        },
        required: ["apiId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Api"],
      description: "delete Api",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["apiId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Api"],
      description: "save Api",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiId: { type: "integer" },
          type: { type: "integer" },
          api: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["apiId"],
      },
    },
  },
  activeInactiveApi: {
    schema: {
      tags: ["Api"],
      description: "active inactive Api",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          apiId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["apiId", "isActive"],
      },
    },
  }
};
const Notification = {
  getAll :{
    schema : {
      tags : ["Notification"],
      description : "get all Notification",
      secaurity : [{bearerAuth : []}]
    }
  },
  getById :{
    schema :{
      tags : ["Notification"],
      description : "get Notification By Id",
      secaurity : [{bearerAuth : []}],
      body :{
        type : "object",
        properties : {
          notificationId : {type : "integer"}
        },
        required :["notificationId"]
      }
    }
  },
  save : {
    schema : {
      tags : ["Notification"],
      description : "save Notification",
      secaurity : [{bearerAuth : []}],
      body :{
        type : "object",
        properties : {
          notificationId : {type : "integer"},
          title : {type : "string"},
          description : {type : "string"},
          sendType : {type : "integer"},
          commentaryId : {type : "integer"},
          url : {type : "string"},
          isSend : {type : "boolean"},
        }
      }
    }
  },
  delete : {
    schema : {
      tags : ["Notification"],
      description : "delete Notification",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          notificationId : {
            type : "array",
            items : {type : "integer"},
            minItems : 1
          }
        },
        required : ["notificationId"]
      }
    }
  },
  sendNotification : {
    schema : {
      tags : ["Notification"],
      description : "send Notification",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          notificationId : {type : "integer"},
        },
        required : ["notificationId"]
      }
    }
  }
}

const Devices = {
  getById: {
    schema: {
      tags: ["Devices"],
      description: "get Config by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          deviceId: { type: "integer" },
        },
        required: ["deviceId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Devices"],
      description: "save Devices",
      security: [{ bearerAuth: [] }],

      body: {
        type: "object",
        properties: {
          deviceId: { type: "string" },
          name: { type: "string" },
          pushEndpoint: { type: "string" },
          pushP256DH: { type: "string" },
          pushAuth: { type: "string" },
          userId: { type: "integer" },
          userType: { type: "integer" },
          deviceType: { type: "integer" },
          mobileToken: { type: "string" },
        },
        required: ["name", "pushEndpoint", "pushP256DH","pushAuth"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Devices"],
      description: "delete Devices",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          configId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["deviceId"],
      },
    },
  },
};

const sendPushNotification = {
  send: {
    schema: {
      tags: ["sendPushNotification"],
      description: "send PushNotification",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          url: { type: "string" },
          image: { type: "string" },
          icon: { type: "string" },
        },
        required: ["title", "message"],
      },
    },
  },
};

const Template = {
  getAll: {
    schema: {
      tags: ["Template"],
      description: "get all Template",
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
      tags: ["Template"],
      description: "get Template by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          templateId: { type: "integer" },
        },
        required: ["templateId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Template"],
      description: "delete Template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
            templateId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        isActive: { type: "boolean" },
        },
        required: ["templateId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Template"],
      description: "save Template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          templateId: { type: "integer" },
          templateType: { type: "integer" },
          type: { type: "integer" },
          title: {type: "string"},
          description: {type: "string"},
          isActive: {type: "boolean"},
          isDefault : {type : "boolean"}
        },
        required: ["templateId", "templateType", "type", "title"],
      },
    },
  },
  activeInactiveTemplate: {
    schema: {
      tags: ["Template"],
      description: "active inactive Template",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          templateId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["templateId", "isActive"],
      },
    },
  },
  updateIsDefault : {
    schema : {
      tags : ["Template"],
      description : "update isDefault",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          templateId : {type : "integer"},
          isDefault : {type : "boolean"}
        },
        required : ["templateId" , "isDefault"]
      }
    }
  }
};

const Client = {
  getAll: {
    schema: {
      tags: ["Client"],
      description: "get all Client",
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
      tags: ["Client"],
      description: "get Client by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientId: { type: "integer" },
        },
        required: ["clientId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Client"],
      description: "delete Client",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
            clientId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        isActive: { type: "boolean" },
        },
        required: ["clientId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Client"],
      description: "save Client",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientId: { type: "integer" },
          fullName: { type: "string" },
          userName: { type: "string" },
          isAllowMultiLogin: {type: "boolean"},
          isDelete: { type: "boolean"},
          isEmailVerified: {type: "boolean"},
          emailId: {type: "string"},
          isMobileVerified: {type: "boolean"},
          mobileNo: {type: "string"},
          registrationProcessStatus: {type: "integer"},
          isUserActive: {type: "integer"},
          provider: {type: "integer"},
          isActive: {type: "boolean"},
        },
        required: ["clientId", "fullName", "emailId"],
      },
    },
  },
  activeInactiveClient: {
    schema: {
      tags: ["Client"],
      description: "active inactive Client",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["clientId", "isActive"],
      },
    },
  },
  verifyEmail : {
    schema : {
      tags : ["Client"],
      description : "verify email",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          clientId : {type : "integer"}
        },
        required : ["clientId"]
      }
    }
  },
  UserActiveInactive: {
    schema: {
      tags: ["Client"],
      description: "User active inactive",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientId: { type: "integer" },
          isUserActive: { type: "integer" },
        },
        required: ["clientId", "isUserActive"],
      },
    },
  },
  EmailAndMobileVerify: {
    schema: {
      tags: ["Client"],
      description: "Verify Email / Mobile number",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientId: { type: "integer" },
          type: { type: "integer" },
          isEmailVerified: { type: "boolean" },
          isMobileVerified: { type: "boolean" },
        },
        required: ["clientId", "type"],
      },
    },
  },
};
const weblogs = {
  save: {
    schema: {
      tags: ["weblogs"],
      description: "save weblogs",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          wRId: {type: "integer"},
          request: { type: "string" },
          requestTime: { type: "string" },
          generatedFrom: { type: "string" },
          comment: { type: "string" },
          response: { type: "string" },
          responseTime: { type: "string" },
        },
        required: ["wRId"],
      },
    },
  },
};


const MailSettings = {
  getAll: {
    schema: {
      tags: ["Mail settings"],
      description: "get all Mail settings",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Mail settings"],
      description: "save mail settings",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          email: { type: "string" },
          password: { type: "string" },
          userName: { type: "string" },
          mailType: { type: "integer" },
          smtpAddress: { type: "string" },
          portNumber: { type: "string" },
          isEnableSSL: { type: "boolean" },
          isActive: { type: "boolean" },
          isDefault: { type: "boolean" },
        },
        required: ["id", "email", "userName", "password", "mailType"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Mail settings"],
      description: "delete mail settings",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  getById: {
    schema: {
      tags: ["Mail settings"],
      description: "get mail settings by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  isDefaultStage: {
    schema: {
      tags: ["Mail settings"],
      description: "change isDefault stage by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isDefault: { type: "string" },
        },
        required: ["id", "isDefault"],
      },
    },
  },

  activeInactiveApi: {
    schema: {
      tags: ["Mail settings"],
      description: "active inactive Mail settings",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};
const Logs = {
  eventByCompetition : {
    schema : {
      tags : ["Logs"],
      description : "get logs by competition",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          competitionId : {type : "integer"}
        },
        required : ["competitionId"]
      }
    }
  },
  getComByCompetition : {
    schema : {
      tags : ["Logs"],
      description : "get logs by event",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          competitionId : {type : "integer"}
        },
        required : ["competitionId"]
      }
    }
  },
  responseLogs : {
    schema :{
      tags : ["Logs"],
      description : "get Response Log",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          page : {type : "integer"},
          limit : {type : "integer"}
        },
        required : ["page", "limit"]
      }
    }
  },
  undoLogs : {
    schema : {
      tags : ["Logs"],
      description : "undo Logs",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          skip : {type : "integer"},
          limit : {type : "integer"},
          commentaryId : {type : "integer"},
          startDate : {type : "string"},
          endDate : {type : "string"}
        },
        required : ["page", "limit"]
      }
    }
  },
  resultLogs : {
    schema : {
      tags : ["Logs"],
      description : "result Logs",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          skip : {type : "integer"},
          limit : {type : "integer"},
          marketId : {type : "integer"},
          startDate : {type : "string"},
          endDate : {type : "string"}
        },
        required : ["page", "limit"]
      }
    }
  },
  emLogs : {
    schema : {
      tags : ["Logs"],
      description : "event Market Logs",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          skip : {type : "integer"},
          limit : {type : "integer"},
          commentaryId : {type : "integer"},
          startDate : {type : "string"},
          endDate : {type : "string"}
        },
        required : ["page", "limit"]
      }
    }
  }
}
const ThirdPartyApis = {
  getAll: {
    schema: {
      tags: ["Third party Apis"],
      description: "get all Third party Apis",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Third party Apis"],
      description: "save Third party Api",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          providerName: { type: "string" },
          url: { type: "string" },
          type: { type: "integer" },
          isActive: { type: "boolean" },
          isConnect: { type: "boolean" },
        },
        required: ["id", "providerName", "type"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Third party Apis"],
      description: "delete Third party Api",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  getById: {
    schema: {
      tags: ["Third party Apis"],
      description: "get Third party Api by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  activeInactive: {
    schema: {
      tags: ["Third party Apis"],
      description: "active inactive Third party Api",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },

  isDefaultStage: {
    schema: {
      tags: ["Third party Apis"],
      description: "change isDefault stage by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isDefault: { type: "boolean" },
        },
        required: ["id", "isDefault"],
      },
    },
  },
};
const CommentaryScoringLogs = {
  getAll: {
    schema: {
      tags: ["Commentary Scoring Logs"],
      security: [{ bearerAuth: [] }],
      description: "get all Commentary Scoring Logs",
      body: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          commentaryId: { type: "integer" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Commentary Scoring Logs"],
      security: [{ bearerAuth: [] }],
      description: "save Commentary Scoring Log",
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" }
        },
        required: ["commentaryId"],
      },
    },
  },
};
const ClientVideo = {
  getAll: {
    schema: {
      tags: ["Client Video"],
      description: "get all client video",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Client Video"],
      security: [{ bearerAuth: [] }],
      description: "save client video",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          URL: { type: "string" },
          isActive: { type: "boolean" },
          credit: { type: "string" },
          viewerCount: { type: "integer" },
        },
        required: ["id", "title", "URL"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Client Video"],
      description: "delete client video",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  getById: {
    schema: {
      tags: ["Client Video"],
      description: "get client video by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  activeInactiveApi: {
    schema: {
      tags: ["Client Video"],
      description: "active inactive Client video",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};
const Award = {
  getAll : {
    schema : {
      tags : ["Award"],
      description : "get all Award",
      security : [{bearerAuth : []}]
    }
  },
  getById : {
    schema : {
      tags : ["Award"],
      description : "get Award by id",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          id : {type : "integer"}
        },
        required : ["id"]
      }
    }
  },
  save : {
    schema : {
      tags : ["Award"],
      description : "save Award",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          id : {type : "integer"},
          name : {type : "string"},
          isShowOnSummary : {type : "boolean"},
          isActive : {type : "boolean"}
        },
        required : ["id", "name"]
      }
    }
  },
  delete : {
    schema : {
      tags : ["Award"],
      description : "delete Award",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          id : {
            type : "array",
            items : {type : "integer"},
            minItems : 1
          }
        },
        required : ["id"]
      }
    }
  },
  activeInactive : {
    schema : {
      tags : ["Award"],
      description : "active inactive Award",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          id : {type : "integer"},
          isActive : {type : "boolean"}
        },
        required : ["id", "isActive"]
      }
    }
  },
  // updateDisplayOrder : {
  //   schema : {
  //     tags : ["Award"],
  //     description : "update display order",
  //     security : [{bearerAuth : []}],
  //     body : {
        // type : "object",
        // properties : {
        //   award : {
        //     type : "array",
        //     items : {
        //       type : "object",
        //       properties : {
        //         id : {type : "integer"},
        //         displayOrder : {type : "integer"}
        //       },
        //       required : ["id", "displayOrder"]
        //     },
        //     minItems : 1
        //   }
        // },
        // required : ["award"]
    //   }
    // }
  // }
  updateDisplayOrder: {
    schema: {
      tags: ["Award"],
      description: "update display order",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
};
const CommentaryAward = {
  getAll : {
    schema : {
      tags : ["Commentary Award"],
      description : "get all Commentary Award",
      security : [{bearerAuth : []}]
    }
  },
  assignAward :{
    schema : {
      tags : ["Commentary Award"],
      description : "assign Award",
      security : [{bearerAuth : []}],
      body : {
        type :"object",
        properties : {
          comAward : {
            type : "array",
            items : {
              type : "object",
              properties : {
                commentaryId : {type : "integer"},
                awardId : {type : "integer"},
                teamId : {type : "integer"},
                playerId : {type : "integer"}
              },
              required : ["commentaryId", "awardId"]
            },
          }
        },
      },
    },
  },
  getAssignAward: {
    schema: {
      tags: ["Commentary Award"],
      description: "get assign award",
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
  
  getById : {
    schema : {
      tags : ["Commentary Award"],
      description : "get Commentary Award by id",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          id : {type : "integer"}
        },
        required : ["id"]
      }
    }
  },
  save : {
    schema : {
      tags : ["Commentary Award"],
      description : "save Commentary Award",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          id : {type : "integer"},
          commentaryId : {type : "integer"},
          awardId : {type : "integer"},
          teamId : {type : "integer"},
          playerId : {type : "integer"},
        },
        required : ["id", "commentaryId", "awardId"]
      }
    }
  },
  delete : {
    schema : {
      tags : ["Commentary Award"],
      description : "delete Commentary Award",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          id : {
            type : "array",
            items : {type : "integer"},
            minItems : 1
          }
        },
        required : ["id"]
      }
    }
  },
  commentaryList : {
    schema : {
      tags : ["Commentary Award"],
      description : "get Commentary List",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          status : {type : "integer"},
          eventTypeId : {type : "integer"},
          competitionId : {type : "integer"},

        }
      }
    }
  },
  comTeamList : {
    schema : {
      tags : ["Commentary Award"],
      description : "get Commentary Team List",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          commentaryId : {type : "integer"}
        },
        required : ["commentaryId"]
      }
    }
  },
  comPlayerList : {
    schema : {
      tags : ["Commentary Award"],
      description : "get Commentary Player List",
      security : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          commentaryId : {type : "integer"},
          teamId : {type : "integer"}
        },
        required : ["commentaryId"]
      }
    }
  },
}
const SocialMedia = {
  getAll: {
    schema: {
      tags: ["Social media"],
      description: "get all Social media data",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Social media"],
      security: [{ bearerAuth: [] }],
      description: "save Social media data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          link: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["id", "name", "link"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Social media"],
      description: "delete Social media data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  getById: {
    schema: {
      tags: ["Social media"],
      description: "get Social media data by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  activeInactiveApi: {
    schema: {
      tags: ["Social media"],
      description: "active inactive Social media data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};
const Article = {
  getAll: {
    schema: {
      tags: ["Article"],
      description: "get all Articles",
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
      tags: ["Article"],
      description: "get Article by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Article"],
      description: "save Article",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          article: { type: "string" },
          isPermanent: { type: "boolean" },
          isActive: { type: "boolean" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          tags: { type: "string" },
          viewerCount: { type: "integer" },
          credit: { type: "string" },
          SEO: { type: "string" },
          SEODescription: { type: "string" },
        },
        required: ["id", "title", "article"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Article"],
      description: "delete Article",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
  activeInactiveArticle: {
    schema: {
      tags: ["Article"],
      description: "active inactive Article",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};

const TournamentTeamPlayers = {
  getAll: {
    schema: {
      tags: ["Tournament Team Players"],
      description: "get all Tournament Team Players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          teamId: { type: "integer" },
        },
      },
    },
  },
  save: {
    schema: {
      tags: ["Tournament Team Players"],
      description: "save Tournament Team Players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          teamId: { type: "integer" },
          teamPlayers : {
              type : "array",
              items : {
                type : "object",
                properties : {
                  playerId : {type : "integer"},
                  teamId : {type : "integer"},
                  competitionId : {type : "integer"},
                  playerName : {type : "string"},
                },
                required : ["playerId", "teamId", "competitionId", "playerName"]
              }
          }
        },
        required : ["teamPlayers", "competitionId", "teamId"]
      },
    },
  },
  playersList: {
    schema: {
      tags: ["Tournament Team Players"],
      description: "get players list by teamId",
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
  delete: {
    schema: {
      tags: ["Tournament Team Players"],
      description: "delete Tournament Team Players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  }
};

const Groups = {
  getAll: {
    schema: {
      tags: ["Groups"],
      description: "get all Groups",
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
      tags: ["Groups"],
      description: "get Groups by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          groupId: { type: "integer" },
        },
        required: ["groupId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Groups"],
      description: "save Groups",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          groupId: { type: "integer" },
          groupName: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["groupId", "groupName"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Groups"],
      description: "delete Groups",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["groupId"],
      },
    },
  },
  activeInactiveGroup: {
    schema: {
      tags: ["Groups"],
      description: "active inactive Groups",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          groupId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["groupId", "isActive"],
      },
    },
  },
};

const TournamentTeamPoints = {
  getAll: {
    schema: {
      tags: ["Tournament Team Points"],
      description: "get all Tournament Team Points",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          teamId: { type: "integer" },
        },
      },
    },
  },
  // save: {
  //   schema: {
  //     tags: ["Tournament Team Points"],
  //     description: "save Tournament Team Points",
  //     security: [{ bearerAuth: [] }],
  //     body: {
  //       type: "array",
  //       items: {
  //         type: "object",
  //         properties: {
  //           groupId: { type: "integer" },
  //           teamId: { type: "integer" },
  //           competitionId: { type: "integer" },
  //           totalMatches: { type: "integer" },
  //           totalWin: { type: "integer" },
  //           totalLose: { type: "integer" },
  //           totalTie: { type: "integer" },
  //           noResult: { type: "integer" },
  //           totalPoint: { type: "integer" },
  //           isActive: { type: "boolean" },
  //           id: { type: "integer" },
  //         },
  //         required: ["competitionId", "teamId", "id"],
  //       },
  //     },
  //   },
  // },
  save: {
    schema: {
      tags: ["Tournament Team Points"],
      description: "save Tournament Team Points",
      security: [{ bearerAuth: [] }],
      body: {
          type: "object",
          properties: {
            groupId: { type: "integer" },
            teamId: { type: "integer" },
            competitionId: { type: "integer" },
            totalMatches: { type: "integer" },
            totalWin: { type: "integer" },
            totalLose: { type: "integer" },
            totalTie: { type: "integer" },
            noResult: { type: "integer" },
            totalPoint: { type: "integer" },
            isActive: { type: "boolean" },
            id: { type: "integer" },
          },
          required: ["competitionId", "teamId", "id"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Tournament Team Points"],
      description: "delete Tournament Team Points",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
  activeInactive: {
    schema: {
      tags: ["Tournament Team Points"],
      description: "active inactive Tournament Team Points",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
  teamsList: {
    schema: {
      tags: ["Tournament Team Points"],
      description: "teamsList on Tournament Team Points",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
        },
      },
    },
  },
  recalculation: {
    schema: {
      tags: ["Tournament Team Points"],
      description: "recalculation on Tournament Team Points",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" },
          teamId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["competitionId", "teamId"],
      },
    },
  },
};
const PlayerHistory = {
  getAll: {
    schema: {
      tags: ["PlayerHistory"],
      description: "get Player's all batting and bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
        },
        required: ["playerId"],
      },
    },
  },
  getPlayerHist:{
    schema : {
      tags: ["PlayerHistory"],
      description: "save Batting history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
          matchTypeId: { type: "integer" },
        },
        required: ["playerId", "matchTypeId"],
      },
    }
  },
  commBatSummaryCalculation:{
    schema : {
      tags: ["PlayerHistory"],
      description: "update bat summary history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
          matchTypeId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["playerId", "matchTypeId"],
      },
    }
  },
  commBowlSummaryCalculation:{
    schema : {
      tags: ["PlayerHistory"],
      description: "update bowl summary history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
          matchTypeId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["playerId", "matchTypeId"],
      },
    }
  },
  playerBatSummary:{
    schema : {
      tags: ["PlayerHistory"],
      description: "update player bat summary history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
        },
        required: ["playerId"],
      },
    }
  },
  playerBowlSummary:{
    schema : {
      tags: ["PlayerHistory"],
      description: "update player bowl summary history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
        },
        required: ["playerId"],
      },
    }
  },
  saveBattingHistory: {
    schema: {
      tags: ["PlayerHistory"],
      description: "save Batting history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            battingHistoryId: { type: "integer" },
            matchTypeId: { type: "integer" },
            playerId: { type: "integer" },
            matchTypeName: { type: "string" },
            matchCount: { type: "integer" },
            inningsCount: { type: "integer" },
            notOut: { type: "integer" },
            totalRuns: { type: "integer" },
            highestScore: { type: "string" },
            ballsFacedCount: { type: "integer" },
            countOf100: { type: "integer" },
            countOf50: { type: "integer" },
            countOf4: { type: "integer" },
            countOf6: { type: "integer" },
            average: { type: "number" },
            strikeRate: { type: "number" },
            catchCount: { type: "integer" },
            stumpCount: { type: "integer" },
            outCount: { type: "integer" },
          },
          required: ["matchTypeId", "playerId"],
        },
      },
    },
  },
  saveBowlingHistory: {
    schema: {
      tags: ["PlayerHistory"],
      description: "save Bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            bowlingHistoryId: { type: "integer" },
            matchTypeId: { type: "integer" },
            playerId: { type: "integer" },
            matchTypeName: { type: "string" },
            matchCount: { type: "integer" },
            inningsCount: { type: "integer" },
            ballCount: { type: "integer" },
            totalRuns: { type: "integer" },
            wicketsCount: { type: "integer" },
            bestBowlingInInnings: { type: "string" },
            bestBowlingInMatch: { type: "string" },
            wickets4: { type: "integer" },
            wickets5: { type: "integer" },
            wickets10: { type: "integer" },
            average: { type: "number" },
            strikeRate: { type: "number" },
            economy: { type: "number" },
          },
          required: ["matchTypeId", "playerId"],
        },
      },
    },
  },
  deleteBattingHistory: {
    schema: {
      tags: ["PlayerHistory"],
      description: "delete player batting history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          battingHistoryId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["battingHistoryId"],
      },
    },
  },
  deleteBowlingHistory: {
    schema: {
      tags: ["PlayerHistory"],
      description: "delete player bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          bowlingHistoryId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["bowlingHistoryId"],
      },
    },
  },
  upPlayerBatHist: {
    schema: {
      tags: ["PlayerHistory"],
      description: "update player batting history",
      security: [{ bearerAuth: [] }],
      body: {
          type: "object",
          properties: {
            id: { type: "integer" },
            matchCount: { type: "integer" },
            inningsCount: { type: "integer" },
            notOut: { type: "integer" },
            totalRuns: { type: "integer" },
            highestScore: { type: "string" },
            average: { type: "number" },
            ballsFacedCount: { type: "integer" },
            strikeRate: { type: "number" },
            countOf100: { type: "integer" },
            countOf50: { type: "integer" },
            countOf4: { type: "integer" },
            countOf6: { type: "integer" },
            catchCount: { type: "integer" },
            stumpCount: { type: "integer" },
            outCount: { type: "integer" },
          },
          required: ["id"],
        },
      }
  },
  upPlayerBallHist: {
    schema: {
      tags: ["PlayerHistory"],
      description: "update player bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
          properties: {
            id: { type: "integer" },
            matchCount: { type: "integer" },
            inningsCount: { type: "integer" },
            ballCount: { type: "integer" },
            totalRuns: { type: "integer" },
            wicketsCount: { type: "integer" },
            bowlerAverage: { type: "number" },
            bestBowlingInInnings: { type: "string" },
            bestBowlingInMatch: { type: "string" },
            bowlerStrikeRate: { type: "number" },
            economy: { type: "number" },
            wickets4: { type: "integer" },
            wickets5: { type: "integer" },
            wickets10: { type: "integer" },
          },
          required: ["id"],
        },
    },
  },
};
const CommentaryPlayerHistory = {
  getAll: {
    schema: {
      tags: ["CommentaryPlayerHistory"],
      description: "get Player's all commentary batting and bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
        },
        required: ["playerId"],
      },
    },
  },
  byPlayerId: {
    schema: {
      tags: ["CommentaryPlayerHistory"],
      description: "get Player commentary batting and bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          playerId: { type: "integer" },
        },
        required: ["playerId"],
      },
    },
  },
  updateBatHistory: {
    schema: {
      tags: ["CommentaryPlayerHistory"],
      description: "update Commentary Player Batting history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          payload: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              commentaryId: { type: "integer" },
              commentaryPlayerId: { type: "integer" },
              matchCount: { type: "integer" },
              inningsCount: { type: "integer" },
              notOut: { type: "integer" },
              totalRuns: { type: "integer" },
              highestScore: { type: "string" },
              average: { type: "number" },
              ballsFacedCount: { type: "integer" },
              strikeRate: { type: "number" },
              countOf100: { type: "integer" },
              countOf50: { type: "integer" },
              countOf4: { type: "integer" },
              countOf6: { type: "integer" },
              catchCount: { type: "integer" },
              stumpCount: { type: "integer" },
              outCount: { type: "integer" },
            },
            required: ["id"],
          },
        },
       },
      },
    },
  },
  updateBowlHistory: {
    schema: {
      tags: ["CommentaryPlayerHistory"],
      description: "update Commentary Player Bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          payload: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "integer" },
              commentaryId: { type: "integer" },
              commentaryPlayerId: { type: "integer" },
              matchCount: { type: "integer" },
              inningsCount: { type: "integer" },
              ballCount: { type: "integer" },
              totalRuns: { type: "integer" },
              wicketsCount: { type: "integer" },
              bowlerAverage: { type: "number" },
              bestBowlingInInnings: { type: "string" },
              bestBowlingInMatch: { type: "string" },
              bowlerStrikeRate: { type: "number" },
              economy: { type: "number" },
              wickets4: { type: "integer" },
              wickets5: { type: "integer" },
              wickets10: { type: "integer" },
            },
            required: ["id"],
          },
        },
       },
      },
    },
  },
  deleteCommBattingHistory: {
    schema: {
      tags: ["CommentaryPlayerHistory"],
      description: "delete commetary player batting history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
  deleteCommBowlingHistory: {
    schema: {
      tags: ["CommentaryPlayerHistory"],
      description: "delete commentary player bowling history",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
};
const PhotoLibrary = {
  getAll: {
    schema: {
      tags: ["PhotoLibrary"],
      description: "get all photoLibrary data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  byId: {
    schema: {
      tags: ["PhotoLibrary"],
      description: "get photo library by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          photoLibraryId: { type: "integer" },
        },
        required: ["photoLibraryId"],
      },
    },
  },
  savePhotoLibrary: {
    schema: {
      tags: ["PhotoLibrary"],
      description: "save photo library data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          photoLibraryId: { type: "integer" },
          title: { type: "string" },
          SEO: { type: "string" },
          description: { type: "string" },
          isPermanent: { type: "boolean" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["photoLibraryId", "title"],
      },
    },
  },
  deletePhotoLibrary: {
    schema: {
      tags: ["PhotoLibrary"],
      description: "delete photo library data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          photoLibraryId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["photoLibraryId"],
      },
    },
  },
};
const LibraryImages = {
  getAll: {
    schema: {
      tags: ["LibraryImages"],
      description: "get all library images data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          photoLibraryId: { type: "integer" },
        },
        required: ["photoLibraryId"],
      },
    },
  },
  byId: {
    schema: {
      tags: ["LibraryImages"],
      description: "get library images by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
  saveLibraryImage: {
    schema: {
      tags: ["LibraryImages"],
      description: "save library image data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          photoLibraryId: { type: "integer" },
          title: { type: "string" },
          isDefault: { type: "boolean" },
          id: { type: "number" },
        },
        required: ["photoLibraryId", "id"],
      },
    },
  },
  deleteLibraryImage: {
    schema: {
      tags: ["LibraryImages"],
      description: "delete library Image",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
  updateDisplayOrder: {
    schema: {
      tags: ["LibraryImages"],
      description: "update display order",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
  updateIsDefault: {
    schema: {
      tags: ["LibraryImages"],
      description: "update Default",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isDefault: { type: "boolean" },
        },
        required: ["id", "isDefault"],
      },
    },
  },
};
const VideoLibrary = {
  getAll: {
    schema: {
      tags: ["VideoLibrary"],
      description: "get all video library data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  byId: {
    schema: {
      tags: ["VideoLibrary"],
      description: "get video library by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
  saveVideoLibrary: {
    schema: {
      tags: ["VideoLibrary"],
      description: "save video library data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          title: { type: "string" },
          isPermanent: { type: "boolean" },
          from: { type: "string" },
          to: { type: "string" },
          tag: { type: "string" },
          SEO: { type: "string" },
          description: { type: "string" },
          videoURL: { type: "string" },
          type: { type: "integer"},
          commentaryId: { type: "integer"},
        },
        required: ["id"],
      },
    },
  },
  deleteVideoLibrary: {
    schema: {
      tags: ["VideoLibrary"],
      description: "delete video library data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
};
const ShotType = {
  getAll: {
    schema: {
      tags: ["ShotType"],
      description: "get all shot type data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  byId: {
    schema: {
      tags: ["ShotType"],
      description: "get shot type by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
  saveShotType: {
    schema: {
      tags: ["ShotType"],
      description: "save shot type data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          name: { type: "string" },
          isActive: { type: "boolean" },
          id: { type: "number" },
        },
        required: ["id"],
      },
    },
  },
  deleteShotType: {
    schema: {
      tags: ["ShotType"],
      description: "delete shot type(s)",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
  updateDisplayOrder: {
    schema: {
      tags: ["ShotType"],
      description: "update display order",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
  updateIsActive: {
    schema: {
      tags: ["ShotType"],
      description: "update isActive",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};

const Tips = {
  getAll: {
    schema: {
      tags: ["Tips"],
      description: "get all Tips data",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },
  save: {
    schema: {
      tags: ["Tips"],
      security: [{ bearerAuth: [] }],
      description: "save Tips data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          commentaryId: { type: "integer" },
          eventRefId: { type: "string" },
          tipsRefId: { type: "string" },
          tips: { type: "string" },
          isActive: { type: "boolean" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Tips"],
      description: "delete Tips data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["Tips"],
      description: "get Tips data by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
  activeInactive: {
    schema: {
      tags: ["Tips"],
      description: "active inactive Tips data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};
const CountryCode = {
  save: {
    schema: {
      tags: ["CountryCode"],
      security: [{ bearerAuth: [] }],
      description: "save country code data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          countryCode: { type: "string" },
          countryName: { type: "string" },
        },
        required: ["id"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["CountryCode"],
      description: "delete country code(s) data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },
  getById: {
    schema: {
      tags: ["CountryCode"],
      description: "get country code data by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },
  activeInactiveApi: {
    schema: {
      tags: ["CountryCode"],
      description: "active inactive CountryCode data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};
const Packages = {
  getAll: {
    schema: {
      tags: ["Package"],
      description: "get all Package data",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Package"],
      security: [{ bearerAuth: [] }],
      description: "save Package data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "integer" },
          currency: { type: "string" },
          intervalType: { type: "integer" },
          intervalCount: { type: "integer" },
          razorPayPlanId: { type: "string" },
          isActive: { type: "boolean" },
          isDisplay: { type: "boolean" },
          trailDays: { type: "integer" },
          isDefault: { type: "boolean" },
        },
        required: ["id", "name"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Package"],
      description: "delete Package data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  getById: {
    schema: {
      tags: ["Package"],
      description: "get Package data by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  activeInactiveApi: {
    schema: {
      tags: ["Package"],
      description: "active inactive Package data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },

  isDisplay: {
    schema: {
      tags: ["Package"],
      description: "isDispaly Package data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isDisplay: { type: "boolean" },
        },
        required: ["id", "isDisplay"],
      },
    },
  },

  isDefaultChange: {
    schema: {
      tags: ["Package"],
      description: "IsDefault change",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isDefault: { type: "boolean" },
        },
        required: ["id", "isDefault"],
      },
    },
  },

  DisplayUpdate: {
    schema: {
      tags: ["Package"],
      description: "Display update",
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
};
const Whitelabel = {
  getAll: {
    schema: {
      tags: ["Whitelabel"],
      description: "get all Whitelabel data",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Whitelabel"],
      security: [{ bearerAuth: [] }],
      description: "save Whitelabel data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          domain: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["id", "domain"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Whitelabel"],
      description: "delete Whitelabel data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  getById: {
    schema: {
      tags: ["Whitelabel"],
      description: "get Whitelabel data by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  activeInactive: {
    schema: {
      tags: ["Whitelabel"],
      description: "active inactive Whitelabel data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};
const NotificationConfig = {
  getAll: {
    schema: {
      tags: ["Notification config"],
      description: "get all Notification config data",
      body: {
        type: "object",
        properties: {
          isActive: { type: "boolean" },
        },
      },
    },
  },

  save: {
    schema: {
      tags: ["Notification config"],
      security: [{ bearerAuth: [] }],
      description: "save Notification config data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          eventName: { type: "integer" },
          content: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["id", "eventName", "content"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Notification config"],
      description: "delete Notification config data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  getById: {
    schema: {
      tags: ["Notification config"],
      description: "get Notification config data by id",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  activeInactive: {
    schema: {
      tags: ["Notification config"],
      description: "active inactive Notification config data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id", "isActive"],
      },
    },
  },
};
const VirtualEvent = {
  saveEvent : {
    schema : {
      tags: ["VirtualEvent"],
      description: "save VirtualEvent data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId : { type: "integer" },
          eventDate : { type: "string" },
          eventName : { type: "string" },
          eventRefId : { type: "string" }
        },
        required: ["competitionId", "eventDate", "eventName"],
      }
    }
  },
  createVirtualEvent : {
    schema : {
      tags: ["VirtualEvent"],
      description: "create VirtualEvent data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId : { type: "integer" },
          eventDate : { type: "string" },
          eventRefId : { type: "string" }
        },
        required: ["competitionId", "eventDate", "eventRefId"],
      }
    }
  },
  EventToss : {
    schema : {
      tags: ["VirtualEvent"],
      description: "VirtualEvent Toss",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : { type: "integer" },
          tossWonTeam : { type: "integer" },
          decision : { type: "integer" },
        },
        required: ["commentaryId", "tossWonTeam", "decision"],
      }
    }
  },
  BallStartEvent : {
    schema : {
      tags: ["CompetitionEvent"],
      description: "Ball Start Event",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : { type: "integer" },
          displayStatus : { type: "string" },
          commentaryPlayerId : { type: "integer" },
        },
        required: ["commentaryId", "displayStatus"],
      }
    }
  },
}
const FavCompetitions = {
  save: {
    schema: {
      tags: ["FavCompetitions"],
      security: [{ bearerAuth: [] }],
      description: "save FavCompetitions data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          clientId: { type: "string" },
          competitionId: { type: "integer" },
          isDefault: { type: "boolean" },
        },
        required: ["id", "clientId", "competitionId"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["FavCompetitions"],
      description: "delete FavCompetitions data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
      },
    },
  },

  updateDisplayOrder: {
    schema: {
      tags: ["FavCompetitions"],
      description: "update display order",
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "integer" },
            displayOrder: { type: "integer" },
          },
        },
        minItems: 1,
      },
    },
  },
};
const FavCommentary = {
  save: {
    schema: {
      tags: ["FavCommentary"],
      security: [{ bearerAuth: [] }],
      description: "save FavCommentary data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          clientId: { type: "string" },
          commentaryId: { type: "integer" },
        },
        required: ["id", "clientId", "commentaryId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["FavCommentary"],
      description: "delete FavCommentary data",
      body: {
        type: "object",
        properties: {
          id: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["id"],
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
  ClientSocket,
  ActivityLog,
  Banner,
  ApiEndpoints,
  Api,
  Notification,
  Devices,
  sendPushNotification,
  Template,
  Client,
  weblogs,
  MailSettings,
  Logs,
  ThirdPartyApis,
  CommentaryScoringLogs,
  ClientVideo,
  Award,
  CommentaryAward,
  SocialMedia,
  Article,
  TournamentTeamPlayers,
  Groups,
  TournamentTeamPoints,
  PlayerHistory,
  CommentaryPlayerHistory,
  PhotoLibrary,
  LibraryImages,
  VideoLibrary,
  ShotType,
  Tips,
  MatchTypeBowlingPredictor,
  CountryCode,
  Packages,
  Whitelabel,
  NotificationConfig,
  VirtualEvent,
  FavCompetitions,
  FavCommentary,
};
