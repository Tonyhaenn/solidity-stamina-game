import { HardhatUserConfig } from "hardhat/config";

import "@nomiclabs/hardhat-waffle";
import 'hardhat-deploy';
import '@nomiclabs/hardhat-ethers';


//Generate types for contracts on compile
import '@typechain/hardhat'

//Audit gas usage
import "hardhat-gas-reporter"

const config: HardhatUserConfig = {
  solidity: {
    version: "0.7.3",
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
  },
  namedAccounts: {
    deployer: 0
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
