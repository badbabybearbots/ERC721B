// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721B.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @dev ERC721B token with pausable token transfers, minting and burning.
 *
 * Useful for scenarios such as preventing trades until the end of an evaluation
 * period, or having an emergency switch for freezing all token transfers in the
 * event of a large bug.
 */
abstract contract ERC721BPausable is Pausable, ERC721B {
  /**
   * @dev Overrides `_doMint` to case for pausing 
   */
  function _doMint(
    address to,
    uint256 amount,
    uint256 startTokenId
  ) internal virtual override {
    if (paused()) revert InvalidCall();
    super._doMint(to, amount, startTokenId);
  }

  /**
   * @dev @dev Overrides `_doTransfer` to case for pausing
   */
  function _doTransfer(address from, address to, uint256 tokenId) 
    internal virtual override
  {
    if (paused()) revert InvalidCall();
    super._doTransfer(from, to, tokenId);
  }
}
