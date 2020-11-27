//SPDX-License-Identifier: UNLICENSED
/*
Trying to avoid need to loop over every players balance
1) Keep track of total player value + all player values every time stake?
2) Since we know the end date of the contract, 24H prior to end, start flagging players that play in that window, and therefore will get their entire stake back plus share of broken?
3) hmm. still need a separate TX with loop to identify broken players?
*/
pragma solidity >=0.4.21 <0.8.0;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

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

  struct Stake {
    uint256 amount;
    uint256 roundTotalAmount;
  }

  event StakeEvent (
    address indexed player,
    uint256 indexed round,
    uint256 amount,
    uint256 roundTotalAmount
  );

/* LOG EVENTS. REMOVE THESE
*/
  event LogEvent (
    bytes32 txt,
    uint256 lineNumber
  );

  event LogNum(
    uint256 number,
    uint256 lineNumber
  );

  event StakeLogEvent(
    uint256 currentDayRoundVal, 
    uint256 priorDayRoundVal
  );

  event DecrEvent(
    uint priorRoundVal, 
    uint priorRoundStake, 
    uint roundDayStakeBalance 
  );

  ///@notice For each round, day, store the total value of all stakes added. As player stakes, move value from Day1 to Day 2 (two operations, decrement total player stake from prior day and add to current day)
  /// roundNum: {day: balance}
  mapping(uint256 => mapping(uint256 => uint256)) public roundDayStakeBalance;

  ///@notice Mapping to store all stakes
  /// activeRound: {player: {dayNum: stake}}
  mapping(uint256 => mapping(address => mapping(uint256 => Stake))) public roundPlayerStakeStorage;
  
  /*
  ///@notice Keep track of how many stakes a player has played for a given round
  /// roundNum: {player: numStakes}
  mapping(uint256 => mapping(address => uint256)) public playerStakeCount;
  */

  ///@notice roundPlayerCount: Mapping to keep track of player count
  /// round: numPlayers
  mapping(uint256 => uint256) private roundPlayerCount;

  
  /**
   * @notice Constructor for contract that sets base values for round length, and minimum stake
  */
  constructor() public {
    roundLength = 14 * 1 days;
    roundStart = block.timestamp;
    roundEnd = block.timestamp + roundLength;
    activeRound = 1;
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
    require(block.timestamp >= roundStart);
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
    Tried to implement below. Blew up gas cost, and apparently has a bug.

    Each time a player stakes
    0. Figure out if the round is ended?
    1. Fetch the last stake
    2. If last stake exists, add prior stake balance to current stake balance, if exiz
    3. Move total player balance from prior day total to new day total
    */
    require(msg.value >= 0 , "Must contribute value to stake");
    //Is the round ended? If so, advance round counter
    endRound();

    address player = msg.sender;
    //uint256 playerTotalStakes;
    uint256 playerRoundTotalValue;
    uint256 currentDayRoundVal = currentDayRound();
    uint256 priorDayRoundVal = currentDayRoundVal - 1;
    
    emit StakeLogEvent(currentDayRoundVal, priorDayRoundVal);
    //Get prior stake. If doesn't exist, expect 0, else Stake
    Stake memory priorRoundStake = roundPlayerStakeStorage[activeRound][player][priorDayRoundVal];
    Stake memory currentRoundPriorStake = roundPlayerStakeStorage[activeRound][player][currentDayRoundVal];

    //Figure out appropriate value to carry forward
    if(priorRoundStake.amount > 0 && currentRoundPriorStake.amount > 0) {
      playerRoundTotalValue = priorRoundStake.roundTotalAmount + currentRoundPriorStake.roundTotalAmount + msg.value;
    } else if (priorRoundStake.amount > 0) {
      playerRoundTotalValue = priorRoundStake.roundTotalAmount + msg.value;
    } else if (currentRoundPriorStake.amount > 0) {
      playerRoundTotalValue = currentRoundPriorStake.roundTotalAmount + msg.value;
    } else {
      playerRoundTotalValue = msg.value;
    }

    //Push new stake
    roundPlayerStakeStorage[activeRound][player][currentDayRoundVal] = Stake({
        amount: msg.value, 
        roundTotalAmount: playerRoundTotalValue
        });
    
    //Adjust totals
    //First decrement player total balance from priorday
    if(priorDayRoundVal > 0 && priorRoundStake.roundTotalAmount > 0 ){
      emit DecrEvent(priorDayRoundVal, priorRoundStake.roundTotalAmount, roundDayStakeBalance[activeRound][priorDayRoundVal] );

      roundDayStakeBalance[activeRound][priorDayRoundVal] = roundDayStakeBalance[activeRound][priorDayRoundVal].sub(priorRoundStake.roundTotalAmount);
    }
    
    //Then add player total balance to today
    roundDayStakeBalance[activeRound][currentDayRoundVal] = roundDayStakeBalance[activeRound][currentDayRoundVal].add(msg.value);
    emit StakeEvent(player, activeRound, msg.value, playerRoundTotalValue);
  }
  /** 
  * @notice Calculates a players winnings for a given round
  * @param roundNum round 
  * @param player player address
  */
  function playerRoundWinnings(uint256 roundNum, address player) public view {
    // -- Multiple functions?
    // Func 1
    // Get player stakes, determine if any are valid
    // If not, return 0
    //for (uint256 index = 0; index < array.length; index++) {
    //    const element = array[index];
    //}
    // Func 2
    // Determine how many stakes are valid given a set of stakes

    // func 3
    // Get all stakes and which sets are valid
    // Player valid stakes / all valid stakes
    // Return proportion * invalid stakes + player valid 
  }
  /**
   *  @notice Allows a player to withdraw winnings
   *  @param roundNum of round where winnings should be withdrawn
   */
  //function playerWithdraw(uint256 roundNum) public  {
  //  address playerAddress = msg.sender;
  //
  //}

  /**
   * @notice Determines if a stake is valid by comparing to newer stake timestamp. Difference must be less than 24H
   * @param currentStakeTimestamp stake to validate
   * @param priorStakeTimestamp prior stake when sorted timestamp descending (newest stake)
   */


}