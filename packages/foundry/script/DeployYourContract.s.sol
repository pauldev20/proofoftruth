//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/MockHumanOracle.sol";
import "./DeployHelpers.s.sol";

contract DeployYourContract is ScaffoldETHDeploy {
  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    MockHumanOracle humanOracle = new MockHumanOracle();
    console.logString(
      string.concat(
        "MockHumanOracle deployed at: ", vm.toString(address(humanOracle))
      )
    );
  }
}
