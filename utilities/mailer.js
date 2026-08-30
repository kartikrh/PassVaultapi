const nodemailer = require("nodemailer");
const { decrypt } = require("./index");

const buildMailTransporter = (settings, decryptedPassword) => {
  if (settings.mailType === 1) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: settings.email,
        pass: decryptedPassword,
      },
    });
  }
  return nodemailer.createTransport({
    host: settings.smtpAddress,
    port: Number(settings.portNumber),
    secure: Boolean(settings.isEnableSSL),
    auth: {
      user: settings.userName || settings.email,
      pass: decryptedPassword,
    },
  });
};

const getDefaultMailSettings = () => {
  const settings = (global.tblMailSettings || []).find((item) => item.isDefault && item.isActive);
  if (!settings) {
    throw new Error("No default mail settings configured");
  }
  return settings;
};

const getMailSettingsById = (id) => {
  if (!id) return null;
  return (global.tblMailSettings || []).find((item) => item.id == id && item.isActive) || null;
};

// Sends through the given mailSettingId (a White Label's assigned Mail
// Setting) when one is passed and still active, otherwise falls back to
// whichever Mail Settings row is marked default+active.
const sendMail = async ({ to, subject, text, html, mailSettingId }) => {
  const settings = getMailSettingsById(mailSettingId) || getDefaultMailSettings();
  const decryptedPassword = await decrypt(settings.password);
  const transporter = buildMailTransporter(settings, decryptedPassword);
  await transporter.sendMail({ from: settings.email, to, subject, text, html });
};

module.exports = { buildMailTransporter, getDefaultMailSettings, getMailSettingsById, sendMail };
