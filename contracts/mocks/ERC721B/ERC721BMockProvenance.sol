// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../../presets/ERC721BPresetProvenance.sol";

contract ERC721BMockProvenance is ERC721BPresetProvenance {
  //sale price
  uint256 constant public SALE_PRICE = 0.08 ether;
  //start date of the sale - JAN 01, 2030
  uint64 constant public SALE_START_DATE = 1893456000;
  //max amount that an address can purchase
  uint8 constant public SALE_MAX_PURCHASE = 1;
  //sale price
  uint256 constant public WHITELIST_PRICE = 0.08 ether;
  //start date of the sale - JAN 01, 2031
  uint64 constant public WHITELIST_START_DATE = 1924992000;
  //max amount that an address can purchase
  uint8 constant public WHITELIST_MAX_PURCHASE = 5;

  constructor(string memory uri, string memory cid) ERC721BPresetProvenance(
    // name
    "MyCollection", 
    // symbol
    "MYC",
    // base URI
    uri,
    // provenance hash
    cid,
    //MAX_SUPPLY
    10000,
    //white list info 
    WHITELIST_PRICE,
    WHITELIST_START_DATE,
    WHITELIST_MAX_PURCHASE,
    //sale info
    SALE_PRICE,
    SALE_START_DATE,
    SALE_MAX_PURCHASE
  ) {}
}