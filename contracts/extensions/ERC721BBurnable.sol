// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ERC721B.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
 * @title ERC721B Burnable Token
 * @dev ERC721B Token that can be irreversibly burned (destroyed).
 */
abstract contract ERC721BBurnable is Context, ERC721B {
  /**
   * @dev Burns `tokenId`. See {ERC721B-_burn}.
   *
   * Requirements:
   *
   * - The caller must own `tokenId` or be an approved operator.
   */
  function burn(uint256 tokenId) public virtual {
    //solhint-disable-next-line max-line-length
    require(
      _isApprovedOrOwner(_msgSender(), tokenId), 
      "ERC721Burnable: caller is not owner nor approved"
    );
    _burn(tokenId);
  }
}
