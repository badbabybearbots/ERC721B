// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../extensions/ERC721BContractURIStorage.sol";
import "../extensions/ERC721BStaticTokenURI.sol";
import "./ERC721BPresetStandard.sol";

contract ERC721BPresetURIStorage is
  ERC721BPresetStandard,
  ERC721BContractURIStorage,
  ERC721BStaticTokenURI
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
}