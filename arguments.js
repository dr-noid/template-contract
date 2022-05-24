const config = require("./configuration");

module.exports = [
  config.name,
  config.symbol,
  config.price,
  config.maxMintPerTx,
  config.collectionSize,
];
