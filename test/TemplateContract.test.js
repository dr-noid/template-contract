const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

describe("TemplateContract", async function () {
  let Contract;
  let contract;
  let owner;
  let signer1;
  let signers;
  let signer2;

  const name = "TemplateContract";
  const symbol = "TC";
  const price = BigNumber.from("80000000000000000");
  const maxMintPerTx = 10;
  const collectionSize = 2000;

  beforeEach(async function () {
    Contract = await ethers.getContractFactory(name);
    [owner, signer1, signer2, ...signers] = await ethers.getSigners();
    contract = await Contract.deploy(
      name,
      symbol,
      price,
      maxMintPerTx,
      collectionSize
    );
    await contract.deployed();
  });

  describe("Deployment", async function () {
    it("should set the correct state variables", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.name()).to.equal(name);
      expect(await contract.symbol()).to.equal(symbol);
      expect(await contract.price()).to.equal(price);
      expect(await contract.maxMintPerTx()).to.equal(maxMintPerTx);
      expect(await contract.collectionSize()).to.equal(collectionSize);
    });
  });

  describe("Minting", async function () {
    it("mint from owner wallet", async function () {
      const amountToMint = BigNumber.from(3);
      await contract.mint(amountToMint);
      expect(await contract.balanceOf(owner.address)).to.equal(amountToMint);
    });

    it("mint from different address", async function () {
      const amountToMint = BigNumber.from(3);
      const newContract = await contract.connect(signer1);
      await newContract.mint(amountToMint);
      expect(await contract.balanceOf(signer1.address)).to.equal(amountToMint);
    });

    it("shouldn't allow minting over the maxMintPerTx", async function () {
      let amountToMint = maxMintPerTx + 1;

      await expect(contract.mint(amountToMint)).to.be.revertedWith(
        "Quantity is too large"
      );
    });
  });

  describe("Transfering", async function () {
    // We need atleast one token to transfer
    const tokenId = 1;
    beforeEach(async function () {
      await contract.mint(tokenId);
    });

    // Transfering is handled almost completely by the ERC721A contract.
    it("should transfer one token to another address", async function () {
      await contract.transfer(signer1.address, tokenId);
      expect(await contract.balanceOf(signer1.address)).to.equal(1);
      expect(await contract.ownerOf(tokenId)).to.equal(signer1.address);
    });
  });

  describe("Utils", async function () {
    it("should change the value correctly", async function () {
      expect(await contract.free()).to.equal(false);
      await contract.setFree(true);
      expect(await contract.free()).to.equal(true);
    });

    it("should not change if a non-owner tries seeing the value", async function () {
      newContract = await contract.connect(signer1);
      await expect(newContract.setFree()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("should revert if not changing the value", async function () {
      await expect(contract.setFree(false)).to.be.revertedWith(
        "Already set to this value"
      );
    });
  });
});
