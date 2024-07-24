// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./Token.sol";

contract TokenFactory {
    event TokenDeployed(address indexed tokenAddress, address indexed owner);

    function createToken(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 initialSupply
    ) external {
        address tokenAddress = address(
            new Token(name, symbol, decimals, initialSupply, msg.sender)
        );
        emit TokenDeployed(tokenAddress, msg.sender);
    }
}
