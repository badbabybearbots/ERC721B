// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../extensions/ERC721BBurnable.sol";

import "./ERC721BMockVanilla.sol";

contract ERC721BMockBurnable is 
  ERC721BMockVanilla,
  ERC721BBurnable
{ 
  /**
   * @dev Sets the name, symbol
   */
  constructor(string memory name, string memory symbol) 
    ERC721BMockVanilla(name, symbol) {}

  // ============ Overrides ============

  /**
   * @dev Describes linear override for `ownerOf` used in 
   * both `ERC721B`, `ERC721BBurnable` and `IERC721`
   */
  function ownerOf(uint256 tokenId) 
    public 
    view 
    virtual 
    override(ERC721BBurnable, IERC721)
    returns(address) 
  {
    return super.ownerOf(tokenId);
  }

  /**
   * @dev Describes linear override for `totalSupply` used in 
   * both `ERC721B` and `ERC721BBurnable`
   */
  function totalSupply() 
    public 
    virtual 
    view 
    override(ERC721B, ERC721BBurnable) 
    returns(uint256) 
  {
    return super.totalSupply();
  }

  /**
   * @dev Describes linear override for `_exists` used in 
   * both `ERC721B` and `ERC721BBurnable`
   */
  function _exists(uint256 tokenId) 
    internal 
    view 
    virtual 
    override(ERC721B, ERC721BBurnable) 
    returns(bool) 
  {
    return super._exists(tokenId);
  }
}