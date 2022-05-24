const { BigNumber } = require("ethers");

const options = {
  sigint: true,
};

const prompt = require("prompt-sync")(options);

const contractName = prompt("Contract name >");
const tokenName = prompt("Token name >");
const symbol = prompt("Token symbol >");
const price = prompt("Contract name >");
const maxMintPerTx = prompt("Max allowed mint per transaction >");
const collectionSize = prompt("Collection size >");
