import { ethers } from "hardhat";
import { Contract, Signer, Wallet } from "ethers";
import { expect } from "chai";

import { Stamina, Stamina__factory } from '../typechain';
import { Address } from "cluster";

describe('Stamina Basics', ()=>{
  let StaminaInstance: Stamina;  
  let owner: Signer;

  beforeEach( async () => {
    const signers = await ethers.getSigners();
    owner = signers[0]
    const StaminaFactory = (await ethers.getContractFactory("Stamina", owner)) as Stamina__factory;
    StaminaInstance = (await StaminaFactory.deploy()) as Stamina;
    await StaminaInstance.deployed();
  });

  it('The deployer is the owner', async () => {
    const result = await StaminaInstance.owner();
    const ownerAddress = await owner.getAddress()
    expect(result).to.equal(ownerAddress);
  });

})