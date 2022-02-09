// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../ERC721B.sol";

contract ERC721BVanilla is ERC721B, Ownable {
  /**
   * @dev Sets the name, symbol
   */
  constructor(string memory name_, string memory symbol_) 
    ERC721B(name_, symbol_) 
  {}

  /**
   * @dev Allows owner to mint
   */
  function mint(address to, uint256 quantity) external onlyOwner {
    _safeMint(to, quantity);
  }
}