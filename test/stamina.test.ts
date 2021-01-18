import { ethers } from "hardhat"; 

import { Signer } from "ethers";
import { expect } from "chai";

import { Stamina, Stamina__factory } from '../typechain';

const advanceTimeAndBlock = async function ( time: number ) {
  const currentBlockNumber = await ethers.provider.getBlockNumber();
  const currentBlock = await ethers.provider.getBlock(currentBlockNumber);
  
  if(currentBlock === null ){
    /* Workaround for https://github.com/nomiclabs/hardhat/issues/1183
    */
    console.log("WARN: Null block when advancing time");
    await ethers.provider.send('evm_increaseTime', [time]);
    await ethers.provider.send('evm_mine',[]);  
    await ethers.provider.send('evm_increaseTime',[15]);
    return;
  }
  const currentTime = currentBlock.timestamp;
  const futureTime = currentTime + time;
  await ethers.provider.send('evm_setNextBlockTimestamp', [futureTime]);
  await ethers.provider.send('evm_mine',[]);
  
};

describe('Stamina Basics ', () => { 
  let snapshotId: string;  
  let owner: Signer;
  let signers: Signer[];
  
  let StaminaInstance: Stamina;

  

  const ONE_DAY = ( 24 * 60 * 60 );
  const ONE_MINUTE = (60);

  const ROUND_LENGTH = 14 * ONE_DAY;

  before( async () => {
    signers = await ethers.getSigners();
    owner = signers[0]; 
    const StaminaFactory = (await ethers.getContractFactory("Stamina", owner)) as Stamina__factory;
    
    StaminaInstance = (await StaminaFactory.deploy()) as Stamina;
    
  });

  beforeEach( async function() {
    snapshotId = await ethers.provider.send('evm_snapshot', []);
  })

  afterEach( async function() {
    await ethers.provider.send('evm_revert', [snapshotId]);
  })

  it('The deployer is the owner', async () => {
    const result = await StaminaInstance.owner();
    const ownerAddress = await owner.getAddress()
    expect(result).to.equal(ownerAddress);
  });

  it('The round length is ' + ROUND_LENGTH, async ()=>{
    const expected = ROUND_LENGTH;
    const result = await StaminaInstance.roundLength();
    expect(+result).to.equal(expected);
  });
  
  it('A round ends after the round length', async ()=>{
    const r1 = await StaminaInstance.activeRound();
    const stake = ethers.utils.parseEther("10");
    
    await advanceTimeAndBlock((ROUND_LENGTH)+1);
    
    await StaminaInstance.stake({value:stake});

    const result = await StaminaInstance.activeRound();
    const expected = r1.toNumber() + 1;
    expect(result.toNumber()).to.equal(expected);
  });
  
  it('A player can stake', async ()=>{
    const stake = ethers.utils.parseEther("1");
    await StaminaInstance.stake({value: stake});
    
    const address = await signers[0].getAddress();
    const result = await StaminaInstance.playerRoundDayStakeBalance(1, address, 1);
    const resultAmount = result.toString();
    expect(resultAmount).to.equal(stake);
  });

  it('Minimum stake enforced', async ()=>{
    const stake = ethers.utils.parseEther("0");
    await expect(
      StaminaInstance.stake({value: stake})
    ).to.be.reverted;
  });
  
  
  it('Stake event emitted when player stakes', async () =>{
    const stake =ethers.utils.parseEther("1");
    await expect(
       StaminaInstance.stake({value: stake})
    ).to.emit(
      StaminaInstance, 'StakeEvent'
    );
  });
  
  it('Three sequential stakes have right player balance & right global balance', async () => {
    const stake1 = ethers.utils.parseEther("1");
    const stake2 = ethers.utils.parseEther("1");
    const stake3 = ethers.utils.parseEther("1");
    const sumOfStakes = ethers.utils.parseEther("3");

    const account1 = signers[1];
    const address = await account1.getAddress();
    
    await StaminaInstance.connect(account1).stake({value: stake1})
    await advanceTimeAndBlock( ONE_DAY + 1 );

    await StaminaInstance.connect(account1).stake({value: stake2})
    await advanceTimeAndBlock( ONE_DAY + 1);

    await StaminaInstance.connect(account1).stake({value: stake3})
    await advanceTimeAndBlock( ONE_DAY + 1);

    const playerResult = await StaminaInstance.playerRoundDayStakeBalance(1, address, 3);

    const globalBalance = await StaminaInstance.globalRoundDayStakeBalance(1,3);

    expect(playerResult).to.equal(sumOfStakes);
    expect(globalBalance).to.equal(sumOfStakes);
  });

  it('Two stakes in sequential days, and a stake in the same day have the latest day total equal to the sum of all stakes', async function(){
    const stake1 = ethers.utils.parseEther("1");
    const stake2 = ethers.utils.parseEther("1");
    const stake3 = ethers.utils.parseEther("1");
    

    const account = signers[1];
    const address = await account.getAddress();

    await StaminaInstance.connect(account).stake({value: stake1})
    await advanceTimeAndBlock(ONE_DAY);

    await StaminaInstance.connect(account).stake({value: stake2})
    await advanceTimeAndBlock(ONE_DAY);

    await StaminaInstance.connect(account).stake({value: stake3})
    await advanceTimeAndBlock(ONE_MINUTE);

    const playerResult = await StaminaInstance.playerRoundDayStakeBalance(1,address,3)

    const globalResult = await StaminaInstance.globalRoundDayStakeBalance(1,3);
    const totalStake = ethers.utils.parseEther("3");

    expect(playerResult).to.equal(totalStake);
    expect(globalResult).to.equal(totalStake);
    
  })

  it('Two stakes in sequential days have day total equal to sum of both stakes')

  it('Two stakes in non-sequential rounds do not ')

  it('A player stake updates global day total')

  it('Multiple stakes in the same day update player balance properly')

  it('Two stakes in sequential rounds have roundTotal equal to sum of both stakes')

  it('Two players, one breaks, and player 1 has the right share')
});

