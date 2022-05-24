const { BigNumber } = require("ethers");

const name = "TemplateContract";
const symbol = "TC";
const price = BigNumber.from("80000000000000000");
const maxMintPerTx = 10;
const collectionSize = 2000;

module.exports = [name, symbol, price, maxMintPerTx, collectionSize];
