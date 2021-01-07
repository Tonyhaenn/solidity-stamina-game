//ts complains but still compiles. https://github.com/nomiclabs/hardhat/issues/1137
import { ethers } from "hardhat"; 

import { Signer } from "ethers";
import { expect } from "chai";
import { Stamina, Stamina__factory } from '../typechain';

describe('Stamina Basics', () => {
  let StaminaInstance: Stamina;  
  let snapshotId: string;  
  let owner: Signer;
  let signers: Signer[];
  const roundLength = 14;

  before( async () => {
    signers = await ethers.getSigners();
    owner = signers[0]  
    const StaminaFactory = (await ethers.getContractFactory("Stamina", owner)) as Stamina__factory;
    StaminaInstance = (await StaminaFactory.deploy()) as Stamina;
    await StaminaInstance.deployed();
  });

  beforeEach( async ()=>{
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  })

  afterEach( async ()=>{
    await ethers.provider.send('evm_revert', [snapshotId])
  })

  it('The deployer is the owner', async () => {
    const result = await StaminaInstance.owner();
    const ownerAddress = await owner.getAddress()
    expect(result).to.equal(ownerAddress);
  });

  it('The round length is ' + roundLength, async ()=>{
    const expected = roundLength * 24 * 60 * 60;
    const result = await StaminaInstance.roundLength();
    expect(+result).to.equal(expected);
  });
  
  it('A round ends after the round length', async ()=>{
    const r1 = await StaminaInstance.activeRound();
    const stake = ethers.utils.parseEther("10");
    const advanceTimeSeconds = (roundLength * 24 * 60 * 60) + 1;
    const currentBlockNum = await ethers.provider.getBlockNumber();
    const currentBlockTime = await (await ethers.provider.getBlock(currentBlockNum)).timestamp;

    const newBlockTime = currentBlockTime + advanceTimeSeconds;
    await ethers.provider.send('evm_setNextBlockTimestamp', [newBlockTime]);
    
    await StaminaInstance.stake({value:stake});

    const result = await StaminaInstance.activeRound();
    const expected = r1.toNumber() + 1;
    expect(result.toNumber()).to.equal(expected);
  });
  
  it('A player can stake', async ()=>{
    const stake = ethers.utils.parseEther("1");
    await StaminaInstance.stake({value: stake});
    
    const address = await signers[0].getAddress();
    const result = await StaminaInstance.roundPlayerStakeStorage(1, address, 1);
    const resultAmount = result.amount.toString();
    expect(resultAmount).to.equal(stake);
  });
})