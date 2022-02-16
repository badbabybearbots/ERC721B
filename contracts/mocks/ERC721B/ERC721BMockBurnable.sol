// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../extensions/ERC721BBurnable.sol";

contract ERC721BMockBurnable is ERC721BBurnable {
  constructor(string memory name_, string memory symbol_) ERC721B(name_, symbol_) {}

  function mint(uint256 quantity) external {
    _safeMint(msg.sender, quantity);
  }
}