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
  TWO_FA_ENABLED: 140,
  TWO_FA_RESET: 141,
  NOTE_CREATED: 160,
  NOTE_UPDATED: 161,
  NOTE_DELETED: 162,
  ACCOUNT_PASSWORD_VIEWED: 170,
  PAGE_VIEWED: 171,
  LOGIN_FAILED: 180,
  ACCOUNT_LOCKED: 181,
  CLIENT_SUSPENDED: 190,
  CLIENT_REACTIVATED: 191,
  CLIENT_SELF_DELETED: 192,
  PLAN_UPGRADE_REQUESTED: 200,
  PLAN_UPGRADE_APPROVED: 201,
  PLAN_UPGRADE_REJECTED: 202,
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
  [VaultActivityCodes.TWO_FA_ENABLED]: "Two-factor authentication enabled",
  [VaultActivityCodes.TWO_FA_RESET]: "Two-factor authentication reset",
  [VaultActivityCodes.NOTE_CREATED]: "Note created",
  [VaultActivityCodes.NOTE_UPDATED]: "Note updated",
  [VaultActivityCodes.NOTE_DELETED]: "Note deleted",
  [VaultActivityCodes.ACCOUNT_PASSWORD_VIEWED]: "Account password viewed",
  [VaultActivityCodes.PAGE_VIEWED]: "Page viewed",
  [VaultActivityCodes.LOGIN_FAILED]: "Failed login attempt",
  [VaultActivityCodes.ACCOUNT_LOCKED]: "Account locked after too many failed attempts",
  [VaultActivityCodes.CLIENT_SUSPENDED]: "Account suspended",
  [VaultActivityCodes.CLIENT_REACTIVATED]: "Account reactivated",
  [VaultActivityCodes.CLIENT_SELF_DELETED]: "Account deleted",
  [VaultActivityCodes.PLAN_UPGRADE_REQUESTED]: "Plan upgrade requested",
  [VaultActivityCodes.PLAN_UPGRADE_APPROVED]: "Plan upgrade approved",
  [VaultActivityCodes.PLAN_UPGRADE_REJECTED]: "Plan upgrade rejected",
};

const VaultEntryType = {
  ACCOUNT: 1,
  GROUP: 2,
  NOTE: 3,
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

// Accounts (and their Groups) live in one Drive file, Notes in a separate
// one -- see utilities/googleDrive.js's VAULT_FILE_NAMES. Derived from
// entryType server-side (never trusted from the client) so an entry can
// never be written into the wrong file.
const VaultFileKind = {
  ACCOUNTS: "accounts",
  NOTES: "notes",
};

const VAULT_FILE_KIND_BY_ENTRY_TYPE = {
  [VaultEntryType.ACCOUNT]: VaultFileKind.ACCOUNTS,
  [VaultEntryType.GROUP]: VaultFileKind.ACCOUNTS,
  [VaultEntryType.NOTE]: VaultFileKind.NOTES,
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
  [VaultEntryType.NOTE]: {
    [VaultChangeType.CREATE]: VaultActivityCodes.NOTE_CREATED,
    [VaultChangeType.UPDATE]: VaultActivityCodes.NOTE_UPDATED,
    [VaultChangeType.DELETE]: VaultActivityCodes.NOTE_DELETED,
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
  VaultFileKind,
  VAULT_FILE_KIND_BY_ENTRY_TYPE,
  getVaultEntryActivityCode,
};
