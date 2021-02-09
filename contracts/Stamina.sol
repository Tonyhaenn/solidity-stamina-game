//SPDX-License-Identifier: UNLICENSED
/*
Trying to avoid need to loop over every players balance
1) Keep track of total player value + all player values every time stake?
2) Since we know the end date of the contract, 24H prior to end, start flagging players that play in that window, and therefore will get their entire stake back plus share of broken?
3) hmm. still need a separate TX with loop to identify broken players?
*/
pragma solidity >=0.5.8 <0.8.0;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import 'hardhat/console.sol';

/** 
@title Stamina
@author Tony Haenn
@notice Game. Stake every day, get your stakes back, and win a share of those that don't have stamina.
*/
contract Stamina is Ownable {
  using SafeMath for uint256;

  uint256 public roundLength;
  uint256 public roundStart;
  uint256 public roundEnd;
  uint256 public activeRound;
  uint256 public houseRake;

  uint256 public dummy;
  /*
  struct Stake {
    uint256 amount;
    uint256 roundTotalAmount;
  }
  */
  event StakeEvent (
    address indexed player,
    uint256 indexed round,
    uint256 amount,
    uint256 roundTotalAmount,
    uint256 playerRoundTotalAmount,
    uint256 playerStakeCount
  );

  ///@notice For each round, day, store the total value of all stakes added. As player stakes, move value from Day1 to Day 2 (two operations, decrement total player stake from prior day and add to current day)
  /// roundNum: {day: balance}
  mapping(uint256 => mapping(uint256 => uint256)) public globalRoundDayStakeBalance;

  ///@notice Mapping to store all stakes
  /// activeRound: {player: {dayNum: stake}}
  mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public playerRoundDayStakeBalance;
  
  //TODO: Figure out if these are necessary
  /// roundNum: {player: numStakes}
  mapping(uint256 => mapping(address => uint256)) public playerStakeCount;

  ///@notice roundPlayerCount: Mapping to keep track of player count
  /// round: {day: numPlayers}
  mapping(uint256 => mapping( uint256 => uint256)) public roundDayPlayerCount;
  
  /**
   * @notice Constructor for contract that sets base values for round length, and minimum stake
  */
  
  constructor() public {
    roundLength = 14 * 1 days;
    roundStart = block.timestamp;
    roundEnd = block.timestamp + roundLength;
    activeRound = 1;
    houseRake = 10;
  }

  /**
   * @notice Determines if round is ended. Called during stake.
   */
  function endRound() private {
    uint256 currentTime = block.timestamp;
    if (currentTime > roundEnd) {
      activeRound += 1;
      roundEnd = block.timestamp + roundLength;
      return;
    } 
    return;
  }

  ///@notice Calculates how many days have elapsed since the round started
  function currentDayRound() private view returns(uint256) {
    // Round up (x + y - 1) ÷ y
    require(block.timestamp >= roundStart, 'Blocktime prior to roundStart');
    uint256 secondsUntilEnd = roundEnd - block.timestamp;
    uint256 secondsElapsedRound = roundLength - secondsUntilEnd;
    uint256 daysElapsedRound = (secondsElapsedRound+ 1 days) / 1 days;
    return daysElapsedRound;
  }
  /**
   *  @notice Primary entry point for playing the game. Checks for prior stake and carries forward value if time diff <24H
   */
  function stake() public payable {
    
    /* DEV Notes
  
    Each time a player stakes
    0. Figure out if the round is ended?
    1. Fetch the last stake
    2. If last stake exists, add prior stake balance to current stake balance, if exists
    3. Move total player balance from prior day total to new day total

    Gas cost seems high: >100k?
    */
    require(msg.value > 0 , 'Must contribute value to stake');
    
    //Is the round ended? If so, advance round counter
    endRound();

    address player = msg.sender;
    uint256 playerRoundTotalValue;
    uint256 currentDay = currentDayRound();
    uint256 priorDay = currentDay - 1;
    
    //Get prior stake. If doesn't exist, expect 0, else uint256
    uint256 priorDayStake = playerRoundDayStakeBalance[activeRound][player][priorDay];
    uint256 currentDayPriorStake = playerRoundDayStakeBalance[activeRound][player][currentDay];
    
    //Figure out appropriate value to carry forward
    
    if(priorDayStake > 0 && currentDayPriorStake > 0) {
      playerRoundTotalValue = priorDayStake + currentDayPriorStake + msg.value;
    } else if (priorDayStake > 0) {
      playerRoundTotalValue = priorDayStake + msg.value;
    } else if (currentDayPriorStake > 0) {
      playerRoundTotalValue = currentDayPriorStake + msg.value;
    } else {
      playerRoundTotalValue = msg.value;
    }
    
    //Update current day stake
    playerRoundDayStakeBalance[activeRound][player][currentDay] = playerRoundTotalValue;
    
    //Adjust totals
    //First decrement player total balance from priorday for round
    // Remove from both global counter, and player's prior day
    
    if(priorDay > 0 && priorDayStake > 0 ){
      //Set player stake balance to zero
      playerRoundDayStakeBalance[activeRound][player][priorDay] = 0;
      
      //Remove player's prior day round total from the global stake balance
    globalRoundDayStakeBalance[activeRound][priorDay] = globalRoundDayStakeBalance[activeRound][priorDay].sub(priorDayStake);

    }

    //Then add player total balance to today
    if(currentDayPriorStake > 0){
      globalRoundDayStakeBalance[activeRound][currentDay] = globalRoundDayStakeBalance[activeRound][currentDay].add(msg.value);
    } else {
      globalRoundDayStakeBalance[activeRound][currentDay] = globalRoundDayStakeBalance[activeRound][currentDay].add(playerRoundTotalValue);
    }   
    
    //TODO: Decide if these are strictly necessary
    playerStakeCount[activeRound][player] += 1;
    roundDayPlayerCount[activeRound][currentDay] +=1;
    
    emit StakeEvent(
      player, 
      activeRound, 
      msg.value, 
      globalRoundDayStakeBalance[activeRound][currentDay],
      playerRoundTotalValue,
      playerStakeCount[activeRound][player]
    );

  }

  /**
   * @notice For a given round, return the total of all broken stakes
   * @param roundNum round integer
   * @param day day integer
   */
   function brokenStakes(uint256 roundNum, uint256 day) public view returns (uint256) {
     /* DEV NOTES:
      * Loop down through each day, summing each day total, excluding currentDay ?
      */
  
      uint256 brokenStakesVal;
      for (uint256 index = 0 ; index < day; index++) {
        brokenStakesVal += globalRoundDayStakeBalance[roundNum][index];
      }

      return brokenStakesVal;
   }

   
  /** 
   * @notice Calculates a players winnings for a given round
   * @param roundNum round to calculate winnings for
   * @param player player address
  */
  function playerRoundWinnings(uint256 roundNum, address player) public view returns(uint256) {
    
    uint256 day = roundNum == activeRound ? currentDayRound()-1 : roundLength;
    uint256 playerStakes = playerRoundDayStakeBalance[roundNum][player][day];
    uint256 brokenStakesVal = brokenStakes(roundNum, day);
    
    if(playerStakes == 0 || brokenStakesVal == 0){
      return 0;
    }
    
    uint256 fullStakes = globalRoundDayStakeBalance[roundNum][day];
    uint256 poolOfBroken = (brokenStakesVal * (100 - houseRake))/100;
    uint256 winnings = (poolOfBroken * playerStakes)/fullStakes;

    return winnings;
  }
  /**
   *  @notice Allows a player to withdraw winnings
   *  @param roundNum of round where winnings should be withdrawn
   */
  //function withdraw(uint256 roundNum) public  {
  //  address playerAddress = msg.sender;
  //
  //}

}