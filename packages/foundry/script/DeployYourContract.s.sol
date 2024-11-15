//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/HumanOracle.sol";
import "./DeployHelpers.s.sol";

contract DeployYourContract is ScaffoldETHDeploy {
  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    HumanOracle humanOracle = new HumanOracle();
    console.logString(
      string.concat(
        "HumanOracle deployed at: ", vm.toString(address(humanOracle))
      )
    );
  }
}
