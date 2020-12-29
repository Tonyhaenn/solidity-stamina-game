/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import { task } from 'hardhat/config';
import "@nomiclabs/hardhat-waffle";

//Generate types for contracts on compile
//import "hardhat-typechain";
//Audit gas usage
import "hardhat-gas-reporter"

task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

export default {
  solidity: "0.7.3",
  gasReporter: {
    currency: 'USD',
    gasPrice: 192,
    enabled: (process.env.REPORT_GAS) ? true : false
  }
};
