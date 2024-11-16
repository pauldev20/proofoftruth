//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/WorldIDRegister.sol";
import "./DeployHelpers.s.sol";

contract DeployWorldIDRegister is ScaffoldETHDeploy {

  address public worldIdAddr = 0x17B354dD2595411ff79041f930e491A4Df39A278;
  uint256 public groupId = 1;
  string public appId = "app_22ea9fb73d53333c2997e8f16e60cc6b";
  string public action = "registration";

  function run() external ScaffoldEthDeployerRunner {
    WorldIDRegister worldIDRegister = new WorldIDRegister(worldIdAddr, groupId, appId, action);
    console.logString(
      string.concat(
        "WorldIDRegister deployed at: ", vm.toString(address(worldIDRegister))
      )
    );
  }
}
