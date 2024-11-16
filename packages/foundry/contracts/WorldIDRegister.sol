//SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IWorldID} from "../lib/world-id-onchain-template/contracts/src/interfaces/IWorldID.sol";
import {ByteHasher} from "./ByteHasher.sol";
// import "forge-std/console.sol";

contract WorldIdRegister {

	using ByteHasher for bytes;

	// ====================
	// ====== Structs =====
	// ====================

	struct User {
		uint256 nullifierHash;
		uint256 createdAtBlock;
	}

	// ====================
	// ==== Variables =====
	// ====================

	// public
	IWorldID public worldId;
	mapping (address => User) public users;

	// private
	mapping (uint256 => bool) private registeredNullifierHashes;
	uint256 internal immutable groupId = 1;
	uint256 internal immutable externalNullifierHash;

	// ====================
	// ====== Events ======
	// ====================

	event UserRegistered(address indexed user, uint256 nullifierHash, uint256 createdAtBlock);

	// ====================
	// ==== Modifiers =====
	// ====================

	modifier onlyNewUser() {
		require(users[msg.sender].nullifierHash == uint256(0), "user already signed up");
		_;
	}

	// security measurement
	// modifier userOldEnough(uint256 voteId) {
	// 	if (users[address(msg.sender)].createdAtBlock > getVoteStartBlock(voteId)) {
	// 		revert("user was created after voting begun");
	// 	}
	// 	_;
	// }

	// ====================
	// === Constructor ====
	// ====================

	constructor(address _worldIdAddr, uint256 _groupId, string memory _appId, string memory _action) {
		worldId = IWorldID(_worldIdAddr);
		groupId = _groupId;
		externalNullifierHash = abi.encodePacked(abi.encodePacked(_appId).hashToField(), _action).hashToField();
	}

	// ====================
	// ==== Functions =====
	// ====================

	// external

	function signUpWithWorldId(bytes memory data) onlyNewUser() external {
		address userAddr = address(msg.sender);

		(
			uint256 merkleRoot,
			uint256 nullifierHash,
			uint256[8] memory proof
		) = abi.decode(data, (uint256, uint256, uint256[8]));

		if (registeredNullifierHashes[nullifierHash] == true) {
			revert ("nullifierHash already existing");
		}
		worldId.verifyProof(
			merkleRoot,
			groupId,
			abi.encodePacked(userAddr).hashToField(),
			nullifierHash,
			externalNullifierHash,
			proof
		);
		registeredNullifierHashes[nullifierHash] = true;

		User memory newUser = User({
			nullifierHash: nullifierHash,
			createdAtBlock: block.number
		});
		users[userAddr] = newUser;
		emit UserRegistered(userAddr, users[userAddr].nullifierHash, users[userAddr].createdAtBlock);
	}
}