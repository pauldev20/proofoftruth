// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../contracts/HumanOracle.sol";

contract TestHumanOracle is Test {
	HumanOracle public ho;

	string[] public answers;

	function setUp() public {
		ho = new HumanOracle();
	}

	function test_signUpWithWorldId() public {
		uint256 merkleRoot = uint256(420);
		uint256 nullifierHash = uint256(42);
		uint256[8] memory proof =  [uint256(69), 69, 69, 69, 69, 69, 69, 69];
		address userAddr = address(this);
	
		ho.signUpWithWorldId(merkleRoot, nullifierHash, proof);

		(uint256 fetchedNullifierHash, uint256 fetchedCreatedAtBlock) = ho.users(userAddr);

		assertEq(fetchedNullifierHash, nullifierHash);
		assertEq(fetchedCreatedAtBlock, vm.getBlockNumber());
	}

	function test_isUserRegistered() public {
		test_signUpWithWorldId();
		bool registered = ho.isUserRegistered(address(this));
		assertEq(registered, true);
		registered = ho.isUserRegistered(address(0));
		assertEq(registered, false);
	}

	function testFail_signUpAgain() public {
		test_signUpWithWorldId();
		test_signUpWithWorldId();
	}

	function test_createVote() public {
		string memory question = "who gonna be president?";
		answers.push("donlad tremp");
		answers.push("komela herizz");
		uint256 startBlock = vm.getBlockNumber();
		uint256 durationInBlocks = 10;

		ho.createVote(question, answers, startBlock, durationInBlocks);

		(string memory _question, string[] memory _answers, uint256 _totalStake, uint256[] memory _stakePerAnswer) = ho.getVotingPage(0);
		assertEq(_question, question);
		assertEq(_answers[0], answers[0]);
		assertEq(_answers[1], answers[1]);
		assertEq(_totalStake, 0);
		assertEq(_stakePerAnswer[0], 0);
	}

	function test_getVotingList() public {
		test_createVote();
		string memory question = "when btc 200k?";
		answers.push("novumber");
		answers.push("jenuery");
		uint256 startBlock = vm.getBlockNumber();
		uint256 durationInBlocks = 10;

		ho.createVote(question, answers, startBlock, durationInBlocks);

		(uint256[] memory _ids, string[] memory _questions, uint256[] memory _totalStakes) = ho.getVotingList();
		assertEq(_ids.length, 2);
		assertEq(_questions[0], "who gonna be president?");
		assertEq(_questions[1], "when btc 200k?");
		assertEq(_totalStakes[0], 0);
		assertEq(_totalStakes[1], 0);
	}

	function test_submitVotingDecisionWithStake() public {
		test_signUpWithWorldId();
		test_createVote();
		ho.submitVotingDecisionWithStake(0, 0, 5);
	}

	function testFail_voteEnded() public {
		test_signUpWithWorldId();
		test_createVote();
		vm.roll(20);
		ho.submitVotingDecisionWithStake(0, 0, 10);
	}

	function testFail_doubleVoting() public {
		test_signUpWithWorldId();
		test_createVote();
		ho.submitVotingDecisionWithStake(0, 0, 10);
		ho.submitVotingDecisionWithStake(0, 1, 10);
	}

	function test_claimRewardForVote() external {
		test_submitVotingDecisionWithStake();
		vm.roll(20);
		uint256 payout = ho.claimRewardForVote(0);
		assertEq(payout, 5, "payout incorrect");
	}
}
