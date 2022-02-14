// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "erc721a/contracts/extensions/ERC721ABurnable.sol";
import "erc721a/contracts/ERC721A.sol";

contract ERC721AMockBurnable is ERC721A, ERC721ABurnable {
  constructor(string memory name_, string memory symbol_) ERC721A(name_, symbol_) {}

  function mint(uint256 quantity) external {
    _safeMint(msg.sender, quantity);
  }
}