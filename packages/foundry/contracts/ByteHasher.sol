// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToFieldSixtyNine(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}