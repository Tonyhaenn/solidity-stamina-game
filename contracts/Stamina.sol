//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Stamina is Ownable {
  using SafeMath for uint256;

  uint256 public minStake;
  uint256 public roundLength;
  uint256 public gameStart;
  uint256 public activeRound;

  constructor(uint256 _roundLength, uint256 _minStake) public {
    roundLength = _roundLength *   1 days;
    gameStart = now;
    if(_minStake == 0){
      minStake = 16 finney;
    } else {
      minStake = _minStake;
    }
    
  }
  //Something like this for player round balances?
  //mapping (address => mapping (uint256 => uint256)) private playerRound;
  /*
  roundNum: {
    playerAddress: [Stake, Stake, Stake]
  }
  */

  
  mapping(uint256 => mapping(address => Stake[])) private playerRound;
  
  struct Stake {
    uint256 amount;
    uint256 timestamp;
  }

  function stake(uint256 round) public payable {
    require(msg.value >= minStake, "You must stake at least the minimum.");
    require(round == activeRound, "You must stake in the active round.");

    address player;
    uint256 stakeAmount;

    player = msg.sender;
    stakeAmount = msg.value;

    playerRound[activeRound][player].push(Stake(stakeAmount, block.timestamp) );
    
  }
  
}