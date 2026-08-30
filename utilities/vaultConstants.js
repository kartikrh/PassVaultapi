const VaultActivityCodes = {
  CLIENT_REGISTERED: 101,
  CLIENT_LOGGED_IN: 102,
  EMAIL_VERIFICATION_SENT: 103,
  EMAIL_VERIFIED: 104,
  PASSWORD_SET: 105,
  PASSWORD_RESET_REQUESTED: 106,
  PASSWORD_RESET_COMPLETED: 107,
  PASSWORD_CHANGED: 108,
  PROFILE_UPDATED: 109,
  ACCOUNT_CREATED: 110,
  ACCOUNT_UPDATED: 111,
  ACCOUNT_DELETED: 112,
  GROUP_CREATED: 120,
  GROUP_UPDATED: 121,
  GROUP_DELETED: 122,
  VAULT_KEY_RECOVERED: 130,
  VAULT_KEY_ROTATED: 131,
};

// Shared between the client-facing "Recent activity" list
// (services/vaultActivity.js) and the staff-facing History & audit log
// (services/adminVaultHistory.js) -- one label set for both readers of
// tblActivityLogs.wrActivityType.
const ACTIVITY_LABELS = {
  [VaultActivityCodes.CLIENT_REGISTERED]: "Account registered",
  [VaultActivityCodes.CLIENT_LOGGED_IN]: "Logged in",
  [VaultActivityCodes.EMAIL_VERIFICATION_SENT]: "Verification email sent",
  [VaultActivityCodes.EMAIL_VERIFIED]: "Email verified",
  [VaultActivityCodes.PASSWORD_SET]: "Password set",
  [VaultActivityCodes.PASSWORD_RESET_REQUESTED]: "Password reset requested",
  [VaultActivityCodes.PASSWORD_RESET_COMPLETED]: "Password reset completed",
  [VaultActivityCodes.PASSWORD_CHANGED]: "Password changed",
  [VaultActivityCodes.PROFILE_UPDATED]: "Profile updated",
  [VaultActivityCodes.ACCOUNT_CREATED]: "Account created",
  [VaultActivityCodes.ACCOUNT_UPDATED]: "Account updated",
  [VaultActivityCodes.ACCOUNT_DELETED]: "Account deleted",
  [VaultActivityCodes.GROUP_CREATED]: "Group created",
  [VaultActivityCodes.GROUP_UPDATED]: "Group updated",
  [VaultActivityCodes.GROUP_DELETED]: "Group deleted",
  [VaultActivityCodes.VAULT_KEY_RECOVERED]: "Vault key recovered",
  [VaultActivityCodes.VAULT_KEY_ROTATED]: "Vault key rotated",
};

const VaultEntryType = {
  ACCOUNT: 1,
  GROUP: 2,
};

const VaultClientProvider = {
  GOOGLE: 1,
  EMAIL: 2,
};

const VaultChangeType = {
  CREATE: "create",
  UPDATE: "update",
  DELETE: "delete",
};

const VAULT_ENTRY_ACTIVITY_CODE_MAP = {
  [VaultEntryType.ACCOUNT]: {
    [VaultChangeType.CREATE]: VaultActivityCodes.ACCOUNT_CREATED,
    [VaultChangeType.UPDATE]: VaultActivityCodes.ACCOUNT_UPDATED,
    [VaultChangeType.DELETE]: VaultActivityCodes.ACCOUNT_DELETED,
  },
  [VaultEntryType.GROUP]: {
    [VaultChangeType.CREATE]: VaultActivityCodes.GROUP_CREATED,
    [VaultChangeType.UPDATE]: VaultActivityCodes.GROUP_UPDATED,
    [VaultChangeType.DELETE]: VaultActivityCodes.GROUP_DELETED,
  },
};

const getVaultEntryActivityCode = (entryType, changeType) => {
  const code = VAULT_ENTRY_ACTIVITY_CODE_MAP[entryType]?.[changeType];
  if (!code) {
    throw new Error("Invalid entryType/changeType combination");
  }
  return code;
};

module.exports = {
  VaultActivityCodes,
  ACTIVITY_LABELS,
  VaultEntryType,
  VaultClientProvider,
  VaultChangeType,
  getVaultEntryActivityCode,
};
