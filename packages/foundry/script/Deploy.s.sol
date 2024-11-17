//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployMockHumanOracle } from "./DeployMockHumanOracle.s.sol";
import { DeployHumanOracle } from "./DeployHumanOracle.s.sol";
import { DeployWorldIDRegister } from "./DeployWorldIDRegister.s.sol";
import { DeployHumanOracleV1 } from "./DeployHumanOracleV1.s.sol";

contract DeployScript is ScaffoldETHDeploy {
  function run() external {
    // DeployMockHumanOracle deployMockHumanOracle = new DeployMockHumanOracle();
    // deployMockHumanOracle.run();

    // DeployHumanOracle deployHumanOracle = new DeployHumanOracle();
    // deployHumanOracle.run();

    // DeployHumanOracleWithVault deployHumanOracleWithVault = new DeployHumanOracleWithVault();
    // deployHumanOracleWithVault.run();

    DeployHumanOracleV1 deployHumanOracleV1 = new DeployHumanOracleV1();
    deployHumanOracleV1.run();

    // DeployWorldIDRegister worldIDregister = new DeployWorldIDRegister();
    // worldIDregister.run();

    // deploy more contracts here
    // DeployMyContract deployMyContract = new DeployMyContract();
    // deployMyContract.run();
  }
}
