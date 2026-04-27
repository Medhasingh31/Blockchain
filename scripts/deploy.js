const { ethers } = require("hardhat");

async function main() {
  const unlockTime = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now
  const lockedAmount = ethers.parseEther("0.001");

  const lock = await ethers.deployContract("Lock", [unlockTime], { value: lockedAmount });
  await lock.waitForDeployment();

  console.log(`Lock deployed to: ${await lock.getAddress()}`);
  console.log(`Unlock time: ${new Date(unlockTime * 1000).toISOString()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
