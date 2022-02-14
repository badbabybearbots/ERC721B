// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../ERC721B.sol";

contract ERC721BMockVanilla is ERC721B {
  constructor(string memory name_, string memory symbol_) ERC721B(name_, symbol_) {}

  function mint(uint256 quantity) external {
    _safeMint(msg.sender, quantity);
  }
}