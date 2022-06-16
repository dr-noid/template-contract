const fs = require("fs");

const installed = () => {
  return fs.existsSync("./node_modules");
};

module.exports = { installed };
