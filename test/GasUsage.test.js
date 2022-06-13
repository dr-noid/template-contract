const { ethers } = require("hardhat");
const { deployContract, config, mint } = require("./helpers");

describe("Gas Usage", function () {
  beforeEach(async function () {
    this.contract = await deployContract();
    const [owner, addr1, ...signers] = await ethers.getSigners();
    this.owner = owner;
    this.addr1 = addr1;
    this.signers = signers;
    this.contract.setOpen(true);
  });

  context("Deploying gas usage:", async function () {
    it("Deploying gas usage:", async function () {
      for (let i = 0; i < 10; i++) {
        deployContract();
      }
    });
  });

  context("Mint one, 1000 times", async function () {
    it("Minting gas usage:", async function () {
      for (let i = 0; i < 1000; i++) {
        let minter = i % this.signers.length;
        let minterContract = this.contract.connect(this.signers[minter]);
        await mint(minterContract, 1);
      }
    });
  });

  context(`Mint ${config.maxMintPerTx}, 100 times`, async function () {
    it("Minting gas usage:", async function () {
      for (let i = 0; i < 100; i++) {
        let minter = i % this.signers.length;
        let minterContract = this.contract.connect(this.signers[minter]);
        await mint(minterContract, config.maxMintPerTx);
      }
    });
  });
});
