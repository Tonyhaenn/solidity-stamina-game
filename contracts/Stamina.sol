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
@notice Game. Play every day, get your tokens back, and win a share of those that don't have stamina.
*/
contract Stamina is Ownable {
  using SafeMath for uint256;

  uint256 public contractStart;
  uint256 public roundLength;
  uint256 public houseRake;

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
  
  ///@notice playerWinnings: Mapping to keep track of player account balance
  mapping(address => uint256) public playerWinningsBalance;

  ///@notice accounts
  mapping(address => uint256) public accounts;

  ///@notice ownerRoundClaimMap
  mapping(uint256 => bool) public ownerRoundClaimMap;

  /**
   * @notice Constructor for contract that sets base values for round length, and minimum stake
  */
  
  constructor() {
    contractStart = block.timestamp;
    houseRake = 10;
    roundLength = 14 * 1 days;
  }

  
  ///@notice Calculates how many rounds have elapsed since contract deployed
  function currentRound() public view returns(uint256){
    uint256 secondsElapsed = block.timestamp - contractStart;
    uint256 daysElapsed = (secondsElapsed  + 1 days) / 1 days;
    /*
    TODO: Implement this everywhere 
      The standard idiom for integer rounding up is:
      int a = (59 + (4 - 1)) / 4;
      You add the divisor minus one to the dividend.
    */
    
    uint256 round = (daysElapsed + ((roundLength/1 days)-1)) / (roundLength / 1 days);
  
    return round;
  }
  ///@notice Calculates day of current round
  function currentDayRound() public view returns(uint256){
    uint256 currentRoundNum = currentRound();
    uint256 secondsElapsed = block.timestamp - contractStart;
    uint256 daysElapsed = (secondsElapsed + 1 days)/ 1 days;
    uint256 currentDay = daysElapsed - ((roundLength/1 days)*(currentRoundNum - 1));
    return currentDay;
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
    
    address player = msg.sender;
    uint256 playerRoundTotalValue;
    uint256 currentDay = currentDayRound();
    uint256 priorDay = currentDay - 1;
    uint256 activeRound = currentRound();

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
   *  @notice Allows an account to withdraw winnings
   */

  /**
   * @notice For a given round, return the total of all broken stakes
   * @param roundNum round integer
   * @param day day integer
   */
  function brokenStakes(uint256 roundNum, uint256 day) private view returns (uint256) {
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
  function playerRoundWinnings(uint256 roundNum, address player)  public view returns(uint256) {
    uint256 activeRound = currentRound();
    
    uint256 day = roundNum == activeRound ? currentDayRound()-1 : (roundLength / 1 days);
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
   * @notice Allows a player to claim winnings in player account
   * @param roundNum of round with winnings to claim 
   */

  function playerClaim(uint256 roundNum) public {
    uint256 activeRound = currentRound();
    require (roundNum != activeRound, 'Cannot claim from activeRound');
    
    //Calculate Winnings
    uint256 claimedAmount = playerRoundWinnings(roundNum, msg.sender);
    
    //Update player round balance
    playerRoundDayStakeBalance[roundNum][msg.sender][(roundLength/ 1 days)] = 0;

    //Add winnings to player account
    accounts[msg.sender] += claimedAmount;
    return;
  }

  /**
   *  @notice Allows a owner to calculate current house rake
   *  
   */

  function ownerRoundTake(uint256 roundNum) public view returns(uint256){
    uint256 activeRound = currentRound();
    
    uint256 day = roundNum == activeRound ? currentDayRound()-1 : (roundLength / 1 days);
    uint256 brokenStakesVal = brokenStakes(roundNum, day);

    if(brokenStakesVal == 0){
      return 0;
    }

    uint256 ownerTake = (brokenStakesVal * houseRake)/100;
    
    return ownerTake;
  }
  /**
   *  @notice Allows a owner to claim house rake
      @param roundNum of round where winnings should be withdrawn
   */

  function ownerClaim(uint256 roundNum) public onlyOwner {
    uint256 activeRound = currentRound();
    require(roundNum != activeRound, 'Cannot claim from activeRound');
    
    bool ownerHasClaimed = ownerRoundClaimMap[roundNum];

    console.log('Owner claim status %s for round %s', ownerHasClaimed, roundNum);
    require(ownerHasClaimed == false, 'Cannot claim rake twice');

    uint ownerTake = ownerRoundTake(roundNum);
    ownerRoundClaimMap[roundNum] = true;
    accounts[owner()] += ownerTake;
  } 

  function accountWithdraw() public {
    uint256 amount = accounts[msg.sender];
    accounts[msg.sender] = 0;
    msg.sender.transfer(amount);
  }

}