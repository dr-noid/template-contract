const { ethers } = require("ethers");
require("dotenv").config();
const { execSync } = require("child_process");

async function main() {
  let mainnet = false;
  const limit = Number(process.argv[2]);
  const network = process.argv[3];
  mainnet = network === "mainnet";

  if (isNaN(limit)) {
    console.error("Invalid limit");
    process.exit(1);
  }
  console.log(`Waiting for gas to hit ${limit} gwei...`);
  console.log(`deploy on mainnet: ${mainnet}`);

  const provider = ethers.getDefaultProvider("mainnet", {
    alchemy: process.env.ALCHEMY_API_KEY,
    etherscan: process.env.ETHERSCAN_API_KEY,
  });

  async function getGasInGwei() {
    return ethers.utils.formatUnits(await provider.getGasPrice(), "gwei");
  }

  await new Promise((resolve, reject) => {
    provider.on("block", () => {
      checkGas();
    });
  });

  function deploy() {
    console.log("deploying now: ");
    if (mainnet) {
      execSync("npm run deploy");
    } else {
      execSync("npm run testdeploy");
    }
  }

  async function checkGas() {
    let gas = await getGasInGwei();
    console.log(gas);
    if (gas < limit) {
      try {
        deploy();
      } finally {
        process.exit(1);
      }
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
