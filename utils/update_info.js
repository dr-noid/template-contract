// import fs from "fs";
const fs = require("fs");
const config = require("../configuration");
const glob = require("glob");
const dependencies = require("../utils/check_dependencies_initialized");

if (!dependencies.installed()) {
  console.log("Please run `npm install` first.");
  process.exit(1);
}

const contractDefinition = "contract (.*) is";
const newContractDefinition = `contract ${config.contractName} is`;

glob("contracts/**/*.sol", null, function (err, files) {
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    updatedContent = content.replace(
      new RegExp(`${contractDefinition}`),
      `${newContractDefinition}`
    );

    fs.writeFileSync(file, updatedContent);

    fs.renameSync(file, `contracts/${config.contractName}.sol`);
  });
});
