//! for every new route add a schema name you wish to group the api's on swagger
const Auth = {
  signUp: {
    schema: {
      hide: true,
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
          eventTypeId: { type: "integer" },
          tpId: { type: "integer" },
          countryId: { type: "integer" },
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
  importUpdate: {
    schema: {
      tags: ["Teams"],
      security: [{ bearerAuth: [] }],
      description: "Update Teams from entity sport",
      body: {
        type: "object",
        properties: {
          teamIds: { type: "array" }
        },
        required: ["teamIds"],
      },
    },
  },
  activeInactive: {
    schema: {
      tags: ["Teams"],
      description: "active inactive teams data",
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" },
          isMen: { type: "boolean" },
          isInternational: { type: "boolean" },
        },
        required: ["teamId"],
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

const Dashboard = {
  counts: {
    schema: {
      tags: ["Dashboard"],
      description: "Record counts for the panel's Dashboard tiles (News, Banners, Users, Pages, Photo Library, Video Library) in one call",
      security: [{ bearerAuth: [] }],
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
  reveal: {
    schema: {
      tags: ["Config"],
      description: "reveal a Config's real value, gated on the LOADDATAPASSWORD config",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          configId: { type: "string" },
          password: { type: "string" },
        },
        required: ["configId", "password"],
      },
    },
  },
  rotateEncryptionKey: {
    schema: {
      tags: ["Config"],
      description: "Rotate APPENCRYPTIONKEY: decrypts every affected column with the old key and re-encrypts with the new one in one transaction, gated on the LOADDATAPASSWORD config",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          newKey: { type: "string" },
          password: { type: "string" },
        },
        required: ["newKey", "password"],
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
  checkSUpdatePass: {
    schema: {
      tags: ["Commentary"],
      description: "checkSUpdatePass Commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          password : {type : "string"}
        },
        required : ["commentaryId", "password"]
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
          commentaryId : { type: "integer" },
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
          eventRefId: { type: ["string", "null"] },
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
  deleteTeamPlayer: {
    schema: {
      tags: ["Commentary"],
      description: "delete team players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          commentaryPlayerId: { type: "integer" },
        },
        required: ["commentaryId", "commentaryPlayerId"],
      },
    },
  },
  updateTeamPlayer: {
    schema: {
      tags: ["Commentary"],
      description: "edit team players",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : { type: "integer" },
          // eventRefId: { type: "string" },
          playerDataArray : {
            type: "array",
            items: {
              type: "object",
              properties: {
                commentaryId: { type: "integer" },
                  teamId: { type: "integer" },
                  playerId: { type: "integer" },
                  // batsmanAverage: { type: "integer" },
                  // batsmanStrikeRate: { type: "integer" },
                  // isInPlayingEleven: { type: "boolean" },
              },
            }
          }
        },
        required: ["commentaryId", "playerDataArray"],
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
          matchTypeId: { type: "integer" }
        },
        required: ["teamId", "matchTypeId"],
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
          streamingUrl: { type: "string" },
          streamingType: { type: "integer" },
          // tossWonBy: { type: "string" },
          // choseTo: { type: "integer" },
          // winnerId: { type: "string" },
          // winnerName: { type: "string" },
          // isClientShow: { type: "boolean" },
          // displayStatus: { type: "string" },
          // commentaryStatus: { type: "integer" },
          // rmk: { type: "string" },
          // updateTime: { type: "string" },
          // isMatchDraw: { type: "boolean" },
          target: { type: "integer" },
          marketId: { type: "integer" },
          tpId: { type: "integer" },
          isSignalROn: { type: "boolean" },
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
  comStart: {
    schema: {
      tags: ["Commentary"],
      description: "Commentary start details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          commentaryPlayers: { type: "array", items: { type: "object" } },
          commentaryDetails: { type: "object" },
          // commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryOvers: { type : "object" },
          commentaryBallByBall: { type: "object" },
          // commentaryWickets: { type: "array", items: { type: "object" } },
          commentaryPartnership: {   type: "object" },
          isCallPredict : {type : "boolean"}
        },
        required: [
          "commentaryId" ,"commentaryDetails", "commentaryPlayers","commentaryOvers","commentaryBallByBall", "commentaryPartnership", "isCallPredict"
        ],
      },
    },
  },
  comToss: {
    schema: {
      tags: ["Commentary"],
      description: "Commentary start details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          // commentaryPlayers: { type: "array", items: { type: "object" } },
          commentaryDetails: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          // commentaryOvers: { type : "object" },
          // commentaryBallByBall: { type: "object" },
          // // commentaryWickets: { type: "array", items: { type: "object" } },
          // commentaryPartnership: {   type: "object" },
          isCallPredict : {type : "boolean"}
        },
        required: [
          "commentaryId" , "commentaryDetails", "commentaryTeams", "isCallPredict"
        ],
      },
    },
  },
  comScore : {
    schema : {
      tags :["Commentary"],
       description: "Commentary start details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          commentaryPlayers: { type: "array", items: { type: "object" } },
          commentaryDetails: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryOvers: { type : "object" },
          commentaryBallByBall: { type: "object" },
          // commentaryWickets: { type: "array", items: { type: "object" } },
          commentaryPartnership: {   type: "object" },
          isCallPredict : {type : "boolean"}
        },
        required: [
          "commentaryId" ,"commentaryDetails", "commentaryPlayers","commentaryOvers","commentaryBallByBall", "commentaryPartnership", "isCallPredict", "commentaryTeams"
        ],
      },
    }
  },
  comOverStart : {
    schema : {
      tags :["Commentary"],
       description: "Commentary start details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          commentaryOvers: { type : "object" },
          commentaryBallByBall: { type: "object" },
          // commentaryWickets: { type: "array", items: { type: "object" } },
          // commentaryPartnership: {   type: "object" },
          isCallPredict : {type : "boolean"}
        },
        required: [
          "commentaryId" ,"commentaryOvers","commentaryBallByBall", "isCallPredict"
        ],
      },
    }
  },
  comSwapPlayer : {
    schema : {
      tags : ["Commentary"],
      description : "Commentary Swap Player",
      secaurity : [{bearerAuth : []}],
      body : {
        type : "object",
        properties : {
          commentaryId : {type : "integer"},
          isCallPredict : {type : "boolean"},
          commentaryDetails : {type : "object"},
          commentaryPlayers : {type : "array"},
          commentaryPartnership : {type : "object"}
        }
      },
      required : [
        "commentaryId" ,"commentaryDetails", "commentaryPartnership", "isCallPredict", "commentaryPlayers"
      ]
    }
  },
  comInningChange:{
    schema : {
      tags :["Commentary"],
       description: "Commentary start details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          commentaryDetails : {type : "object"},
          commentaryPartnership : {type : "object"},
          commentaryPlayers :   { type: "array", items: { type: "object" } },
          commentaryTeams :   { type: "array", items: { type: "object" } },
          isCallPredict : {type : "boolean"},
          isEndInnings : {type : "boolean"}
        },
        required: [
          "commentaryId" ,"commentaryDetails","commentaryPartnership", "isCallPredict",
          "isEndInnings","commentaryPlayers","commentaryTeams"
        ],
      },
    }
  },
  UpdatePitchageAndSession:{
    schema : {
      tags :["Commentary"],
       description: "update Commentary pitchage and session",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          pitchAge : {type : "integer"},
          session : {type : "string"},
        },
        required: [ "commentaryId" ],
      },
    }
  },
  GetPitchageAndSession:{
    schema : {
      tags :["Commentary"],
       description: "get Commentary pitchage and session",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
        },
        required: [ "commentaryId" ],
      },
    }
  },
  comWicket : {
    schema : {
      tags :["Commentary"],
      description: "Commentary Wicket details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          commentaryPlayers: { type: "array", items: { type: "object" } },
          commentaryDetails: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryOvers: { type : "object" },
          commentaryBallByBall: { type: "object" },
          commentaryWicket:  { type: "object" },
          commentaryPartnership: {   type: "object" },
          isCallPredict : {type : "boolean"}
        },
        required: [
          "commentaryId" ,"commentaryDetails", "commentaryPlayers","commentaryOvers","commentaryBallByBall", "commentaryPartnership", "isCallPredict", "commentaryTeams",
          "commentaryWicket"
        ],
      },
    }
  },
  comSetPlayer : {
    schema : {
      tags :["Commentary"],
      description: "Commentary Player details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          commentaryPlayers: { type: "array", items: { type: "object" } },
          commentaryBallByBall: { type: "object" },
          commentaryPartnership: {   type: "object" },
          isCallPredict : {type : "boolean"}
        },
        required: [
          "commentaryId", "commentaryPlayers", "commentaryBallByBall", "commentaryPartnership", "isCallPredict"
        ],
      },
    }
  },
  UpdatePythonAPI : {
    schema : {
      tags :["Commentary"],
      description: "Commentary Player details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          pythonId: {type: "integer"},
          pythonURI : {type : "string"}
        },
        required: [ "commentaryId", "pythonId", "pythonURI"],
      },
    }
  },
  UndoAPI: {
    schema: {
      tags: ["Commentary"],
      description: "undo Commentary details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          commentaryDetails: { type: "object" },
          commentaryPartnership: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryPlayers: { type: "array", items: { type: "object" } },
          commentaryOvers: { type: "object" },
        },
        required: ["commentaryId"],
      },
    },
  },
  drsById: {
    schema: {
      tags: ["Commentary"],
      description: "get commentary DRS data",
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
  drsByCommentaryId: {
    schema: {
      tags: ["Commentary"],
      description: "get commentary DRS data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          commentaryTeamId: { type: "integer" },
        },
        required: ["commentaryId"],
      },
    },
  },
  dltDrs: {
    schema: {
      tags: ["Commentary"],
      description: "delete commentary DRS data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id : {type : "array"}
        },
        required: ["id"],
      },
    },
  },
  takeDrs: {
    schema: {
      tags: ["Commentary"],
      description: "take commentary DRS data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id : {type : "integer"},
          commentaryId : {type : "integer"},
          commentaryTeamId : {type : "integer"},
          teamId : {type : "integer"}
        },
        required: ["id" , "commentaryId" , "commentaryTeamId", "teamId"],
      },
    },
  },
  upDrs: {
    schema: {
      tags: ["Commentary"],
      description: "update commentary DRS data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id : {type : "integer"},
          result : {type : "boolean"},
          isCount : {type : "boolean"}
        },
        required: ["id" , "isCount", "result"],
      },
    },
  },
  changeStriker: {
    schema: {
      tags: ["Commentary"],
      description: "update commentary data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId :{type : "integer"},
          commentaryDetails : {type : "object"},
          commentaryPlayers : {type : "array"},
        },
        required: ["commentaryId" , "commentaryDetails", "commentaryPlayers"],
      },
    },
  },
  changePly: {
    schema: {
      tags: ["Commentary"],
      description: "update commentary data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId :{type : "integer"},
          commentaryDetails : {type : "object"},
          commentaryPlayers : {type : "array"},
          commentaryPartnership : {type : "object"}
        },
        required: ["commentaryId" , "commentaryDetails", "commentaryPlayers", "commentaryPartnership"],
      },
    },
  },
  changeOver: {
    schema: {
      tags: ["Commentary"],
      description: "update commentary data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId :{type : "integer"},
          commentaryDetails : {type : "object"},
          commentaryOvers : {type : "object"},
          commentaryPlayers : {type : "array"},
          isCallPredict : {type : "boolean"},
          commentaryTeams : {type : "array"}
        },
        required: ["commentaryId" , "commentaryDetails", "commentaryPlayers", "commentaryOvers", "commentaryTeams"],
      },
    },
  },
  updateEventTypeIdAndCompId: {
    schema: {
      tags: ["Commentary"],
      description: "update commentary data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId :{type : "integer"},
          competitionId :{type : "integer"},
          eventTypeId :{type : "integer"}
        },
        required: ["commentaryId", "competitionId", "eventTypeId"],
      },
    },
  },
  commWicketById: {
    schema: {
      tags: ["Commentary"],
      description: "get commentary wicket data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryWicketId :{type : "integer"},
        },
        required: ["commentaryWicketId"],
      },
    },
  },
  updateCommWicket: {
    schema: {
      tags: ["Commentary"],
      description: "update commentary wicket data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryWicketId :{type : "integer"},
          commentaryId: { type: "integer" },
          bowlerId: { type: "integer" },
          bowlerName: { type: "string" },
          wicketType: { type: "integer" },
          batterId: { type: "integer" },
          batterName: { type: "string" },
          fieldPlayerId : {type : "integer"},
          fieldPlayerName: { type: "string" },
          overId: { type: "integer" },
          overCount: { type: "string" },
          commentaryBallByBallId: { type: "integer" },
          teamId: { type: "integer" },
          teamScore: { type: "integer" },
          playerRun: { type: "integer" },
          playerBalls: { type: "integer" },
          wicketCount: { type: "integer" },
          ballCount: { type: "integer" },
          currentInnings: { type: "integer" },
          fieldPlayer2Id: { type: "integer" },
          fieldPlayer2Name: { type: "string" },
        },
        required: ["commentaryWicketId"],
      },
    },
  },
  changeScoringType: {
    schema: {
      tags: ["Commentary"],
      description: "update commentary scoringType data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer"},
          scoringType: { type: "integer"},
          tpId: { type: ["integer", "null"]},
        },
        required: ["commentaryId", "scoringType", "tpId"],
      },
    },
  },
  validatePassword: {
    schema: {
      tags: ["Commentary"],
      description: "Validate password on prediction false",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          password: { type: "string"},
        },
        required: ["password"],
      },
    },
  },
  upMatchInfo: {
    schema: {
      tags: ["Commentary"],
      description: "update MatchInfo",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          // password: { type: "string"},
          commentaryId : {type : "integer"}
        },
        required: ["commentaryId"],
      },
    },
  },
  changeOverType: {
    schema: {
      tags: ["Commentary"],
      description: "update overType",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          overId : {type : "integer"},
          overType : {type : "integer"},
          overTypeName : {type : "string"},
        },
        required: ["commentaryId", "overId", "overType", "overTypeName"],
      },
    },
  },
  bowlingTypeChange: {
    schema: {
      tags: ["Commentary"],
      description: "update bowlingType",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          commentaryPlayerId : {type : "integer"},
          bowlingType : {type : "integer"},
        },
        required: ["commentaryId", "commentaryPlayerId", "bowlingType"],
      },
    },
  },
  updateStreamingURLAndType: {
    schema: {
      tags: ["Commentary"],
      description: "update streaming",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId : {type : "integer"},
          streamingType : {type : "integer"},
          streamingUrl : {type : "string"},
        },
        required: ["commentaryId", "streamingType", "streamingUrl"],
      },
    },
  },
  undoCommentaryInning : {
    schema: {
      tags: ["Commentary"],
      description: "undo Commentary inning",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          undoInning: { type: "integer" },
        },
        required: ["commentaryId", "undoInning"],
      },
    }
  },
  undoCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "undo Commentary details",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryId: { type: "integer" },
          commentaryDetails: { type: "object" },
          commentaryTeams: { type: "array", items: { type: "object" } },
          commentaryPlayers: { type: "array", items: { type: "object" } },
        },
        required: ["commentaryId"],
      },
    },
  },
  getCommentaryViewsList: {
    schema: {
      tags: ["Commentary"],
      description: "get all commentaries views list",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          commentaryStatus: { type: "integer" },
          eventTypeId: { type: "integer" },
          competitionId: { type: "integer" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          isVirtual: { type: "boolean" },
          pythonId: { type: "integer" },
        }
      },
    },
  },
  getHeadToHeadCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "get all head to head commentary",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          team1Id: { type: "integer" },
          team2Id: { type: "integer" },
          matchTypeId: { type: "integer" }
        },
        required: ["team1Id", "team2Id", "matchTypeId"]
      }
    }
  },
  getCommentaryStatistics: {
    schema: {
      tags: ["Commentary"],
      description: "get all commentary stats by competition id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          competitionId: { type: "integer" }
        },
        required: ["competitionId"]
      }
    }
  },
  abandonedCommentary: {
    schema: {
      tags: ["Commentary"],
      description: "abandoned Commentary",
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
  updateCommentaryToss: {
    schema: {
      tags: ["Commentary"],
      description: "update Commentary toss",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          response: {
            type: "object",
            required: ["match_info"],
            properties: {
              match_info: {
                type: "object",
                required: ["toss"],
                properties: {
                  toss: {
                    type: "object",
                    required: ["winnerTeamId", "decision"],
                    properties: {
                      winnerTeamId: { type: "integer" },
                      decision: { type: "integer" }
                    }
                  }
                }
              }
            }
          },
          comDetails: { type: "object" }
        },
        required: ["response", "comDetails"]
      }
    }
  }
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

const Score = {
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
          isUpdateView: { type: "boolean" },
          status: { type: "integer" },
          reconnectDelay: { type: "integer" },
          reconnectAttempts: { type: "integer" },
          reconnectMaxDelay: { type: "integer" },
          reconnectCount: { type: "integer" },
          actionType: { type: "integer" },
          updateInterval: { type: "integer" },
          isAPNSEnable: { type: "boolean" },
          APNSProdHost: { type: "string" },
          APNSSandboxHost: { type: "string" },
          APNSKeyId: { type: "string" },
          APNSTeamId: { type: "string" },
          APNSBundleId: { type: "string" },
          APNSKeyPath: { type: "string" },
          APNSEnvType: { type: "integer" }
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
  updateView: {
    schema: {
      tags: ["ClientSocket"],
      description: "isUpdateView ClientSocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientSocketId: { type: "integer" },
          isUpdateView: { type: "boolean" },
        },
        required: ["clientSocketId", "isUpdateView"],
      },
    },
  },
  activeInactiveAPNS: {
    schema: {
      tags: ["ClientSocket"],
      description: "Update Active/Inactive APNS notification",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          clientSocketId: { type: "integer" },
          isAPNSEnable: { type: "boolean" },
        },
        required: ["clientSocketId", "isAPNSEnable"],
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
          deviceTypeId: { type: "integer" },
          // viewerCount: { type: "integer" },
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
  updateDisplayOrder: {
    schema: {
      tags: ["Banner"],
      description: "update display order of banners",
      security: [{ bearerAuth: [] }],
      body: {
        type: "array",
        items: {
          type: "object",
          properties: {
            bannerId: { type: "integer" },
            displayOrder: { type: "integer" }
          },
          required: ["bannerId", "displayOrder"]
        }
      }
    }
  },
};

const Advertise = {
  getAll: {
    schema: {
      tags: ["Advertise"],
      description: "get all Advertise",
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
      tags: ["Advertise"],
      description: "get Advertise by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          advertiseId: { type: "integer" },
        },
        required: ["advertiseId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["Advertise"],
      description: "save Advertise",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          advertiseId: { type: "integer" },
          title: { type: "string" },
          image: {
            type: "array",
            items: {
              type: "object"
            }
          },
          link: { type: "string" },
          isPermanent: { type: "boolean" },
          isActive: { type: "boolean" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["advertiseId"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["Advertise"],
      description: "delete Advertise",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          advertiseId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["advertiseId"],
      },
    },
  },
  activeInactiveAdvertise: {
    schema: {
      tags: ["Advertise"],
      description: "active inactive advertise",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          advertiseId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["advertiseId", "isActive"],
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
          isUserActive: { type: "integer" },
          provider: { type: "integer" },
          registrationProcessStatus: { type: "integer" },
          isEmailVerified: { type: "boolean" },
          isMobileVerified: { type: "boolean" }
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
  decryptPassword: {
    schema: {
      tags: ["Client"],
      description: "decryptPassword child Client's password",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          userId: { type: "integer" },
        },
        required: ["clientId"],
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

  testMail: {
    schema: {
      tags: ["Mail settings"],
      description: "send a test mail using a saved mail settings configuration",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          testEmail: { type: "string" },
        },
        required: ["id", "testEmail"],
      },
    },
  },
};
const Logs = {
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
          startDate: { type: "string", nullable: true },
          endDate: { type: "string", nullable: true }
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
          shortName: { type: "string" },
          timezone: { type: "string" },
          isActive: { type: "boolean" },
          isClientShow: { type: "boolean" },
          isDefault: { type: "boolean" },
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
  isClientShowChange: {
    schema: {
      tags: ["CountryCode"],
      description: "update client show CountryCode data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isClientShow: { type: "boolean" },
        },
        required: ["id", "isClientShow"],
      },
    },
  },
  isDefaultChange: {
    schema: {
      tags: ["CountryCode"],
      description: "update isDefault CountryCode data",
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
const CardType = {
  save: {
    schema: {
      tags: ["CardType"],
      security: [{ bearerAuth: [] }],
      description: "save card type data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          enum: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["id"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["CardType"],
      description: "delete card type(s) data",
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
      tags: ["CardType"],
      description: "get card type data by id",
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
      tags: ["CardType"],
      description: "active inactive CardType data",
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

const PaymentMethods = {
  getAll: {
    schema: {
      tags: ["PaymentMethods"],
      description: "get all payment methods",
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
      tags: ["PaymentMethods"],
      description: "get a payment method by id",
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
      tags: ["PaymentMethods"],
      security: [{ bearerAuth: [] }],
      description: "create/update a payment method",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          type: { type: "string", enum: ["QR", "BANK"] },
          label: { type: "string" },
          // qrImageUrl is intentionally left undeclared -- it now arrives as
          // an uploaded file (multipart array), same as Banner's `image`
          // field in Banner.save.schema above. Declaring it `type: "string"`
          // would make ajv reject the upload.
          upiId: { type: "string" },
          bankName: { type: "string" },
          accountHolderName: { type: "string" },
          accountNumber: { type: "string" },
          ifscCode: { type: "string" },
          branch: { type: "string" },
          instructions: { type: "string" },
          isActive: { type: "boolean" },
          isDefault: { type: "boolean" },
        },
        required: ["type", "label"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["PaymentMethods"],
      description: "soft-delete payment method(s)",
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

  activeInactiveApi: {
    schema: {
      tags: ["PaymentMethods"],
      description: "active/inactive a payment method",
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

  isDefaultChange: {
    schema: {
      tags: ["PaymentMethods"],
      description: "flip which payment method is the default shown to clients",
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

const VaultPlan = {
  availablePlans: {
    schema: {
      tags: ["VaultPlan"],
      security: [{ bearerAuth: [] }],
      description: "get the plans a client can upgrade to",
    },
  },

  getDefaultPaymentMethod: {
    schema: {
      tags: ["VaultPlan"],
      security: [{ bearerAuth: [] }],
      description: "get the default payment method to show a client upgrading their plan",
    },
  },

  upgradeRequest: {
    schema: {
      tags: ["VaultPlan"],
      security: [{ bearerAuth: [] }],
      description: "submit a plan upgrade request with a transfer/reference code",
      body: {
        type: "object",
        properties: {
          packageId: { type: "integer" },
          transferCode: { type: "string" },
        },
        required: ["packageId", "transferCode"],
      },
    },
  },

  myUpgradeRequest: {
    schema: {
      tags: ["VaultPlan"],
      security: [{ bearerAuth: [] }],
      description: "get the client's own latest plan upgrade request",
    },
  },

  adminGetAll: {
    schema: {
      tags: ["VaultPlan"],
      security: [{ bearerAuth: [] }],
      description: "admin: list plan upgrade requests",
      body: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED"] },
          clientId: { type: "integer" },
          limit: { type: "integer" },
          offset: { type: "integer" },
        },
      },
    },
  },

  adminApprove: {
    schema: {
      tags: ["VaultPlan"],
      security: [{ bearerAuth: [] }],
      description: "admin: approve a plan upgrade request",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
        },
        required: ["id"],
      },
    },
  },

  adminReject: {
    schema: {
      tags: ["VaultPlan"],
      security: [{ bearerAuth: [] }],
      description: "admin: reject a plan upgrade request",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          reason: { type: "string" },
        },
        required: ["id", "reason"],
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
  upIsDefault: {
    schema: {
      tags: ["Whitelabel"],
      description: "upIsDefault Whitelabel data",
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
  demoClientEnableInIOS: {
    schema: {
      tags: ["Whitelabel"],
      description: "demoClientEnableInIOS status change Whitelabel data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isDemoClientEnableInIOS: { type: "boolean" },
        },
        required: ["id", "isDemoClientEnableInIOS"],
      },
    },
  },
  isDemoClientLogin: {
    schema: {
      tags: ["Whitelabel"],
      description: "isDemoClientLogin status change Whitelabel data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          isDemoClientLogin: { type: "boolean" },
        },
        required: ["id", "isDemoClientLogin"],
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
          title: { type: "string" },
          isActive: { type: "boolean" },
        },
        required: ["id", "eventName", "content", "title"],
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
 
const Venue = {
  getAll: {
    schema: {
      tags: ["Venue"],
      description: "get all venue data",
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
      tags: ["Venue"],
      security: [{ bearerAuth: [] }],
      description: "save venue data",
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          countryId: { type: "integer" },
          tpId: { type: "integer" },
          name: { type: "string" },
          avgInn1Score: { type: "integer" },
          avgInn2Score: { type: "integer" },
          avgInn3Score: { type: "integer" },
          avgInn4Score: { type: "integer" },
          highestTotalFullScore: { type: "string" },
          lowestTotalFullScore: { type: "string" },
          spinWicketsCount: { type: "integer" },
          paceWicketsCount: { type: "integer" }
        },
        required: ["id", "countryId", "name"],
      },
    },
  },

  delete: {
    schema: {
      tags: ["Venue"],
      description: "delete venue data",
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
      tags: ["Venue"],
      description: "get venue data by id",
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
      tags: ["Venue"],
      description: "active inactive venue data",
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
const PythonAPI = {
  getAll: {
    schema: {
      tags: ["PythonAPI"],
      description: "get all Python APIs data",
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
      tags: ["PythonAPI"],
      description: "get python api by id",
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
  savePythonAPI: {
    schema: {
      tags: ["PythonAPI"],
      description: "save Python API data",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          id: { type: "integer" },
          developerName: { type: "string" },
          URI: { type: "string" },
          isActive: { type: "boolean" },
          isDefault: { type: "boolean" },
        },
        required: ["id", "developerName", "URI"],
      },
    },
  },
  deletePythonAPI: {
    schema: {
      tags: ["PythonAPI"],
      description: "delete Python API data",
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
  updateIsDefault: {
    schema: {
      tags: ["PythonAPI"],
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
  ActiveInactive: {
    schema: {
      tags: ["PythonAPI"],
      description: "active inactive Python API",
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

const EntitySocket = {
  getAll: {
    schema: {
      tags: ["EntitySocket"],
      description: "get all EntitySockets",
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
      tags: ["EntitySocket"],
      description: "get EntitySocket by id",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          entitySocketId: { type: "integer" },
        },
        required: ["entitySocketId"],
      },
    },
  },
  save: {
    schema: {
      tags: ["EntitySocket"],
      description: "save EntitySocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          entitySocketId: { type: "integer" },
          serverName: { type: "string" },
          url: { type: "string" },
          isActive: { type: "boolean" },
          status: { type: "integer" },
          reconnectDelay: { type: "integer" },
          reconnectAttempts: { type: "integer" },
          reconnectMaxDelay: { type: "integer" },
          reconnectCount: { type: "integer" },
          actionType: { type: "integer" },
          isAutoUpdateCommentary: { type: "boolean" },
          isAutoScoreUpdate: { type: "boolean" },
        },
        required: ["entitySocketId", "url", "serverName"],
      },
    },
  },
  delete: {
    schema: {
      tags: ["EntitySocket"],
      description: "delete EntitySocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          entitySocketId: {
            type: "array",
            items: { type: "integer" },
            minItems: 1,
          },
        },
        required: ["entitySocketId"],
      },
    },
  },
  activeInactive: {
    schema: {
      tags: ["EntitySocket"],
      description: "active inactive EntitySocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          entitySocketId: { type: "integer" },
          isActive: { type: "boolean" },
        },
        required: ["entitySocketId", "isActive"],
      },
    },
  },
  entityAutoScoreUpdate: {
    schema: {
      tags: ["EntitySocket"],
      description: "isAutoScoreUpdate EntitySocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          entitySocketId: { type: "integer" },
          isAutoScoreUpdate: { type: "boolean" },
        },
        required: ["entitySocketId", "isAutoScoreUpdate"],
      },
    },
  },
  entityAutoUpdateCommentary: {
    schema: {
      tags: ["EntitySocket"],
      description: "isAutoUpdateCommentary EntitySocket",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          entitySocketId: { type: "integer" },
          isAutoUpdateCommentary: { type: "boolean" },
        },
        required: ["entitySocketId", "isAutoUpdateCommentary"],
      },
    },
  },
  changeActionType: {
    schema: {
      tags: ["EntitySocket"],
      description: "change action type",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          entitySocketId: {
            type: "array",
            items: { type: "integer" },
          },
          actionType: { type: "integer" },
        },
        required: ["entitySocketId", "actionType"],
      },
    },
  },
}

const TeamMatchType = {
  getbyTeamId: {
    schema: {
      tags: ["Team Match Type"],
      description: "get all Match Type of Team",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" }
        },
        required: ["teamId"]
      }
    }
  },
  save: {
    schema: {
      tags: ["Team Match Type"],
      description: "save Match Type of Team",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" },
          matchTypeId: { type: "integer" }
        },
        required: ["teamId", "matchTypeId"]
      }
    }
  },
  update: {
    schema: {
      tags: ["Team Match Type"],
      description: "update Match Type of Team",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          teamMatchTypeId: { type: "integer" }
        },
        required: ["teamMatchTypeId"]
      }
    }
  },
  activeInactive: {
    schema: {
      tags: ["Team Match Type"],
      description: "update active/inactive Match Type of Team",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          teamMatchTypeId: { type: "integer" },
          isActive: { type: "boolean" }
        },
        required: ["teamMatchTypeId", "isActive"]
      }
    }
  },
  delete: {
    schema: {
      tags: ["Team Match Type"],
      description: "delete Match Type of Team",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          teamMatchTypeId: { type: "integer" }
        },
        required: ["teamMatchTypeId"]
      }
    }
  },
  getplayers: {
    schema: {
      tags: ["Team Match Type"],
      description: "get players for Match Type of Team",
      security: [{ bearerAuth: [] }],
      body: {
        type: "object",
        properties: {
          teamId: { type: "integer" }
        },
        required: ["teamId"]
      }
    }
  }
};

module.exports = {
  Dashboard,
  Auth,
  Tabs,
  Role,
  Block,
  MenuType,
  MenuItem,
  PageFormate,
  Page,
  EventType,
  Teams,
  User,
  Config,
  Commentary,
  Event,
  Score,
  News,
  DisplayStatus,
  ClientSocket,
  Banner,
  Advertise,
  ApiEndpoints,
  Api,
  Notification,
  Template,
  Client,
  MailSettings,
  Logs,
  ThirdPartyApis,
  ClientVideo,
  SocialMedia,
  Article,
  Groups,
  PhotoLibrary,
  LibraryImages,
  VideoLibrary,
  ShotType,
  CountryCode,
  CardType,
  Packages,
  PaymentMethods,
  VaultPlan,
  Whitelabel,
  NotificationConfig,
  Venue,
  PythonAPI,
  EntitySocket,
  TeamMatchType,
};
