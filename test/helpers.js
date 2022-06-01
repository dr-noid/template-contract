const config = require("../configuration");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

const mint = async function (contract, amount) {
  const overrides = function (amount) {
    return { value: BigNumber.from(config.price).mul(amount) };
  };
  await contract.mint(amount, overrides(amount));
};

const deployContract = async function (constructorArgs) {
  const factory = await ethers.getContractFactory(config.contractName);
  let contract = await factory.deploy(
    ...(constructorArgs || config.constructorArgs || [])
  );
  await contract.deployed();
  return contract;
};

module.exports = { deployContract, mint, config };
