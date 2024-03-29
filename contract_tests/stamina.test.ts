import { ethers, run } from "hardhat"; 

import { Signer } from "ethers";
import { expect } from "chai";

import { Stamina, Stamina__factory } from '../typechain';


const advanceTimeAndBlock = async function ( time: number ) {
  const currentBlockNumber = await ethers.provider.getBlockNumber();
  const currentBlock = await ethers.provider.getBlock(currentBlockNumber);
  
  if(currentBlock === null ){
    /* Workaround for https://github.com/nomiclabs/hardhat/issues/1183
    */
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



describe('Stamina', () => { 
  let snapshotId: string;  
  let owner: Signer;
  let signers: Signer[];
  
  let StaminaInstance: Stamina;

  const ONE_SECOND = 1
  const ONE_MINUTE = (60 * ONE_SECOND);
  const ONE_HOUR = (ONE_MINUTE * 60)
  const ONE_DAY = ( 24 * ONE_HOUR );
  const ROUND_LENGTH = (14 * ONE_DAY);

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

  describe('Contract Basics', ()=>{
    it('The deployer is the owner', async () => {
      //TODO: I'm not sure this is actually testing what I think it's testing
      const result = await StaminaInstance.owner();
      const ownerAddress = await owner.getAddress()
    
      expect(result).to.equal(ownerAddress);
    });
  
    it('The round length is ' + ROUND_LENGTH/ONE_DAY + ' days', async ()=>{
      const expected = ROUND_LENGTH;
      const result = await StaminaInstance.roundLength();
      expect(result.toString()).to.equal(expected.toString());
    });
  })

  describe('Time', ()=>{
    const contractRound = (day: number)=> {
      return (Math.floor((day / (ROUND_LENGTH/ONE_DAY)))+1);
    }

    const roundDay = (day: number) => {
      const dayRoundUp = day+1
      const currentRound = contractRound(day);
      const roundLength = Math.floor(ROUND_LENGTH/ONE_DAY);
      const roundDays = dayRoundUp - ((roundLength * (currentRound-1)));
      return roundDays;

    }

    for (let index = 0; index < 60; index++) {
      it('After ' + index + ' days and one second, the round is: ' + contractRound(index), async ()=>{
        await advanceTimeAndBlock((index * ONE_DAY)+ONE_SECOND);
        const currentRound = await StaminaInstance.currentRound();
        const expectedRound = contractRound(index);
        expect(expectedRound.toString()).to.equal(currentRound.toString());
      })
      
    }
    
    for (let index=0; index<60;index++ ){
      it('After ' + index + ' days and one second, the round day is: ' + roundDay(index), async()=>{
        await advanceTimeAndBlock((index * ONE_DAY)+ONE_SECOND);
        const currentDayRound = roundDay(index);
        const expectedDayRound = await StaminaInstance.currentDayRound();
        expect(expectedDayRound.toString()).to.equal(currentDayRound.toString())
      })
    }
  })
  
  describe('Staking', ()=>{
    it('A player can stake', async ()=>{
      const stake = ethers.utils.parseEther("1");
      const player = signers[1];
      const address = await player.getAddress();

      await StaminaInstance.connect(player).stake({value: stake});
      
      const result = await StaminaInstance.playerRoundDayStakeBalance(1, address, 1);
      const resultAmount = result.toString();
      expect(resultAmount.toString()).to.equal(stake.toString()); 
    });

    it('Minimum stake enforced', async ()=>{
      const stake = ethers.utils.parseEther("0");
      await expect(
        StaminaInstance.stake({value: stake})
      ).to.be.reverted;
    });

    it('A player stake updates global day total', async function(){
      const stake = ethers.utils.parseEther("1");
      await StaminaInstance.stake({value: stake});
      
      const globalResult = await StaminaInstance.globalRoundDayStakeBalance(1,1);
  
      expect(globalResult.toString()).to.equal(stake.toString()); 
    });

    it('Stake event emitted when player stakes', async () =>{
      const stake =ethers.utils.parseEther("1");
      await expect(
        StaminaInstance.stake({value: stake})
      ).to.emit(
        StaminaInstance, 'StakeEvent'
      );
    });

    it('Three sequential stakes have right player balance', async () => {
      const stake1 = ethers.utils.parseEther("1");
      const stake2 = ethers.utils.parseEther("1");
      const stake3 = ethers.utils.parseEther("1");
      const sumOfStakes = ethers.utils.parseEther("3");
  
      const account1 = signers[1];
      const address = await account1.getAddress();
      
      await StaminaInstance.connect(account1).stake({value: stake1})
      await advanceTimeAndBlock( ONE_DAY );
  
      await StaminaInstance.connect(account1).stake({value: stake2})
      await advanceTimeAndBlock( ONE_DAY );
  
      await StaminaInstance.connect(account1).stake({value: stake3})
      await advanceTimeAndBlock( ONE_DAY );
  
      const playerResult = await StaminaInstance.playerRoundDayStakeBalance(1, address, 3);
  
      expect(playerResult.toString()).to.equal(sumOfStakes.toString());
    });

    it('Three sequential stakes have right global balance', async () => {
      const stake1 = ethers.utils.parseEther("1");
      const stake2 = ethers.utils.parseEther("1");
      const stake3 = ethers.utils.parseEther("1");
      const sumOfStakes = ethers.utils.parseEther("3");
  
      const account1 = signers[1];
      
      await StaminaInstance.connect(account1).stake({value: stake1})
      await advanceTimeAndBlock( ONE_DAY );
  
      await StaminaInstance.connect(account1).stake({value: stake2})
      await advanceTimeAndBlock( ONE_DAY );
  
      await StaminaInstance.connect(account1).stake({value: stake3})
      await advanceTimeAndBlock( ONE_DAY );
  
      const globalBalance = await StaminaInstance.globalRoundDayStakeBalance(1,3);
  
      expect(globalBalance.toString()).to.equal(sumOfStakes.toString());
    });
  
    it('Two stakes in sequential days, and a stake in the same day have the latest player day total equal to the sum of all stakes', async function(){
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
  
      const totalStake = ethers.utils.parseEther("3");
  
      expect(playerResult.toString()).to.equal(totalStake.toString());
      
    });
  
    it('Two stakes in sequential days, and a stake in the same day have the latest global balance equal to sum of all stakes', async function(){
      const stake1 = ethers.utils.parseEther("1");
      const stake2 = ethers.utils.parseEther("1");
      const stake3 = ethers.utils.parseEther("1");
      
      const account = signers[1];
  
      await StaminaInstance.connect(account).stake({value: stake1})
      await advanceTimeAndBlock(ONE_DAY);
  
      await StaminaInstance.connect(account).stake({value: stake2})
      await advanceTimeAndBlock(ONE_DAY);
  
      await StaminaInstance.connect(account).stake({value: stake3})
      await advanceTimeAndBlock(ONE_MINUTE);
  
      const globalResult = await StaminaInstance.globalRoundDayStakeBalance(1,3);
  
      const totalStake = ethers.utils.parseEther("3");
  
      expect(globalResult.toString()).to.equal(totalStake.toString());
    });
  
    it('Two stakes in non-sequential days result in player day balance of only last stake', async function(){
      const stake1 = ethers.utils.parseEther("1");
      const stake2 = ethers.utils.parseEther("1.1");
    
      const account = signers[1];
      const address = await account.getAddress();
  
      await StaminaInstance.connect(account).stake({value: stake1})
      await advanceTimeAndBlock(2 * ONE_DAY);
  
      await StaminaInstance.connect(account).stake({value: stake2})
  
      const playerResult = await StaminaInstance.playerRoundDayStakeBalance(1,address,3);
  
      expect(playerResult.toString()).to.equal(stake2.toString());
    });
  
    it('Multiple stakes in the same day update player balance to sum to total stakes', async function(){
      
      const stake1 = ethers.utils.parseEther('1');
      const stake2 = ethers.utils.parseEther('1.1');
      const sumOfStakes = ethers.utils.parseEther('2.1')
      const account = signers[1];
      const address = await account.getAddress();
  
      await StaminaInstance.connect(account).stake({value: stake1})
      await advanceTimeAndBlock(2 * ONE_MINUTE);
  
      await StaminaInstance.connect(account).stake({value: stake2})
  
      const playerResult = await StaminaInstance.playerRoundDayStakeBalance(1,address,1);
  
      expect(playerResult.toString()).to.equal(sumOfStakes.toString());
    });
  
    it('Multiple stakes in the same day update global balance to sum to total stakes', async function(){
      
      const stake1 = ethers.utils.parseEther('1');
      const stake2 = ethers.utils.parseEther('1.1');
      const sumOfStakes = ethers.utils.parseEther('2.1')
      const account = signers[1];
      
      await StaminaInstance.connect(account).stake({value: stake1})
      await advanceTimeAndBlock(2 * ONE_MINUTE);
  
      await StaminaInstance.connect(account).stake({value: stake2})
  
      const globalResult = await StaminaInstance.globalRoundDayStakeBalance(1,1);
  
      expect(sumOfStakes.toString()).to.equal(globalResult.toString());
    });    
  })

  describe('Account Balances',()=>{
    it('Three players, player3 breaks, and player 1 has the right share', async function (){
      const stake = ethers.utils.parseEther("1");
      const player1 = signers[1];
      const player1Address = await player1.getAddress();
      const player2 = signers[2];
      const player3 = signers[3];
      
      await StaminaInstance.connect(player1).stake({value: stake});
      await StaminaInstance.connect(player2).stake({value: stake});
      await StaminaInstance.connect(player3).stake({value: stake});
  
      await advanceTimeAndBlock( ONE_DAY );
  
      await StaminaInstance.connect(player1).stake({value: stake});
      await StaminaInstance.connect(player2).stake({value: stake});
  
      await advanceTimeAndBlock( ONE_DAY );
  
      const brokenStakes = ethers.utils.parseEther('1')
      const player1Stakes = ethers.utils.parseEther('2')
      const allFullStakes = ethers.utils.parseEther('4')
  
      const houseRake = await StaminaInstance.houseRake();
      const poolOfBroken = brokenStakes.mul(100 - houseRake.toNumber()).div(100);
      const expectedWinnings = poolOfBroken.mul(player1Stakes).div(allFullStakes);
      const actualWinnings = await StaminaInstance.playerRoundWinnings(1,player1Address);
      
      expect(expectedWinnings.toString()).to.equal(actualWinnings.toString());
    });

    it('Player can claim winnings', async function (){
      const stake = ethers.utils.parseEther("1");
      const player1 = signers[1];
      const player2 = signers[2];
      const player3 = signers[3];
      const player1Address = await player1.getAddress();
      
      await StaminaInstance.connect(player1).stake({value: stake});
      await StaminaInstance.connect(player2).stake({value: stake});
      await StaminaInstance.connect(player3).stake({value: stake});
  
      await advanceTimeAndBlock( ONE_DAY );
  
      for (let step = 0; step < 13; step++) {
        await StaminaInstance.connect(player1).stake({value: stake});
        await StaminaInstance.connect(player2).stake({value: stake});
        await advanceTimeAndBlock( ONE_DAY );  
        
      }
      
      await advanceTimeAndBlock( ONE_SECOND);  
      
      await StaminaInstance.connect(player1).playerClaim(1);    
      const expectedWinnings = ethers.utils.parseEther( ((1*.9)/2).toString() )

      const player1Account = await StaminaInstance.connect(player1).accounts(player1Address);
      
      expect(expectedWinnings.toString()).to.equal(player1Account.toString());
    });

    it('Player cannot claim same round winnings twice', async function(){
      const stake = ethers.utils.parseEther("1");
      const player1 = signers[1];
      const player2 = signers[2];
      const player3 = signers[3];
      const player1Address = await player1.getAddress();
      
      await StaminaInstance.connect(player1).stake({value: stake});
      await StaminaInstance.connect(player2).stake({value: stake});
      await StaminaInstance.connect(player3).stake({value: stake});
  
      await advanceTimeAndBlock( ONE_DAY );
  
      for (let step = 0; step < 13; step++) {
        await StaminaInstance.connect(player1).stake({value: stake});
        await StaminaInstance.connect(player2).stake({value: stake});
        await advanceTimeAndBlock( ONE_DAY );  
        
      }
      
      await advanceTimeAndBlock( ONE_SECOND);  
      
      await StaminaInstance.connect(player1).playerClaim(1);    
      
      const player1AccountBal1 = await StaminaInstance.connect(player1).accounts(player1Address);
      
      await StaminaInstance.connect(player1).playerClaim(1);    
      
      const player1AccountBal2 = await StaminaInstance.connect(player1).accounts(player1Address);
      
      expect(player1AccountBal1.toString()).to.equal(player1AccountBal2.toString());
    })

    it('Owner can claim rake', async function (){
      const stake = ethers.utils.parseEther("1");
      const owner = signers[0];
      const player1 = signers[1];
      const player2 = signers[2];
      const player3 = signers[3];
      const ownerAddress = await owner.getAddress();
      
      await StaminaInstance.connect(player1).stake({value: stake});
      await StaminaInstance.connect(player2).stake({value: stake});
      await StaminaInstance.connect(player3).stake({value: stake});
  
      await advanceTimeAndBlock( ONE_DAY );
  
      for (let step = 0; step < 13; step++) {
        await StaminaInstance.connect(player1).stake({value: stake});
        await StaminaInstance.connect(player2).stake({value: stake});
        await advanceTimeAndBlock( ONE_DAY );  
        
      }
      
      await advanceTimeAndBlock( ONE_SECOND);  
      
      await StaminaInstance.connect(owner).ownerClaim(1);    
      const ownerTake = ethers.utils.parseEther( ((1*.1)).toString() )

      const ownerAccount = await StaminaInstance.connect(owner).accounts(ownerAddress);
      
      expect(ownerTake.toString()).to.equal(ownerAccount.toString());
    });

    it('Owner cannot claim same round rake twice', async function(){
      const stake = ethers.utils.parseEther("1");
      const owner = signers[0];
      const player1 = signers[1];
      const player2 = signers[2];
      const player3 = signers[3];
      const ownerAddress = await owner.getAddress();
      
      await StaminaInstance.connect(player1).stake({value: stake});
      await StaminaInstance.connect(player2).stake({value: stake});
      await StaminaInstance.connect(player3).stake({value: stake});
  
      await advanceTimeAndBlock( ONE_DAY );
  
      for (let step = 0; step < 13; step++) {
        await StaminaInstance.connect(player1).stake({value: stake});
        await StaminaInstance.connect(player2).stake({value: stake});
        await advanceTimeAndBlock( ONE_DAY );  
        
      }
      
      await advanceTimeAndBlock( ONE_SECOND);  
      
      await StaminaInstance.connect(owner).ownerClaim(1);    
      await expect(StaminaInstance.connect(owner).ownerClaim(1)).to.be.reverted;

    })
  })
  
  
  //TODO: Add tests for rounds > 1
  

});

