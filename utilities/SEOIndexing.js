const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");

const sitemapPath = path.join(__dirname, "..", "public", "sitemap.xml");

async function handleSitemapUpdate(newUrl) {
  try {
    const existingSitemapXml = fs.existsSync(sitemapPath)
      ? fs.readFileSync(sitemapPath, "utf8")
      : "";

    const existingUrls = [];

    if (existingSitemapXml) {
      const locMatches = existingSitemapXml.match(/<loc>(.*?)<\/loc>/g);
      if (locMatches) {
        locMatches.forEach((locTag) => {
          const url = locTag.replace("<loc>", "").replace("</loc>", "");
          existingUrls.push(url);
        });
      }
    }
    
    const siteUrl = global.tblClientSocket[0].url;

    const fullUrl = `${siteUrl}${newUrl}`;

    if (existingUrls.includes(fullUrl)) {
      return { success: false, message: "URL already exists in sitemap" };
    }

    const sitemap = new SitemapStream({ hostname: `${siteUrl}/` });
    if (existingUrls.length > 0) {
      existingUrls.forEach((url) => {
        sitemap.write({ url, changefreq: "daily", priority: 1.0 });
      });
    }

    sitemap.write({ url: newUrl, changefreq: "daily", priority: 1.0 });
    sitemap.end();

    const xmlString = await streamToPromise(sitemap).then((data) =>
      data.toString()
    );

    fs.writeFileSync(sitemapPath, xmlString, "utf8");

    return { success: true, message: "URL added successfully" };
  } catch (error) {
    console.log("SEO Indexing error", error);
  }
}

module.exports = {
  handleSitemapUpdate,
};
