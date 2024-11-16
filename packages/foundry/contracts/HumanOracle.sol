//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IDKitWidget } from '@worldcoin/idkit';
// import "forge-std/console.sol";

contract HumanOracle {
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
		Option[] answers;
		uint256  totalStake;
	}

	struct Vote {
		uint256  id;
		string   question;
		string[] answers;
		uint256  startBlock;
		uint256  durationInBlocks;
	}

	// ====================
	// ==== Variables =====
	// ====================

	// public
	mapping (uint256 => Stake) public stakesForVoteIds;
	mapping (address => User) public users;
	Vote[] votes;

	// private
	mapping (uint256 => bool) private nullifierHashes;

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

	modifier onlyNewUser() {
		require(users[msg.sender].nullifierHash == uint256(0), "user already signed up");
		_;
	}

	modifier hasNotVoted(uint256 voteId) {
		uint256 answerCount = getStakeAnswerCount(voteId);
		address userAddr = address(msg.sender);
		for (uint i = 0; i < answerCount; i++) {
			bool hasVoted = hasUserVotedForStakeAnswer(userAddr, voteId, i);
			if (hasVoted == true) {
				revert("user already voted");
			}
		}
		_;
	}

	modifier voteActive(uint256 voteId) {
		require(getVoteStartBlock(voteId) <= block.number, "vote has not started");
		require(getVoteStartBlock(voteId) + getVoteDurationInBlocks(voteId) >= block.number, "vote has ended");
		_;
	}

	modifier voteEnded(uint256 voteId) {
		require(getVoteStartBlock(voteId) + getVoteDurationInBlocks(voteId) < block.number, "vote still active");
		_;
	}

	modifier userExists() {
		if (users[address(msg.sender)].nullifierHash == 0) {
			revert("user not existing");
		}
		_;
	}

	modifier userOldEnough(uint256 voteId) {
		if (users[address(msg.sender)].createdAtBlock > getVoteStartBlock(voteId)) {
			revert("user was created after voting begun");
		}
		_;
	}

	// ====================
	// === Constructor ====
	// ====================

	constructor(address worldIdRouterAddr) public {

	}

	// ====================
	// ==== Functions =====
	// ====================

	// external

	function signUpWithWorldId(uint256 merkleRoot, uint256 nullifierHash, uint256[8] calldata proof) onlyNewUser() external {
		address userAddr = address(msg.sender);

		if (nullifierHashes[nullifierHash] == true) {
			revert ("nullifierHash already existing");
		}
		worldIdRouter.verifyProof(
			merkleRoot,
			groupId, // set to "1" in the constructor
			abi.encodePacked(userAddr).hashToField(),
			nullifierHash,
			externalNullifierHash,
			proof
		);
		nullifierHashes[nullifierHash] = true;

		User memory newUser = User({
			nullifierHash: nullifierHash,
			createdAtBlock: block.number
		});
		users[userAddr] = newUser;
		emit UserRegistered(userAddr, users[userAddr].nullifierHash, users[userAddr].createdAtBlock);
	}

	function submitVotingDecisionWithStake(uint256 voteId, uint256 answerIndex, uint256 amount) userOldEnough(voteId) userExists() hasNotVoted(voteId) voteActive(voteId) external {
		require(amount <= 5, "max staking amount is 5");
		address userAddr = address(msg.sender);
		stakeForAnswer(userAddr, voteId, answerIndex, amount);
		emit VoteSubmitted(userAddr, voteId, answerIndex, amount);
	}

	function claimRewardForVote(uint256 voteId) voteEnded(voteId) external returns (uint256) {
		address userAddr = address(msg.sender);
		uint256 payout = getStakeResolvedUserAmount(userAddr, voteId);
		emit RewardClaimed(userAddr, voteId, payout);
		return payout;
	}

	function isUserRegistered(address userAddr) external view returns (bool) {
		if (users[userAddr].nullifierHash != 0) {
			return true;
		} else {
			return false;
		}
	}

	function createVote(string calldata question, string[] calldata answers, uint256 startBlock, uint256 durationInBlocks) external {
		uint256 voteId = votes.length;
		Vote memory newVote = Vote({
			id: voteId,
			question: question,
			answers: answers,
			startBlock: startBlock,
			durationInBlocks: durationInBlocks
		});
		votes.push(newVote);

		createNewStake(voteId);

		emit VoteCreated(votes[voteId].id, votes[voteId].question, votes[voteId].startBlock, votes[voteId].durationInBlocks);
	}

	function getVotingPage(uint256 voteId) external view returns (
		string memory question,
		string[] memory answers,
		uint256 totalStake,
		uint256[] memory stakePerAnswer
	) {
		uint256 answerCount = getStakeAnswerCount(voteId);
		totalStake = getStakeTotalStake(voteId);
		stakePerAnswer = new uint256[](answerCount);

		for (uint i = 0; i < answerCount; i++) {
			stakePerAnswer[i] = getStakeAnswerStake(voteId, i);
		}

		return (getVoteQuestion(voteId), getVoteAnswers(voteId), totalStake, stakePerAnswer);
	}	

	function getVotingList() external view returns (
		uint256[] memory ids,
		string[] memory questions,
		uint256[] memory totalStakes
	) {
		uint256 voteCount = getVoteCount();
		ids = new uint256[](voteCount);
		questions = new string[](voteCount);
		totalStakes = new uint256[](voteCount);	

		for (uint i = 0; i < voteCount; i++) {
			ids[i] = i;
			questions[i] = getVoteQuestion(i);
			totalStakes[i] = getStakeTotalStake(i);
		}

		return (ids, questions, totalStakes);
	}

	// internal

	// stake related
	function createNewStake(uint256 voteId) internal {
		Stake storage newStake = stakesForVoteIds[voteId];
		uint256 answerCount = votes[voteId].answers.length;
		for (uint i = 0; i < answerCount; i++) {
			newStake.answers.push();
		}
	}

	function stakeForAnswer(address userAddr, uint256 voteId, uint256 answerIndex, uint256 amount) internal {
		stakesForVoteIds[voteId].answers[answerIndex].userStakes[userAddr] = amount;
		stakesForVoteIds[voteId].answers[answerIndex].totalStake += amount;
		stakesForVoteIds[voteId].totalStake += amount;
	}

	function getStakeResolvedUserAmount(address userAddr, uint256 voteId) internal view returns (uint256 amount) {
		uint256 highestStakeAnswerIndex = getStakeHighestAnswerIndex(voteId);
		if (!hasUserVotedForStakeAnswer(userAddr, voteId, highestStakeAnswerIndex)) {
			return 0;
		}
		uint256 userStake = getUserStakeOfStakeAnswer(userAddr, voteId, highestStakeAnswerIndex);
		uint256 totalStake = getStakeTotalStake(voteId);
		uint256 answerStake = getStakeAnswerStake(voteId, highestStakeAnswerIndex);
		uint256 userPayout = totalStake / answerStake * userStake;
		return userPayout;
	}

	function getStakeHighestAnswerIndex(uint256 voteId) internal view returns (uint256 answerIndex) {
		uint256 answerCount = getStakeAnswerCount(voteId);
		uint256 highestAmount = 0;
		uint256 highestIndex = 0;

		for (uint i = 0; i < answerCount; i++) {
			uint256 answerStake = getStakeAnswerStake(voteId, i);
			if (highestAmount < answerStake) {
				highestAmount = answerStake;
				highestIndex = i;
			}
		}
		return highestIndex;
	}

	function getStakeAnswerStake(uint256 voteId, uint256 answerIndex) internal view returns (uint256 stake) {
		return stakesForVoteIds[voteId].answers[answerIndex].totalStake;
	}

	function getStakeAnswerCount(uint256 voteId) internal view returns (uint256 count) {
		return stakesForVoteIds[voteId].answers.length;
	}

	function getStakeTotalStake(uint256 voteId) internal view returns (uint256 stake) {
		return stakesForVoteIds[voteId].totalStake;
	}

	function hasUserVotedForStakeAnswer(address userAddr, uint256 voteId, uint256 answerIndex) internal view returns (bool voted) {
		if (stakesForVoteIds[voteId].answers[answerIndex].userStakes[userAddr] != 0) {
			return true;
		} else {
			return false;
		}
	}

	function getUserStakeOfStakeAnswer(address userAddr, uint256 voteId, uint256 answerIndex) internal view returns (uint256 amount) {
		return stakesForVoteIds[voteId].answers[answerIndex].userStakes[userAddr];
	}

	// vote related
	function getVoteCount() internal view returns (uint256 count) {
		return votes.length;
	}

	function getVoteQuestion(uint256 voteId) internal view returns (string memory question) {
		return votes[voteId].question;
	}

	function getVoteAnswers(uint256 voteId) internal view returns (string[] memory answers) {
		return votes[voteId].answers;
	}

	function getVoteStartBlock(uint256 voteId) internal view returns (uint256 startBlock) {
		return votes[voteId].startBlock;
	}

	function getVoteDurationInBlocks(uint256 voteId) internal view returns (uint256 durationInBlocks) {
		return votes[voteId].durationInBlocks;
	}
}