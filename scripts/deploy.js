const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const config = require("./configuration");

async function main() {
  const TemplateContract = await ethers.getContractFactory(name);
  const contract = await TemplateContract.deploy(
    config.name,
    config.symbol,
    config.price,
    config.maxMintPerTx,
    config.collectionSize
  );
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
