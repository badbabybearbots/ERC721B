// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../extensions/ERC721BURIBase.sol";

error WhitelistNotStarted();
error WhitelistEnded();
error SaleNotStarted();
error InvalidProof();
error InvalidRecipient();

contract ERC721BPresetProvenance is
  Ownable,
  ReentrancyGuard,
  ERC721BURIBase
{
  using Strings for uint256;
  using SafeMath for uint256;

  // ============ Constants ============
  
  //max amount that can be minted in this collection
  uint16 public immutable MAX_SUPPLY;

  // ============ Structs ============

  struct SaleStage {
    //in unix timestamp
    uint64 startDate;
    //should be less than 256
    uint8 maxPurchase;
    //in wei
    uint256 price;
  }

  struct SaleConsumption {
    mapping(address => uint8) consumed;
    SaleStage stage;
  }

  // ============ Storage ============

  //the offset to be used to determine what token id should get which 
  //CID in some sort of random fashion. This is kind of immutable as 
  //it's only set in `widthdraw()`
  uint16 public indexOffset;

  //the provenance hash (the CID). This is immutable as it's set in 
  //the constructor, but solidity doesn't allow immutable strings
  //at the moment
  string public provenance;

  SaleConsumption private _whitelist;
  SaleConsumption private _sale;

  // ============ Deploy ============

  /**
   * @dev Grants `DEFAULT_ADMIN_ROLE` and `PAUSER_ROLE` to the
   * account that deploys the contract. Sets the contract's URI. 
   */
  constructor(
    string memory name_, 
    string memory symbol_, 
    string memory uri_,
    string memory cid_,
    uint16 maxSupply_,
    uint256 whitelistPrice_,
    uint64 whitelistStartDate_,
    uint8 whitelistMaxPurchase_,
    uint256 salePrice_,
    uint64 saleStartDate_,
    uint8 saleMaxPurchase_
  ) ERC721B(name_, symbol_) {
    //set max supply
    MAX_SUPPLY = maxSupply_;
    //set base uri
    _setBaseURI(uri_);
    //set provenance data
    provenance = cid_;
    //populate whitelist
    _whitelist.stage.price = whitelistPrice_;
    _whitelist.stage.startDate = whitelistStartDate_;
    _whitelist.stage.maxPurchase = whitelistMaxPurchase_;
    //populate sale
    _sale.stage.price = salePrice_;
    _sale.stage.startDate = saleStartDate_;
    _sale.stage.maxPurchase = saleMaxPurchase_;
  }

  // ============ Read Methods ============

  /**
   * @dev The URI for contract data ex. https://creatures-api.opensea.io/contract/opensea-creatures
   * Example Format:
   * {
   *   "name": "OpenSea Creatures",
   *   "description": "OpenSea Creatures are adorable aquatic beings primarily for demonstrating what can be done using the OpenSea platform. Adopt one today to try out all the OpenSea buying, selling, and bidding feature set.",
   *   "image": "https://openseacreatures.io/image.png",
   *   "external_link": "https://openseacreatures.io",
   *   "seller_fee_basis_points": 100, # Indicates a 1% seller fee.
   *   "fee_recipient": "0xA97F337c39cccE66adfeCB2BF99C1DdC54C2D721" # Where seller fees will be paid to.
   * }
   */
  function contractURI() public view returns (string memory) {
    //ex. https://ipfs.io/ipfs/ + Qm123abc + /contract.json
    return string(
      abi.encodePacked(baseTokenURI(), provenance, "/contract.json")
    );
  }

  /**
   * @dev Combines the base token URI and the token CID to form a full 
   * token URI
   */
  function tokenURI(uint256 tokenId) 
    public view virtual override returns(string memory) 
  {
    if (!_exists(tokenId)) revert NonExistentToken();

    //if no offset
    if (indexOffset == 0) {
      //use the placeholder
      return string(
        abi.encodePacked(baseTokenURI(), provenance, "/placeholder.json")
      );
    }

    //for example, given offset is 2 and size is 8:
    // - token 5 = ((5 + 2) % 8) + 1 = 8
    // - token 6 = ((6 + 2) % 8) + 1 = 1
    // - token 7 = ((7 + 2) % 8) + 1 = 2
    // - token 8 = ((8 + 2) % 8) + 1 = 3
    uint256 index = tokenId.add(indexOffset).mod(MAX_SUPPLY).add(1);
    //ex. https://ipfs.io/ + Qm123abc + / + 1000 + .json
    return string(
      abi.encodePacked(baseTokenURI(), provenance, "/", index.toString(), ".json")
    );
  }
  
  /**
   * @dev Shows the overall amount of tokens generated in the contract
   */
  function totalSupply() public virtual view returns (uint256) {
    return lastTokenId();
  }

  // ============ Write Methods ============

  /**
   * @dev Allows `recipient` to get a token that was approved by a 
   * `MINTER_ROLE`
   */
  function authorize(address recipient, uint256 quantity, bytes memory proof) 
    external payable 
  {
    //make sure recipient is a valid address
    if (recipient == address(0)) revert InvalidRecipient();

    //has the whitelist started?
    if(uint64(block.timestamp) <= _whitelist.stage.startDate) 
      revert WhitelistNotStarted();

    //has the sale started?
    if(uint64(block.timestamp) >= _sale.stage.startDate) 
      revert WhitelistEnded();

    //make sure the minter signed this off
    if(ECDSA.recover(
      ECDSA.toEthSignedMessageHash(
        keccak256(abi.encodePacked("authorized", recipient))
      ),
      proof
    ) != owner()) revert InvalidProof();
  
    if (quantity == 0 //must have a quantity
      //the quantity here plus the current amount already minted 
      //should be less than the max purchase amount
      || quantity.add(_whitelist.consumed[recipient]) > _whitelist.stage.maxPurchase
      //the value sent should be the price times quantity
      || quantity.mul(_whitelist.stage.price) > msg.value
      //the quantity being minted should not exceed the max supply
      || (lastTokenId() + quantity) > MAX_SUPPLY
    ) revert InvalidAmount();

    _whitelist.consumed[recipient] += uint8(quantity);
    _safeMint(recipient, quantity);
  }

  /**
   * @dev Creates a new token for the `recipient`. Its token ID will be 
   * automatically assigned (and available on the emitted 
   * {IERC721-Transfer} event), and the token URI autogenerated based 
   * on the base URI passed at construction.
   */
  function mint(address recipient, uint256 quantity) external payable {
    //make sure recipient is a valid address
    if (recipient == address(0)) revert InvalidRecipient();
    //has the sale started?
    if(uint64(block.timestamp) < _sale.stage.startDate) 
      revert SaleNotStarted();
  
    if (quantity == 0 
      //the quantity here plus the current amount already minted 
      //should be less than the max purchase amount
      || quantity.add(_sale.consumed[recipient]) > _sale.stage.maxPurchase
      //the value sent should be the price times quantity
      || quantity.mul(_sale.stage.price) > msg.value
      //the quantity being minted should not exceed the max supply
      || (lastTokenId() + quantity) > MAX_SUPPLY
    ) revert InvalidAmount();

    _sale.consumed[recipient] += uint8(quantity);
    _safeMint(recipient, quantity);
  }

  /**
   * @dev Since we are using IPFS CID for the token URI, we can allow 
   * the changing of the base URI to toggle between services for faster 
   * speeds while keeping the metadata provably fair
   */
  function setBaseURI(string memory uri) 
    public virtual onlyOwner
  {
    _setBaseURI(uri);
  }

  /**
   * @dev Allows the proceeds to be withdrawn. This also releases the  
   * collection at the same time to discourage rug pulls 
   */
  function withdraw() external virtual onlyOwner nonReentrant {
    //set the offset
    if (indexOffset == 0) {
      indexOffset = uint16(block.number - 1) % MAX_SUPPLY;
      if (indexOffset == 0) {
        indexOffset = 1;
      }
    }

    uint balance = address(this).balance;
    payable(_msgSender()).transfer(balance);
  }
}
