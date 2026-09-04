// Sends the admin-configured email templates (PassVaultpanel's Template
// screen, templateModel.Email rows) for the vault client's own automated
// emails -- registration welcome, sign-in alert, 2FA reset (see
// services/vaultAuth.js). Templates are read straight from the same
// global.tblTemplate cache the admin Template screen itself uses (see
// services/template.js / utilities/fetchAllData.js), never re-queried here.
const { templateModel } = require("./index");
const { sendMail } = require("./mailer");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Vars carrying trusted, server-built HTML (the White Label header block
// from buildLogoHtml, and the Google Maps link from vaultAuth.js's
// formatLocation) rather than plain user/request data -- named explicitly
// so a template's own {{...}} placeholders can never opt themselves into
// skipping escaping.
const RAW_HTML_VARS = new Set(["logoHtml", "location"]);

// {{name}}, {{ip}}, ... in a template's title/description, filled in from
// `vars`. Left untouched if a var is missing, so a typo'd placeholder is
// visible in the sent email rather than silently vanishing. `escape: true`
// (used for the HTML body, not the plain-text subject) HTML-escapes every
// substituted value except RAW_HTML_VARS -- template bodies are real HTML
// now, and `name` in particular is a user-supplied registration field.
const renderTemplate = (str, vars, { escape = false } = {}) => {
  return (str || "").replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(vars, key) || vars[key] == null) return match;
    const value = vars[key];
    return escape && !RAW_HTML_VARS.has(key) ? escapeHtml(value) : String(value);
  });
};

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

// Prefers the row marked Default among active templates for this type (same
// "one default per templateType+type" rule the admin screen enforces via
// setIsDefaultFalseTemplateQuery), otherwise falls back to any other active
// row so a template still sends even before an admin picks a default.
const findEmailTemplate = (type) => {
  const active = (global.tblTemplate || []).filter(
    (item) => item.templateType == templateModel.Email && item.type == type && item.isActive
  );
  return active.find((item) => item.isDefault) || active[0] || null;
};

const getWhitelabel = (whitelabelId) => {
  const list = global.tblWhitelabels || [];
  return (whitelabelId && list.find((item) => item.id == whitelabelId)) || list.find((item) => item.isDefault) || null;
};

// Per-White-Label email header: the domain's own logo when one is uploaded
// (PassVaultpanel's White Label screen), otherwise a text wordmark of its
// domain -- same image-or-wordmark fallback as passvault-client's own
// BrandLogo.js, so the signed-in app and its emails always brand a given
// domain the same way. Returned as ready-to-insert HTML (see RAW_HTML_VARS
// above) since callers just drop it into a template's {{logoHtml}}.
const buildLogoHtml = (whitelabelId) => {
  const whitelabel = getWhitelabel(whitelabelId);
  const brandName = escapeHtml(whitelabel?.domain || "PassVault");
  if (whitelabel?.logo) {
    return `<img src="${escapeHtml(whitelabel.logo)}" alt="${brandName}" width="140" style="display:block;margin:0 auto;border:0;outline:none;text-decoration:none;height:auto;max-height:48px;" />`;
  }
  return `<span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.5px;">${brandName}</span>`;
};

// Returns true if an admin-configured template was found and sent, false if
// no active template exists yet for this type -- callers decide whether that
// is fine to skip (e.g. the sign-in alert) or needs a hardcoded fallback
// (e.g. the registration email, which also carries the verify-email link).
const sendTemplateMail = async ({ type, to, mailSettingId, vars = {} }) => {
  const template = findEmailTemplate(type);
  if (!template) return false;

  const subject = renderTemplate(template.title, vars) || "PassVault";
  const html = renderTemplate(template.description, vars, { escape: true });

  await sendMail({ to, subject, html, text: stripHtml(html), mailSettingId });
  return true;
};

module.exports = { sendTemplateMail, findEmailTemplate, renderTemplate, buildLogoHtml };
