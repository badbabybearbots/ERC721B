// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../extensions/ERC721BBurnable.sol";
import "../extensions/ERC721BPausable.sol";

import "./ERC721BPresetStandard.sol";

contract ERC721BPresetBurnablePausable is 
  Ownable, 
  ERC721BPresetStandard,
  ERC721BBurnable,
  ERC721BPausable
{ 
  /**
   * @dev Sets the name, symbol
   */
  constructor(string memory name, string memory symbol) 
    ERC721BPresetStandard(name, symbol) {}

  /**
   * @dev Pauses all token transfers.
   *
   * See {ERC721Pausable} and {Pausable-_pause}.
   *
   * Requirements:
   *
   * - the caller must have the `PAUSER_ROLE`.
   */
  function pause() public virtual onlyOwner {
    _pause();
  }

  /**
   * @dev Unpauses all token transfers.
   *
   * See {ERC721Pausable} and {Pausable-_unpause}.
   *
   * Requirements:
   *
   * - the caller must have the `PAUSER_ROLE`.
   */
  function unpause() public virtual onlyOwner {
    _unpause();
  }

  // ============ Overrides ============

  /**
   * @dev Describes linear override for `ownerOf` used in 
   * both `ERC721B`, `ERC721BBurnable` and `IERC721`
   */
  function ownerOf(uint256 tokenId) 
    public 
    view 
    virtual 
    override(ERC721B, ERC721BBurnable, IERC721)
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
   * @dev Describes linear override for `_doMint` used in 
   * both `ERC721B` and `ERC721BPausable` 
   */
  function _doMint(
    address to,
    uint256 amount,
    uint256 startTokenId
  ) internal virtual override(ERC721B, ERC721BPausable)  {
    super._doMint(to, amount, startTokenId);
  }

  /**
   * @dev Describes linear override for `_doTransfer` used in 
   * both `ERC721B` and `ERC721BPausable`
   */
  function _doTransfer(address from, address to, uint256 tokenId) 
    internal virtual override(ERC721B, ERC721BPausable)
  {
    super._doTransfer(from, to, tokenId);
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