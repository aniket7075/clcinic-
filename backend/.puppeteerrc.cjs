const {join} = require('path');

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // Changes the cache location for Puppeteer so it's stored inside node_modules
  // This ensures DigitalOcean / Heroku doesn't delete it after the build phase!
  cacheDirectory: join(__dirname, 'node_modules', '.puppeteer_cache'),
};
