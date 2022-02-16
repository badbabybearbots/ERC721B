// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../extensions/ERC721BURIContract.sol";

import "../extensions/ERC721BBurnable.sol";
import "../extensions/ERC721BPausable.sol";
import "../extensions/ERC721BURIBase.sol";
import "../extensions/ERC721BURIStorage.sol";

contract ERC721BPresetAll is
  Ownable,
  AccessControlEnumerable,
  ERC721BBurnable, 
  ERC721BPausable,
  ERC721BURIBase,
  ERC721BURIContract,
  ERC721BURIStorage
{
  // ============ Constants ============

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  bytes32 public constant CURATOR_ROLE = keccak256("CURATOR_ROLE");

  // ============ Deploy ============

  /**
   * @dev Sets the name, symbol and contract uri
   */
  constructor(
    string memory name_, 
    string memory symbol_, 
    string memory uri_
  ) ERC721B(name_, symbol_) {
    _setContractURI(uri_);

    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

    _setupRole(MINTER_ROLE, _msgSender());
    _setupRole(PAUSER_ROLE, _msgSender());
    _setupRole(CURATOR_ROLE, _msgSender());
  }

  // ============ Read Methods ============

  /**
   * @dev See {IERC721-ownerOf}.
   */
  function ownerOf(uint256 tokenId) 
    public 
    view 
    virtual 
    override(ERC721B, ERC721BBurnable) 
    returns(address) 
  {
    return super.ownerOf(tokenId);
  }

  /**
   * @dev Describes linear override for `supportsInterface` used in 
   * both `ERC721B` and `AccessControlEnumerable`
   */
  function supportsInterface(bytes4 interfaceId) 
    public 
    view 
    virtual 
    override(ERC721B, AccessControlEnumerable) 
    returns(bool) 
  {
    return super.supportsInterface(interfaceId);
  }

  /**
   * @dev Describes linear override for `tokenURI` used in 
   * both `ERC721B` and `ERC721BURIStorage`
   */
  function tokenURI(uint256 tokenId) 
    public 
    view 
    virtual 
    override(ERC721B, ERC721BURIStorage) 
    returns(string memory) 
  {
    return super.tokenURI(tokenId);
  }

  // ============ Write Methods ============

  /**
   * @dev Allows minters to mint
   */
  function mint(address to, uint256 quantity) 
    external onlyRole(MINTER_ROLE) 
  {
    _safeMint(to, quantity);
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
  function pause() public virtual onlyRole(PAUSER_ROLE) {
    _pause();
  }

  /**
   * @dev Allows curators to set the base token uri
   */
  function setBaseTokenURI(string memory uri) 
    external virtual onlyRole(CURATOR_ROLE)
  {
    _setBaseURI(uri);
  }

  /**
   * @dev Allows curators to set a token uri
   */
  function setTokenURI(uint256 tokenId, string memory uri) 
    external virtual onlyRole(CURATOR_ROLE)
  {
    _setTokenURI(tokenId, uri);
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
  function unpause() public virtual onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  // ============ Internal Methods ============
  
  /**
   * @dev Describes linear override for `_baseURI` used in 
   * both `ERC721B` and `ERC721BURIBase`
   */
  function _baseURI() 
    internal 
    view 
    virtual 
    override(ERC721B, ERC721BURIBase) 
    returns(string memory)
  {
    return super._baseURI();
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

  /**
   * @dev Returns whether `tokenId` exists.
   *
   * Tokens can be managed by their owner or approved accounts via 
   * {approve} or {setApprovalForAll}.
   *
   * Tokens start existing when they are minted (`_mint`),
   * and stop existing when they are burned (`_burn`).
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