// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/HumanOracle.sol";

contract TestHumanOracle is Test {
	HumanOracle public ho;

	function setUp() public {
		ho = new HumanOracle();
	}

	function test_signUpWithWorldId() public {
		uint256 nullifierHash = uint256(42);
		uint256[8] memory proof =  [uint256(69), 69, 69, 69, 69, 69, 69, 69];
		address userAddr = address(this);
	
		ho.signUpWithWorldId(nullifierHash, proof);

		(uint256 fetchedNullifierHash, uint256 fetchedCreatedAtBlock) = ho.users(userAddr);

		assertEq(fetchedNullifierHash, nullifierHash);
		assertEq(fetchedCreatedAtBlock, vm.getBlockNumber());
	}

	function testFail_signUpAgain() public {
		test_signUpWithWorldId();
		test_signUpWithWorldId();
	}
}
