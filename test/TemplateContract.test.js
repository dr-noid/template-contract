const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");
const config = require("../configuration");
const { deployContract } = require("./helpers");

describe("TemplateContract", function () {
  let contract;
  let owner;
  let signer1;
  let signer2;
  let signers;

  const overrides = function (amount) {
    return { value: BigNumber.from(config.price).mul(amount) };
  };

  beforeEach(async function () {
    [owner, signer1, signer2, ...signers] = await ethers.getSigners();
    contract = await deployContract();
    await contract.setOpen(true);
  });

  describe("Deployment", function () {
    it("should set the correct state variables", async function () {
      expect(await contract.owner()).to.equal(owner.address);
      expect(await contract.name()).to.equal(config.name);
      expect(await contract.symbol()).to.equal(config.symbol);
      expect(await contract.price()).to.equal(config.price);
      expect(await contract.maxMintPerTx()).to.equal(config.maxMintPerTx);
      expect(await contract.collectionSize()).to.equal(config.collectionSize);
      expect(await contract.maxFree()).to.equal(config.maxFree);
    });
  });

  describe("Minting", function () {
    let signerContract;

    beforeEach(async function () {
      signerContract = await contract.connect(signer1);
    });

    it("First mint should be free", async function () {
      const amountToMint = BigNumber.from(1);
      await signerContract.mint(amountToMint);
    });

    it("mint from owner wallet with correct amount of eth", async function () {
      const amountToMint = BigNumber.from(3);
      await contract.mint(amountToMint, overrides(amountToMint));
      expect(await contract.balanceOf(owner.address)).to.equal(amountToMint);
    });

    it("should allow minting with enough funds", async function () {
      const amountToMint = BigNumber.from(3);
      await signerContract.mint(amountToMint, overrides(amountToMint));
      expect(await contract.balanceOf(signer1.address)).to.equal(amountToMint);
    });

    it("revert when 'free' minting with too little funds", async function () {
      const amountToMint = BigNumber.from(2);
      // Mint one token so that wallet's _totalMinted() becomes > 0
      await signerContract.mint(1, overrides(1));
      await expect(
        signerContract.mint(amountToMint, overrides(amountToMint.sub(1)))
      ).to.be.revertedWith("Sent Ether is too low");
    });

    it("shouldn't allow minting over the maxMintPerTx", async function () {
      const amountToMint = config.maxMintPerTx + 1;
      await expect(
        contract.mint(amountToMint, overrides(amountToMint))
      ).to.be.revertedWith("Quantity is too large");
    });

    /**
     * Deploy a new contract and set the maxMintPerTx to the collectionSize
     * This makes the test run much faster
     */
    it("should allow minting over the collectionSize, but not mint another token", async function () {
      const newArgs = [...config.constructorArgs]; // Copy the constructorArgs
      // Set the newArgs's maxMintPerTx to the collectionSize
      newArgs[3] = config.collectionSize;
      const customContract = await deployContract(newArgs);
      await customContract.deployed();
      await customContract.setOpen(true);

      const customSignerContract = customContract.connect(signer1);

      await customSignerContract.mint(
        config.collectionSize,
        overrides(config.collectionSize)
      );

      await expect(
        await customSignerContract.mint(1, overrides(1))
      ).to.changeEtherBalances(
        [customContract, signer1],
        [config.price.mul(1), config.price.mul(-1)]
      );
    });

    it("should allow minting for free when the price is zero", async function () {
      let amountToMint = BigNumber.from(1);
      await contract.setPrice(0);
      await contract.mint(amountToMint);
      expect(await contract.balanceOf(owner.address)).to.equal(amountToMint);
    });

    it("should let the owner wallet call the allowlistMint function", async function () {
      const amountToMint = BigNumber.from(250);
      await contract.allowlistMint(amountToMint);
      expect(await contract.balanceOf(owner.address)).to.equal(amountToMint);
    });

    it("minting less than the maxFree limit shouldn't fail", async function () {
      let amountToMint = BigNumber.from(1);
      await contract.setMaxFree(3);
      await contract.mint(amountToMint);
      expect(await contract.balanceOf(owner.address)).to.equal(amountToMint);
    });

    it("", async function () {});
  });

  describe("Transfering", function () {
    // We need atleast one token to transfer
    const amountToMint = 1;
    beforeEach(async function () {
      await contract.mint(amountToMint, overrides(amountToMint));
    });

    // Transfering is handled completely by ERC721A (it's part of the ERC-721 specification).
    it("should transfer one token to another address", async function () {
      await contract.transferFrom(owner.address, signer1.address, amountToMint);
      expect(await contract.balanceOf(signer1.address)).to.equal(amountToMint);
      expect(await contract.ownerOf(amountToMint)).to.equal(signer1.address);
    });
  });

  describe("tokenURIs", function () {
    const testURI = "https://example.com/";
    const amountToMint = 1;
    beforeEach(async function () {
      // We need some tokens to get tokenURIs
      await contract.mint(amountToMint, overrides(amountToMint));
      await contract.setBaseURI(testURI);
    });
    it("get the correct URI for a given token", async function () {
      expect(await contract.tokenURI(amountToMint)).to.equal(
        `${testURI}${amountToMint}.json`
      );
    });
  });

  describe("Utils", function () {
    it("should change the price", async function () {
      const newPrice = ethers.utils.parseEther("0.1");
      await contract.setPrice(newPrice);

      expect(await contract.price()).to.equal(newPrice);
    });
    it("should revert if not changing the price", async function () {
      await expect(contract.setPrice(config.price)).to.be.revertedWith(
        "Already set to this value"
      );
    });

    it("should change maxMintPerTx", async function () {
      const newMaxPerTx = 10;
      await contract.setMaxMintPerTx(newMaxPerTx);

      expect(await contract.maxMintPerTx()).to.equal(newMaxPerTx);
    });
    it("should revert if not changing the maxMintPerTx", async function () {
      await expect(
        contract.setMaxMintPerTx(config.maxMintPerTx)
      ).to.be.revertedWith("Already set to this value");
    });

    it("should send eth to the owner wallet", async function () {
      await contract.mint(1, overrides(1));

      await expect(await contract.withdraw()).to.changeEtherBalances(
        [contract, owner],
        [config.price.mul(-1), config.price]
      );
    });

    it("minting not allowed if closed", async function () {
      await contract.setOpen(false);
      await expect(contract.mint(1, overrides(1))).to.be.revertedWith(
        "Minting has not started yet"
      );
    });
  });
});
