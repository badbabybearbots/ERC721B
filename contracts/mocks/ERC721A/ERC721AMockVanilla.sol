// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "erc721a/contracts/ERC721A.sol";

contract ERC721AMockVanilla is ERC721A {
  constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

  function mint(uint256 quantity) external {
    _safeMint(msg.sender, quantity);
  }
}