const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Lock", function () {
  async function deployLockFixture() {
    const unlockTime = Math.floor(Date.now() / 1000) + 60;
    const [owner, other] = await ethers.getSigners();
    const lock = await ethers.deployContract("Lock", [unlockTime], {
      value: ethers.parseEther("0.001"),
    });
    return { lock, unlockTime, owner, other };
  }

  it("Should set the correct unlock time", async function () {
    const { lock, unlockTime } = await deployLockFixture();
    expect(await lock.unlockTime()).to.equal(unlockTime);
  });

  it("Should revert early withdrawal", async function () {
    const { lock } = await deployLockFixture();
    await expect(lock.withdraw()).to.be.revertedWith("Too early");
  });
});
