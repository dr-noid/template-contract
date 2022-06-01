const { deployContract, config, mint } = require("./helpers");

describe("Gas Usage Tests", async function () {
  let contract;
  let owner;
  let signer1;
  let signer2;
  let signers;

  context("Deploying gas usage:", async function () {
    it("Deploying gas usage:", async function () {
      for (let i = 0; i < 10; i++) {
        deployContract();
      }
    });
  });

  context("Mint one, 1000 times", async function () {
    before(async function () {
      this.contract = await deployContract();
      this.contract.setOpen(true);
      [, ...signers] = await ethers.getSigners();
      this.signers = signers;
    });
    it("Minting gas usage:", async function () {
      for (let i = 0; i < 1000; i++) {
        let minter = i % this.signers.length;
        let minterContract = await this.contract.connect(this.signers[minter]);
        await mint(minterContract, 1);
      }
    });
  });

  context(`Mint ${maxMintPerTx}, 100 times`, async function () {
    before(async function () {
      this.contract = await deployContract();
      [, ...signers] = await ethers.getSigners();
      this.signers = signers;
    });
    it("Minting gas usage:", async function () {
      for (let i = 0; i < 100; i++) {
        let minter = i % this.signers.length;
        let minterContract = await this.contract.connect(this.signers[minter]);
        await mint(minterContract, config.maxMintPerTx);
      }
    });
  });
});
