const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const config = require("../configuration");

describe("TemplateContract", async function () {
  let Contract;
  let contract;
  let owner;
  let signer1;
  let signer2;
  let signers;

  const contractName = config.contractName;
  const name = config.name;
  const symbol = config.symbol;
  const price = config.price;
  const maxMintPerTx = config.maxMintPerTx;
  const collectionSize = config.collectionSize;

  beforeEach(async function () {
    Contract = await ethers.getContractFactory(contractName);
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
    let signerContract;

    const overrides = function (amount) {
      return { value: BigNumber.from(price).mul(amount) };
    };

    beforeEach(async function () {
      signerContract = await contract.connect(signer1);
    });

    it("mint from owner wallet with correct amount of eth", async function () {
      const amountToMint = BigNumber.from(3);
      await contract.mint(amountToMint, overrides(amountToMint));
      expect(await contract.balanceOf(owner.address)).to.equal(amountToMint);
    });

    it("mint with correct amount of eth", async function () {
      const amountToMint = BigNumber.from(3);
      await signerContract.mint(amountToMint, overrides(amountToMint));
      expect(await contract.balanceOf(signer1.address)).to.equal(amountToMint);
    });

    it("revert when minting with too little eth", async function () {
      const amountToMint = BigNumber.from(2);
      await expect(
        signerContract.mint(amountToMint, overrides(amountToMint.sub(1)))
      ).to.be.revertedWith("Sent Ether is too low");
    });

    it("shouldn't allow minting over the maxMintPerTx", async function () {
      const amountToMint = maxMintPerTx + 1;
      await expect(
        contract.mint(amountToMint, overrides(amountToMint))
      ).to.be.revertedWith("Quantity is too large");
    });

    it("shouldn't allow minting over the collectionSize", async function () {
      // We deploy the contract again but this time the maxMintPerTx
      // is set to the collectionSize so the test runs faster
      const customContract = await Contract.deploy(
        name,
        symbol,
        price,
        collectionSize,
        collectionSize
      );
      await customContract.deployed();

      const customSignerContract = await customContract.connect(signer1);

      await customSignerContract.mint(
        collectionSize,
        overrides(collectionSize)
      );

      await expect(
        customSignerContract.mint(1, overrides(1))
      ).to.be.revertedWith("Collection is full");
    });
  });

  describe("Transfering", async function () {
    // We need atleast one token to transfer
    const tokenId = 1;
    beforeEach(async function () {
      await contract.mint(tokenId, { value: price });
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

    it("should revert if not changing the value", async function () {
      await expect(contract.setFree(false)).to.be.revertedWith(
        "Already set to this value"
      );
    });
  });
});
