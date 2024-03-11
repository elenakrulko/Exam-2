const { defineConfig } = require("cypress");
const {faker} = require("@faker-js/faker");

module.exports = defineConfig({
  viewportHeight: 1080,
  viewportWidth: 1920,
  watchForFileChanges: false,
  e2e: {
    baseUrl: 'http://localhost:3000/',
    setupNodeEvents(on, config) {
    },
  },
});
