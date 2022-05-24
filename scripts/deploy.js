const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

async function main() {
  const name = "TemplateContract";
  const symbol = "TC";
  const price = BigNumber.from("80000000000000000");
  const maxMintPerTx = 10;
  const collectionSize = 2000;

  const TemplateContract = await ethers.getContractFactory(name);
  const contract = await TemplateContract.deploy(
    name,
    symbol,
    price,
    maxMintPerTx,
    collectionSize
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
