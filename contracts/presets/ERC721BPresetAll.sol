// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../extensions/ERC721BBurnable.sol";
import "../extensions/ERC721BPausable.sol";
import "../extensions/ERC721BStaticTokenURI.sol";
import "../extensions/ERC721BContractURIStorage.sol";

import "./ERC721BPresetStandard.sol";

contract ERC721BPresetAll is 
  Ownable, 
  ERC721BPresetStandard,
  ERC721BBurnable,
  ERC721BPausable,
  ERC721BStaticTokenURI,
  ERC721BContractURIStorage
{ 
  using Strings for uint256;

  /**
   * @dev Sets the name, symbol, contract URI
   */
  constructor(
    string memory name, 
    string memory symbol, 
    string memory uri
  ) ERC721BPresetStandard(name, symbol) {
    _setContractURI(uri);
  }

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
   * @dev Allows curators to set the base token uri
   */
  function setBaseTokenURI(string memory uri) 
    external virtual onlyOwner
  {
    _setBaseURI(uri);
  }

  /**
   * @dev Allows curators to set a token uri
   */
  function setTokenURI(uint256 tokenId, string memory uri) 
    external virtual onlyOwner
  {
    _setTokenURI(tokenId, uri);
  }

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId) 
    public 
    view 
    virtual 
    override(ERC721BStaticTokenURI, IERC721Metadata)
    returns(string memory) 
  {
    if(!_exists(tokenId)) revert NonExistentToken();

    string memory _tokenURI = staticTokenURI(tokenId);
    string memory base = baseTokenURI();

    // If there is no base URI, return the token URI.
    if (bytes(base).length == 0) {
      return _tokenURI;
    }
  
    // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
    if (bytes(_tokenURI).length > 0) {
      return string(abi.encodePacked(base, _tokenURI));
    }

    return bytes(base).length > 0 ? string(
      abi.encodePacked(base, tokenId.toString())
    ) : "";
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
   * @dev Describes linear override for `_beforeTokenTransfers` used in 
   * both `ERC721B` and `ERC721BPausable`
   */
  function _beforeTokenTransfers(
    address from,
    address to,
    uint256 startTokenId,
    uint256 amount
  ) internal virtual override(ERC721B, ERC721BPausable) {
    super._beforeTokenTransfers(from, to, startTokenId, amount);
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