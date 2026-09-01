// Shared 2FA method enum for both auth systems -- WeOTPType on "tblUsers"
// (sql/008_user_otp.sql) and "tblClient" (sql/vault/005_client_otp.sql).
// Keys can't start with a digit (invalid JS identifier), hence
// GOOGLE_AUTHENTICATOR rather than "2FAGoogle" -- the numeric value stored
// in the DB is still 1.
const OTPType = {
  GOOGLE_AUTHENTICATOR: 1,
  MAIL: 2,
};

module.exports = { OTPType };
