// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721B.sol";

/**
 * @dev ERC721B token where token URIs are determined with a base URI
 */
abstract contract ERC721BURIBase is ERC721B {
  string private _baseTokenURI;
  
  /**
   * @dev The base URI for token data ex. https://creatures-api.opensea.io/api/creature/
   * Example Usage: 
   *  Strings.strConcat(baseTokenURI(), Strings.uint2str(tokenId))
   */
  function baseTokenURI() public view returns (string memory) {
    return _baseURI();
  }

  /**
   * @dev Base URI for computing {tokenURI}. If set, the resulting URI 
   * for each token will be the concatenation of the `baseURI` and the 
   * `tokenId`. Empty by default, can be overriden in child contracts.
   */
  function _baseURI() internal view virtual override returns (string memory) {
    return _baseTokenURI;
  }

  /**
   * @dev Setting base token uri would be acceptable if using IPFS CIDs
   */
  function _setBaseURI(string memory uri) internal virtual {
    _baseTokenURI = uri;
  }
}
