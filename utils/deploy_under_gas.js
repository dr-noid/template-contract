const { ethers } = require("ethers");
require("dotenv").config();
const { execSync } = require("child_process");
const { prompt } = require("inquirer");

const provider = ethers.getDefaultProvider("mainnet", {
  alchemy: process.env.ALCHEMY_API_KEY,
  etherscan: process.env.ETHERSCAN_API_KEY,
});

const questions = [
  {
    type: "confirm",
    name: "mainnet",
    default: false,
    message: "Deploy to mainnet?",
  },
  {
    type: "input",
    name: "gasLimit",
    default: 20,
    message: "Enter a gas limit:",
  },
];

var mainnet;
var gasLimit;

const updateConsole = (gas) => {
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`gas: ${gas}`);
};

async function getGasInGwei() {
  return ethers.utils.formatUnits(await provider.getGasPrice(), "gwei");
}

async function checkGas() {
  let gas = await getGasInGwei();
  updateConsole(gas);
  if (gas < limit) {
    try {
      console.log("");
      deploy();
    } finally {
      process.exit(1);
    }
  }
}

function deploy() {
  const npmScript = mainnet ? "npm run deploy" : "npm run testdeploy";
  console.log(`deploying now: ${npmScript}`);
  execSync(npmScript, { stdio: "inherit" });
}

async function main() {
  limit = Number(gasLimit);
  if (isNaN(limit)) {
    console.error("Invalid limit");
    process.exit(1);
  }
  console.log(`Waiting for gas to hit ${limit} gwei...`);
  console.log(`deploy on mainnet: ${mainnet}`);

  await new Promise((resolve, reject) => {
    provider.on("block", () => {
      checkGas();
    });
  });
}

const startPrompt = () => {
  prompt(questions)
    .then((answers) => {
      console.log(answers);
      mainnet = answers.mainnet;
      gasLimit = answers.gasLimit;
      main();
    })
    .catch((error) => {
      console.log(error);
    });
};

startPrompt();
