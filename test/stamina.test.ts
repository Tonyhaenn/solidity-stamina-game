import { ethers } from "hardhat"; 

import { Signer } from "ethers";
import { expect } from "chai";

 import { Stamina, Stamina__factory } from '../typechain';


const advanceTimeAndBlock = async ( time: number )=>{
  const currentBlockNum = await ethers.provider.getBlockNumber();
  const currentBlockTime = await (await ethers.provider.getBlock(currentBlockNum)).timestamp;

  const newBlockTime = currentBlockTime + time;
  await ethers.provider.send('evm_setNextBlockTimestamp', [newBlockTime]);
};

describe('Stamina Contract', () => { 
  let snapshotId: string;  
  let owner: Signer;
  let signers: Signer[];
  
  let StaminaInstance: Stamina;

  const roundLength = 14;

  before( async () => {
    signers = await ethers.getSigners();
    owner = signers[0]; 
    const StaminaFactory = (await ethers.getContractFactory("Stamina", owner)) as Stamina__factory;
    
    StaminaInstance = (await StaminaFactory.deploy()) as Stamina;
    
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
    
    await advanceTimeAndBlock((14 * 24 * 60 * 60 )+1);
    
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
  /*
  it('Stake event emitted when player stakes', async () =>{
    const stake =ethers.utils.parseEther("1");
    expect(
      await StaminaInstance.stake({value: stake})
    ).to.emit(
      StaminaInstance, 'StakeEvent'
    );
  })
  */
  it('Three sequential stakes have a round total of all the stakes', async () => {
    const stake1 = ethers.utils.parseEther("1");
    const stake2 = ethers.utils.parseEther("1");
    const stake3 = ethers.utils.parseEther("1");

    const account1 = signers[1];
    const address = await account1.getAddress();
    
    await StaminaInstance.connect(account1).stake({value: stake1})
    await advanceTimeAndBlock(( 24 * 60 * 60 )+1);

    await StaminaInstance.connect(account1).stake({value: stake2})
    await advanceTimeAndBlock(( 24 * 60 * 60 )+1);

    await StaminaInstance.connect(account1).stake({value: stake3})
    await advanceTimeAndBlock(( 24 * 60 * 60 )+1);

    const result = await StaminaInstance.roundPlayerStakeStorage(1, address, 1);

    const roundTotal = result.roundTotalAmount.toNumber();
    expect(roundTotal).to.equal(stake1.toNumber() + stake2.toNumber() + stake3.toNumber());
  })
  
});

