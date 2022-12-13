const path = require("path");

module.exports = async ({ config, mode }) => {
  config.module.rules.push({
    test: /\.mjs$/,
    include: /node_modules/,
    type: "javascript/auto",
  });

  config.resolve.modules = [
    path.resolve(__dirname, "..", "src"),
    "node_modules",
  ]
  
  return config;
};
