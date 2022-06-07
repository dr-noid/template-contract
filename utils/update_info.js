// import fs from "fs";
const fs = require("fs");
const config = require("../configuration");
const glob = require("glob");

const contractDefinition = "contract ";
const newContractDefinition = `contract ${config.contractName}`;

glob("contracts/**/*.sol", null, function (err, files) {
  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf8");
    updatedContent = content.replace(
      new RegExp(`${contractDefinition}`),
      `${newContractDefinition}`
    );

    fs.writeFileSync(file, updatedContent);
  });
  console.log(files);
});
