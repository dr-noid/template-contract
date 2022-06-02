const { ethers } = require("hardhat");
const config = require("../configuration");

async function main() {
  const Contract = await ethers.getContractFactory(config.contractName);
  const contract = await Contract.deploy(...config.constructorArgs);
  await contract.deployed();

  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
