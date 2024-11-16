//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
// import "forge-std/console.sol";

contract MockHumanOracle {
	// ====================
	// ====== Structs =====
	// ====================
	
	struct User {
		uint256 nullifierHash;
		uint256 createdAtBlock;
	}

	struct Option {
		uint256                      totalStake;
		mapping (address => uint256) userStakes;
	}

	struct Stake {
		Option[] options;
		uint256  totalStake;
	}

	struct Vote {
		uint256  id;
		string   question;
		string[] answers;
		uint256  startBlock;
		uint256  durationInBlocks;
		Stake    stake;
	}

	// ====================
	// ==== Variables =====
	// ====================

	mapping (address => User) users;
	Vote[]                    votes;

	// ====================
	// ====== Events ======
	// ====================

	event UserRegistered(address indexed user, uint256 nullifierHash, uint256 createdAtBlock);

	event VoteCreated(uint256 indexed voteId, string question, uint256 startBlock, uint256 durationInBlocks);

	event VoteSubmitted(address indexed user, uint256 indexed voteId, uint256 answerIndex, uint256 stakeAmount);

	event RewardClaimed(address indexed user, uint256 indexed voteId, uint256 rewardAmount);

	// ====================
	// ==== Modifiers =====
	// ====================

	// ====================
	// === Constructor ====
	// ====================

	// ====================
	// ==== Functions =====
	// ====================

	// external

	function signUpWithWorldId(uint256 nullifierHash, uint256[8] calldata proof) external {
		emit UserRegistered(address(msg.sender), nullifierHash, block.number);
	}

	function submitVotingDecisionWithStake(uint256 voteId, uint256 answerIndex, uint256 stake) external {
		emit VoteSubmitted(address(msg.sender), voteId, answerIndex, stake);
	}

	function claimRewardForVote(uint256 voteId) external {
		emit RewardClaimed(address(msg.sender), voteId, 10);
	}

	function isUserRegistered(address userAddr) external pure returns (bool) {
		if (userAddr == address(0))
			return false;
		else
			return true;
	}

	function createVote(string calldata question, string[] calldata answers, uint256 startBlock, uint256 durationInBlocks) external {
		emit VoteCreated(0, question, startBlock, durationInBlocks);
	}

	function getVotingPage(uint256 voteId) external pure returns (
		string memory question,
		string[] memory answers,
		uint256 totalStake,
		uint256[] memory stakePerAnswer
	) {
		// Mock Data based on voteId
		if (voteId == 1) {
			question = "What is your favorite blockchain?";
			answers = new string[](3);
			answers[0] = "Ethereum";
			answers[1] = "Binance Smart Chain";
			answers[2] = "Polkadot";	
			totalStake = 1000;	
			stakePerAnswer = new uint256[](3);
			stakePerAnswer[0] = 600; // Ethereum
			stakePerAnswer[1] = 300; // Binance Smart Chain
			stakePerAnswer[2] = 100; // Polkadot
		}
		else if (voteId == 2) {
			question = "Which DeFi project do you trust the most?";
			answers = new string[](2);
			answers[0] = "Uniswap";
			answers[1] = "Aave";	
			totalStake = 500;	
			stakePerAnswer = new uint256[](2);
			stakePerAnswer[0] = 350;
			stakePerAnswer[1] = 150;
		}
		else {
			question = new string(0);
			answers = new string[](0);
			totalStake = 0;
			stakePerAnswer = new uint256[](0);
		}
		return (question, answers, totalStake, stakePerAnswer);
	}	

	function getVotingList() external pure returns (
		uint256[] memory ids,
		string[] memory questions,
		uint256[] memory totalStakes
	) {
		uint256 numberOfVotes = 2;	
		ids = new uint256[](numberOfVotes);
		questions = new string[](numberOfVotes);
		totalStakes = new uint256[](numberOfVotes);	

		ids[0] = 1;
		questions[0] = "What is your favorite blockchain?";
		totalStakes[0] = 1000;	

		ids[1] = 2;
		questions[1] = "Which DeFi project do you trust the most?";
		totalStakes[1] = 500;

		return (ids, questions, totalStakes);
	}
}