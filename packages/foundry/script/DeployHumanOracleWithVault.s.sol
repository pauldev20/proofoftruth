//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/HumanOracleWithVault.sol";
import "./DeployHelpers.s.sol";

contract DeployHumanOracleWithVault is ScaffoldETHDeploy {

  address public worldIdAddr = 0x17B354dD2595411ff79041f930e491A4Df39A278;
  address public worldToken = 0x2cFc85d8E48F8EAB294be644d9E25C3030863003;
  address public permit2 = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
  address public owner = 0x4639B9F663C14Bad89Ddcc16966e85Bc81dCCD40;
  uint256 public groupId = 1;
  string public appId = "app_485be80eb191bba1e603c1aeb6743660";
  string public action = "registration";

  function run() external ScaffoldEthDeployerRunner {
    HumanOracleWithVault humanOracleWithVault = new HumanOracleWithVault(worldIdAddr, worldToken, groupId, appId, action, permit2, owner);
    console.logString(
      string.concat(
        "HumanOracle deployed at: ", vm.toString(address(humanOracleWithVault))
      )
    );
  }
}
