const { BigNumber } = require("ethers");
require("dotenv").config({ path: "options" });

env = process.env;

const contractName = `${env.contractName}`;
const name = `${env.name}`;
const symbol = `${env.symbol}`;
const price = BigNumber.from(`${env.price}`);
const maxMintPerTx = BigNumber.from(`${env.maxMintPerTx}`);
const collectionSize = BigNumber.from(`${env.collectionSize}`);
const maxFree = BigNumber.from(`${env.maxFree}`);

module.exports = {
  contractName: contractName,
  name: name,
  symbol: symbol,
  price: price,
  maxMintPerTx: maxMintPerTx,
  collectionSize: collectionSize,
  maxFree: maxFree,
  constructorArgs: [name, symbol, price, maxMintPerTx, collectionSize, maxFree],
};
