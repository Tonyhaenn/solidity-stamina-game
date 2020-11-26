const Stamina = artifacts.require('Stamina');
const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');

contract('Stamina', async accounts => {
  const [ owner ] = accounts;
  const roundLength = 14;
  let staminaContract;
  

  before(async ()=> {
    staminaContract = await Stamina.new({ from: owner });
  });

  beforeEach(async() => {
    let snapshot = await timeMachine.takeSnapshot();
    snapshotId = snapshot['result'];
  });

  afterEach(async() => {
    await timeMachine.revertToSnapshot(snapshotId);
  });

  it('The deployer is the owner', async function () {
    const expected = owner;
    const result = await staminaContract.owner();
    expect(result).to.equal(expected);
  });

  it('The round length is ' + roundLength, async function(){
    
    const expected = roundLength * 24 * 60 * 60;
    const result = await staminaContract.roundLength();
    expect(+result).to.equal(expected);
  });

  it('A player can stake', async function(){
    const value = 100000000000000;
    
    await staminaContract.stake({from: accounts[0], value: value});
    const result = await staminaContract.roundPlayerStakeStorage(1, accounts[0],1);
    const resultAmount = result.amount.toNumber();
    
    expect(resultAmount).to.equal(value);
  });

  it('A player stake updates round day total', async function(){
    const value = 100000000000000;
    
    await staminaContract.stake({from: accounts[0], value: value});

    const result = await staminaContract.roundDayStakeBalance(1,1);
    const resultAmount = result.amount.toNumber();
    
    expect(resultAmount).to.equal(value);
  });

  it('Multiple stakes in the same round total all stakes', async function(){
    const stake1 = 100000000000000;
    const stake2 = 100000000000000;
    await staminaContract.stake({from: accounts[0], value: stake1});
    timeMachine.advanceTimeAndBlock(60);

    await staminaContract.stake({from: accounts[0], value: stake2});

    const result = await staminaContract.roundPlayerStakeStorage(1, accounts[0],1);
    const resultAmount = result.roundTotalAmount.toNumber();
    
    expect(resultAmount).to.equal(stake1+stake2);
  });

  it('Two stakes in sequential rounds have roundTotal equal to sum of both stakes', async function(){
    const stake1 = 100000000000000;
    const stake2 = 100000000000000;
    await staminaContract.stake({from: accounts[0], value: stake1});
    timeMachine.advanceTimeAndBlock(24*60*60 + 1);

    await staminaContract.stake({from: accounts[0], value: stake2});

    const result = await staminaContract.roundPlayerStakeStorage(1, accounts[0],2);
    const resultAmount = result.roundTotalAmount.toNumber();
    
    expect(resultAmount).to.equal(stake1+stake2);
  });

  it('Two stakes in non-sequential rounds do not total', async function(){
    const stake1 = 100000000000000;
    const stake2 = 100000000000000;
    await staminaContract.stake({from: accounts[0], value: stake1});
    timeMachine.advanceTimeAndBlock(24*60*60*2 + 1);

    await staminaContract.stake({from: accounts[0], value: stake2});

    const result = await staminaContract.roundPlayerStakeStorage(1, accounts[0],3);
    const resultAmount = result.roundTotalAmount.toNumber();
    
    expect(resultAmount).to.equal(stake2);
  });

  it('Two sequential stakes, and a stake in the same round have the latest roundTotal stake equal to the sum of all stakes', async function(){
    const stake1 = 100000000000000;
    const stake2 = 100000000000000;
    const stake3 = 100000000000000;

    await staminaContract.stake({from: accounts[0], value: stake1});
    
    timeMachine.advanceTimeAndBlock(24*60*60 + 1);

    await staminaContract.stake({from: accounts[0], value: stake2});

    timeMachine.advanceTimeAndBlock(8*60*60);

    await staminaContract.stake({from: accounts[0], value: stake3});

    const result = await staminaContract.roundPlayerStakeStorage(1, accounts[0],2);
    const resultAmount = result.roundTotalAmount.toNumber();
    
    expect(resultAmount).to.equal(stake1 + stake2 + stake3);
  });
  //TODO: Add tests to make sure round totals are updated properlya
/*
  it('Stake Event emitted when player stakes', async function(){
    const value = 16000000000000000;
    const result = await staminaContract.stake({from: accounts[0], value: value});

    truffleAssert.eventEmitted(result, 'StakeEvent', (ev)=>{
      return ev.player === accounts[0]
        && ev.round.toNumber() === 1
        && ev.amount.toString() === value.toString();
    })
  })

  it('The minimum stake is enforced', async function(){
    const value = 0;
    truffleAssert.fails(staminaContract.stake({from: accounts[0], value: value}),truffleAssert.ErrorType.REVERT,"You must stake at least the minimum." );
  });
  
  it('A round ends after the round length', async function(){
    const r1 = await staminaContract.activeRound()
    const value = 16000000000000000;

    const advanceTime = (roundLength * 24 * 60 * 60) + 1;
    await timeMachine.advanceTimeAndBlock(advanceTime);
    await staminaContract.stake({from: accounts[0], value: value});

    const result = await staminaContract.activeRound()
    const resultNum = result.toNumber()
    const expected = r1.toNumber() + 1;
    
    expect(resultNum).to.equal(expected)

  });

  it('Timestamp 23H after prior is valid', async function(){
    const t1 = Math.floor(new Date().getTime() / 1000)
    const t2 = t1 + (23*60*60)
    const result = await staminaContract.validateStakes(t2, t1)
    expect(result).to.be.true;
  })

  it('Timestamp 24H after prior is valid', async function(){
    const t1 = Math.floor(new Date().getTime() / 1000)
    const t2 = t1 + (24*60*60)
    const result = await staminaContract.validateStakes(t2, t1);
    expect(result).to.be.false;
  })
*/
})

