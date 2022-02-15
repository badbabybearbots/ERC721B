// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721B.sol";

/**
 * @dev ERC721B token where includes total supply. Do not use with 
 * ERC721BBurnable
 */
abstract contract ERC721BTokenSupply is ERC721B {
  /**
   * @dev Shows the overall amount of tokens generated in the contract
   */
  function totalSupply() public virtual view returns (uint256) {
    return lastTokenId();
  }
}
