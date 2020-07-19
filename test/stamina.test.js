// Create a contract object from a compilation artifact
const Stamina = artifacts.require('Stamina');

contract('Stamina', async accounts => {
  const [ owner ] = accounts;
  const roundLength = 3;
  const minStake = 0;

  before(async function() {
    myContract = await Stamina.new(roundLength, minStake, { from: owner });
  });

  it('the deployer is the owner', async function () {
    const expected = owner;
    const result = await myContract.owner();
    expect(result).to.equal(expected);
  //  expect(await myContract.owner()).toEqual(owner);
  });

  it('The round length is ' + roundLength, async function(){
    const expected = roundLength * 24 * 60 * 60;
    const result = await myContract.roundLength()
    expect(result.toString()).to.equal(expected.toString());
  })
})