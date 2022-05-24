const { BigNumber } = require("ethers");
require("dotenv").config({ path: "options" });

env = process.env;

const contractName = `${env.contractName}`;
const name = `${env.name}`;
const symbol = `${env.symbol}`;
const price = BigNumber.from(`${env.price}`);
const maxMintPerTx = `${env.maxMintPerTx}`;
const collectionSize = `${env.collectionSize}`;

module.exports = {
  contractName: contractName,
  name: name,
  symbol: symbol,
  price: price,
  maxMintPerTx: maxMintPerTx,
  collectionSize: collectionSize,
};
