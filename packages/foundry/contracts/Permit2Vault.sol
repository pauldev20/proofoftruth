// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "../interfaces/IPermit2.sol";
import "../interfaces/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";

// Trivial vault that allows users to deposit ERC20 tokens then claim them later.
contract Permit2Vault {
    bool private _reentrancyGuard;
    // The canonical permit2 contract.
    IPermit2 public immutable PERMIT2;
    // User -> token -> deposit balance
    mapping (address => mapping (IERC20 => uint256)) public tokenBalancesByUser;
    uint256 public totalBalance;

    constructor(address _permit, address _owner) {
        PERMIT2 = IPermit2(_permit);
    }

    // Prevents reentrancy attacks via tokens with callback mechanisms. 
    modifier nonReentrant() {
        require(!_reentrancyGuard, 'no reentrancy');
        _reentrancyGuard = true;
        _;
        _reentrancyGuard = false;
    }

    event Deposited(address from, uint256 amount);
    event Withdrawn(address to, uint256 amount);

    // Deposit some amount of an ERC20 token from the caller
    // into this contract using Permit2.
    function depositERC20(
        address userAddr,
        IERC20 token,
        uint256 amount,
        uint256 nonce,
        uint256 deadline,
        bytes calldata signature
    ) external nonReentrant {
        // Credit the caller.
        tokenBalancesByUser[userAddr][token] += amount;
        totalBalance += amount;
        // Transfer tokens from the caller to ourselves.
        PERMIT2.permitTransferFrom(
            // The permit message. Spender will be inferred as the caller (us).
            IPermit2.PermitTransferFrom({
                permitted: IPermit2.TokenPermissions({
                    token: token,
                    amount: amount
                }),
                nonce: nonce,
                deadline: deadline
            }),
            // The transfer recipient and amount.
            IPermit2.SignatureTransferDetails({
                to: address(this),
                requestedAmount: amount
            }),
            // The owner of the tokens, which must also be
            // the signer of the message, otherwise this call
            // will fail.
            userAddr,
            // The packed signature that was the result of signing
            // the EIP712 hash of `permit`.
            signature
        );

        emit Deposited(userAddr, amount);
    }

    function depositERC20Regular(address userAddr, IERC20 token, uint256 amount) external {
        tokenBalancesByUser[userAddr][token] += amount;
        totalBalance += amount;
        token.transferFrom(userAddr, address(this), amount);
        emit Deposited(userAddr, amount);
    }

    // Return ERC20 tokens deposited by the caller.
    function withdrawERC20(address userAddr, IERC20 token, uint256 amount) external nonReentrant {
        tokenBalancesByUser[userAddr][token] -= amount;
        totalBalance -= amount;
        // TODO: In production, use an ERC20 compatibility library to
        // execute thie transfer to support non-compliant tokens.
        token.transfer(userAddr, amount);
        emit Withdrawn(userAddr, amount);
    }

    function _toTokenPermissionsArray(IERC20[] calldata tokens, uint256[] calldata amounts)
        private pure returns (IPermit2.TokenPermissions[] memory permissions)
    {
        permissions = new IPermit2.TokenPermissions[](tokens.length);
        for (uint256 i; i < permissions.length; ++i) {
            permissions[i] = IPermit2.TokenPermissions({ token: tokens[i], amount: amounts[i] });
        }
    }

    // function rescueTokens(IERC20 token, address recipient) external {
    //     token.transfer(recipient, totalBalance);
    // }
}