// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract ERC721MockBurnable is ERC721, ERC721Burnable {
  uint256 private _lastId;
  constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

  function mint(uint256 quantity) external {
    for (uint256 i; i < quantity; i++) {
      _safeMint(msg.sender, ++_lastId);
    }
  }
}