// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "../extensions/ERC721BBurnable.sol";
import "../extensions/ERC721BPausable.sol";

contract ERC721BPresetBurnablePausable is 
  Ownable, 
  ERC721BBurnable, 
  ERC721BPausable 
{
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

  /**
   * @dev Describes linear override for `_beforeTokenTransfer` used in 
   * both `ERC721B` and `ERC721BPausable`
   */
  function _beforeTokenTransfers(
    address from,
    address to,
    uint256 startTokenId,
    uint256 quantity
  ) internal virtual override(ERC721B, ERC721BPausable) {
    super._beforeTokenTransfers(from, to, startTokenId, quantity);
  }
}