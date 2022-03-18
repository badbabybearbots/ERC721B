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
  /**
   * @dev Sets the name, symbol
   */
  constructor(string memory name, string memory symbol) 
    ERC721BPresetStandard(name, symbol) {}

  /**
   * @dev Sets contract uri
   */
  function setContractURI(string memory uri) public virtual onlyOwner {
    _setContractURI(uri);
  }

  /**
   * @dev See {IERC721Metadata-tokenURI}.
   */
  function tokenURI(uint256 tokenId) 
    public 
    view 
    virtual 
    override(ERC721BBaseTokenURI, ERC721BStaticTokenURI, IERC721Metadata) 
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

    return super.tokenURI(tokenId);
  }
}