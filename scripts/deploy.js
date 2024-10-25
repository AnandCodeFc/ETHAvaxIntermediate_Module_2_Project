const hre = require("hardhat");

async function main() {
  const Assessment = await hre.ethers.getContractFactory("DeBountyManager");
  const assessment = await Assessment.deploy();
  
  await assessment.deployed();
  console.log(`Contract deployed to address: ${assessment.address}`);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
