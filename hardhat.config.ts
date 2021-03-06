import { HardhatUserConfig } from "hardhat/config";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

//Generate types for contracts on compile
import "hardhat-typechain";

//Audit gas usage
import "hardhat-gas-reporter"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.2",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 210,
    enabled: (process.env.REPORT_GAS) ? true : false
  }
};
/*
const config: HardhatUserConfig = {
  solidity: {
    version: "0.7.6"
  }
}
*/
export default config;
