import { HardhatUserConfig } from "hardhat/config";

import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";

//Generate types for contracts on compile
import "hardhat-typechain";

//Audit gas usage
/*import "hardhat-gas-reporter"

const config: HardhatUserConfig = {
  solidity: "0.7.3",
  gasReporter: {
    currency: 'USD',
    gasPrice: 192,
    enabled: (process.env.REPORT_GAS) ? true : false
  }
};
*/
const config: HardhatUserConfig = {
  solidity: "0.7.3",
  networks:{
    hardhat:{
      loggingEnabled: false
    }
  }
}

export default config;
