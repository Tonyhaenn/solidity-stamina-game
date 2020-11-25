const Stamina = artifacts.require("Stamina");

module.exports = function(deployer) {
  deployer.deploy(Stamina);
};
