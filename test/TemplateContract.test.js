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

  const overrides = function (amount) {
    return { value: BigNumber.from(price).mul(amount) };
  };

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
    await contract.setOpen(true);
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
      await customContract.setOpen(true);

      const customSignerContract = await customContract.connect(signer1);

      await customSignerContract.mint(
        collectionSize,
        overrides(collectionSize)
      );

      await expect(
        customSignerContract.mint(1, overrides(1))
      ).to.be.revertedWith("Collection is full");
    });

    it("should allow minting for free when it's enabled", async function () {
      await contract.setPrice(0);
      await contract.mint(1);
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

  describe("tokenURIs", async function () {
    const testURI = "https://example.com/";
    beforeEach(async function () {
      // We need some tokens to get tokenURIs
      await contract.mint(maxMintPerTx, overrides(maxMintPerTx));
      await contract.setBaseURI(testURI);
    });
    it("get the correct URI for a given token", async function () {
      const tokenId = 1;
      console.log(await contract.tokenURI(tokenId));
      expect(await contract.tokenURI(tokenId)).to.equal(
        `${testURI}${tokenId}.json`
      );
    });
  });

  describe("Utils", async function () {
    it("should change the price", async function () {
      const newPrice = ethers.utils.parseEther("0.1");
      await contract.setPrice(newPrice);

      expect(await contract.price()).to.equal(newPrice);
    });
    it("should revert if not changing the price", async function () {
      await expect(contract.setPrice(price)).to.be.revertedWith(
        "Already set to this value"
      );
    });

    it("should change maxMintPerTx", async function () {
      const newMaxPerTx = 10;
      await contract.setMaxMintPerTx(newMaxPerTx);

      expect(await contract.maxMintPerTx()).to.equal(newMaxPerTx);
    });
    it("should revert if not changing the maxMintPerTx", async function () {
      await expect(contract.setMaxMintPerTx(maxMintPerTx)).to.be.revertedWith(
        "Already set to this value"
      );
    });

    it("should send eth to the owner wallet", async function () {
      await contract.mint(1, overrides(1));

      await expect(await contract.withdrawMoney()).to.changeEtherBalances(
        [contract, owner],
        [price.mul(-1), price]
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
