const momentTimezone = require('moment-timezone');

const getCurrentDateTime = () => {
  return momentTimezone().tz('Asia/Kolkata').format('DD-MM-YYYY hh:mm:ss A');
};

module.exports = { getCurrentDateTime };