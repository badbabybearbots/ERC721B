// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../extensions/ERC721Metadata.sol";
import "../../extensions/ERC721BBaseTokenURI.sol";

contract ERC721BMockVanilla is 
  ERC721Metadata, 
  ERC721BBaseTokenURI
{ 
  constructor(string memory name, string memory symbol) 
    ERC721Metadata(name, symbol) {}

  function mint(uint256 quantity) external {
    _safeMint(msg.sender, quantity);
  }
}