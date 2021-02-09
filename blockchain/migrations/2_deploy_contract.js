const Tunnelwall = artifacts.require("Tunnelwall");

module.exports = function(deployer) {
  deployer.deploy(Tunnelwall);
};
