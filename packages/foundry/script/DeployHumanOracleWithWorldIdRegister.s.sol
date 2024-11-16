//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/HumanOracleWithWorldIdRegister.sol";
import "./DeployHelpers.s.sol";

contract DeployHumanOracleWithWorldIdRegister is ScaffoldETHDeploy {

  address public worldIdAddr = 0x17B354dD2595411ff79041f930e491A4Df39A278;
  uint256 public groupId = 1;
  string public appId = "app_22ea9fb73d53333c2997e8f16e60cc6b";
  string public action = "registration";

  function run() external ScaffoldEthDeployerRunner {
    HumanOracleWithWorldIdRegister humanOracle = new HumanOracleWithWorldIdRegister(worldIdAddr, groupId, appId, action);
    console.logString(
      string.concat(
        "HumanOracleWithWorldIdRegister deployed at: ", vm.toString(address(humanOracle))
      )
    );
  }
}
