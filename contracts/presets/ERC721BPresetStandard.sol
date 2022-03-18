// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../extensions/ERC721Metadata.sol";
import "../extensions/ERC721BBaseTokenURI.sol";

contract ERC721BPresetStandard is 
  Ownable, 
  ERC721Metadata, 
  ERC721BBaseTokenURI
{ 
  /**
   * @dev Sets the name, symbol
   */
  constructor(string memory name, string memory symbol) 
    ERC721Metadata(name, symbol) {}

  /**
   * @dev Allows owner to mint
   */
  function mint(address to, uint256 quantity) external onlyOwner {
    _safeMint(to, quantity);
  }
}