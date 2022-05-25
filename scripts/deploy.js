const { ethers } = require("hardhat");
const config = require("../configuration");

async function main() {
  const TemplateContract = await ethers.getContractFactory(config.contractName);
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
