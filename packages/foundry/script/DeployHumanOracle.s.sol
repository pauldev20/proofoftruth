//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/HumanOracle.sol";
import "./DeployHelpers.s.sol";

contract DeployHumanOracle is ScaffoldETHDeploy {

  address public worldIdAddr = 0x17B354dD2595411ff79041f930e491A4Df39A278;
  uint256 public groupId = 1;
  string public appId = "app_485be80eb191bba1e603c1aeb6743660";
  string public action = "registration";

  function run() external ScaffoldEthDeployerRunner {
    HumanOracle humanOracle = new HumanOracle(worldIdAddr, groupId, appId, action);
    console.logString(
      string.concat(
        "HumanOracle deployed at: ", vm.toString(address(humanOracle))
      )
    );
  }
}
