//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/HumanOracleV1.sol";
import "./DeployHelpers.s.sol";

contract DeployHumanOracleV1 is ScaffoldETHDeploy {

  address public worldIdAddr = 0x17B354dD2595411ff79041f930e491A4Df39A278;
  uint256 public groupId = 1;
  string public appId = "app_22ea9fb73d53333c2997e8f16e60cc6b";
  string public action = "registration";
  address public worldToken = 0x2cFc85d8E48F8EAB294be644d9E25C3030863003;
  address public permit = 0x000000000022D473030F116dDEE9F6B43aC78BA3;
  address public owner = 0x4639B9F663C14Bad89Ddcc16966e85Bc81dCCD40;

  function run() external ScaffoldEthDeployerRunner {
    Permit2Vault vault = new Permit2Vault(permit, owner);
    HumanOracleV1 humanOracle = new HumanOracleV1(worldIdAddr, groupId, appId, action, worldToken, address(vault));
    console.logString(
      string.concat(
        "HumanOracleWithWorldIdRegister deployed at: ", vm.toString(address(humanOracle))
      )
    );
  }
}
