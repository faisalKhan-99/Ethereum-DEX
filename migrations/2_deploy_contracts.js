//through migration we change state of the program on blockchain(updation)
const Token = artifacts.require("Token");

module.exports = function (deployer) {
  deployer.deploy(Token);
};
