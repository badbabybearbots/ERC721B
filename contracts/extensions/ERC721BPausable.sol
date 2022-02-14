// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721B.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

error TransferWhilePaused();

/**
 * @dev ERC721B token with pausable token transfers, minting and burning.
 *
 * Useful for scenarios such as preventing trades until the end of an evaluation
 * period, or having an emergency switch for freezing all token transfers in the
 * event of a large bug.
 */
abstract contract ERC721BPausable is Pausable, ERC721B {
  /**
   * @dev See {ERC721B-_beforeTokenTransfer}.
   *
   * Requirements:
   *
   * - the contract must not be paused.
   */
  function _beforeTokenTransfers(
    address from,
    address to,
    uint256 startTokenId,
    uint256 quantity
  ) internal virtual override {
    super._beforeTokenTransfers(from, to, startTokenId, quantity);
    if (paused()) revert TransferWhilePaused();
  }
}
