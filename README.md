# ERC721B

An improvement on the [ERC721A](https://github.com/chiru-labs/ERC721A) 
implementation. [Read more](https://www.badbabybearbots.com/erc721b.html).

Everything that works in **ERC721** still works in **ERC721B** and 
**ERC721B** includes the following extensions.

 - **ERC721BBurnable** - Ability for owners to burn tokens
 - **ERC721BPausable** - Ability for admins to pause the contract
 - **ERC721BURIBase** - Ability to set a base URI for tokens where token URIs dynamically determined
 - **ERC721BURIStorage** - Ability to attach a fixed URI to tokens
 - **ERC721BURIContract** - Allows the contract itself to have a URI

## 1. Install

```bash
$ npm i --save-dev erc721b
```

## 2. Usage

A basic example on how to inherit the ERC721B in your contract would 
look like the following.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

import "erc721b/contracts/ERC721B.sol";

contract MyCollection is ERC721B, Ownable {

  constructor(string memory name_, string memory symbol_) ERC721B(name_, symbol_) {}

  function mint(address to, uint256 quantity) external onlyOwner {
    _safeMint(to, quantity);
  }
}
```

An example of adding the ERC721B including all of the extensions would 
look like the following.

```solidity
// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "erc721b/contracts//extensions/ERC721BURIContract.sol";

import "erc721b/contracts//extensions/ERC721BBurnable.sol";
import "erc721b/contracts//extensions/ERC721BPausable.sol";
import "erc721b/contracts//extensions/ERC721BURIBase.sol";
import "erc721b/contracts//extensions/ERC721BURIStorage.sol";

contract ERC721BPresetAll is
  Context,
  Ownable,
  AccessControlEnumerable,
  ERC721BBurnable, 
  ERC721BPausable,
  ERC721BURIBase,
  ERC721BURIContract,
  ERC721BURIStorage
{
  /**
   * @dev Sets the name, symbol and contract uri
   */
  constructor(
    string memory name_, 
    string memory symbol_, 
    string memory uri_
  ) ERC721B(name_, symbol_) {
    _setContractURI(uri_);
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

  /**
   * @dev Allows minters to mint
   */
  function mint(address to, uint256 quantity) external onlyOwner {
    _safeMint(to, quantity);
  }

  /**
   * @dev Pauses all token transfers.
   */
  function pause() public virtual onlyOwner {
    _pause();
  }

  /**
   * @dev Allows curators to set the base token uri
   */
  function setBaseTokenURI(string memory uri) external virtual onlyOwner {
    _setBaseURI(uri);
  }

  /**
   * @dev Allows curators to set a token uri
   */
  function setTokenURI(uint256 tokenId, string memory uri) external virtual onlyOwner {
    _setTokenURI(tokenId, uri);
  }

  /**
   * @dev Unpauses all token transfers.
   */
  function unpause() public virtual onlyOwner {
    _unpause();
  }
  
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
}
```

## 3. Auditing

Clone this repo in terminal and `cd` to that folder. Run the following 
commands.

```bash
$ cp .env.sample to .env
$ npm install
```

Sign up to [CoinmarketCap](https://pro.coinmarketcap.com/signup) and 
generate an API key. In `.env` to set the `BLOCKCHAIN_CMC_KEY` to your 
API key.

## 4. Testing

Make sure in `.env` to set the `BLOCKCHAIN_NETWORK` to `hardhat`.

```bash
$ npm test
```

## 5. Reports

We've measured the gas costs and prices for minting, comparing 
OpenZeppelin's **ERC721** vs **ERC721A** vs **ERC721B**. In our 
measurements, the same application-level logic is used.

<pre>
·------------------|------------------|------------------|------------------·
|                  ·           ERC721 ·          ERC721A ·          ERC721B |
...................|..................|..................|...................
|           Deploy |        1,208,218 |        1,210,541 |        1,093,716 |
...................|..................|..................|...................
|           Mint 1 |           56,842 |           56,890 |           56,607 |
...................|..................|..................|...................
|           Mint 2 |           82,424 |           59,149 |           58,624 |
...................|..................|..................|...................
|           Mint 3 |          108,006 |           61,408 |           60,641 |
...................|..................|..................|...................
|           Mint 4 |          133,588 |           63,667 |           62,658 |
...................|..................|..................|...................
|           Mint 5 |          159,170 |           65,926 |           64,675 |
...................|..................|..................|...................
|         Transfer |           62,491 |           66,389 |           66,420 |
...................|..................|..................|...................
|             Burn |           19,611 |           47,380 |           28,180 |
·------------------|------------------|------------------|------------------·
</pre>

The following example is an example cost conversion from the gas above
in USD.

<pre>
·------------------|------------------|------------------|------------------·
|                  ·           ERC721 ·          ERC721A ·          ERC721B |
...................|..................|..................|...................
|           Deploy | $       1,087.39 | $       1,089.48 | $         984.34 |
...................|..................|..................|...................
|           Mint 1 | $          51.15 | $          51.20 | $          50.94 |
...................|..................|..................|...................
|           Mint 2 | $          74.18 | $          53.23 | $          52.76 |
...................|..................|..................|...................
|           Mint 3 | $          97.20 | $          55.26 | $          54.57 |
...................|..................|..................|...................
|           Mint 4 | $         120.22 | $          57.30 | $          56.39 |
...................|..................|..................|...................
|           Mint 5 | $         143.25 | $          59.33 | $          58.20 |
...................|..................|..................|...................
|         Transfer | $          56.24 | $          59.75 | $          59.77 |
...................|..................|..................|...................
|             Burn | $          17.64 | $          42.64 | $          25.36 |
·------------------|------------------|------------------|------------------·
</pre>

The following is an example gas report from the tests ran in this 
project and could change based on the cost of `ETH` itself.

<pre>
·---------------------------------------------|---------------------------|-----------|-----------------------------·
|             Solc version: 0.8.9             ·  Optimizer enabled: true  ·  Runs: 1  ·  Block limit: 12450000 gas  │
··············································|···························|···········|······························
|  Methods                                    ·             300 gwei/gas              ·       2869.62 usd/eth       │
························|·····················|·············|·············|···········|···············|··············
|  Contract             ·  Method             ·  Min        ·  Max        ·  Avg      ·  # calls      ·  usd (avg)  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable  ·  burn               ·          -  ·          -  ·    47380  ·            2  ·      40.79  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable  ·  mint               ·      56890  ·      91090  ·    66355  ·           12  ·      57.12  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable  ·  transferFrom       ·          -  ·          -  ·    66389  ·            2  ·      57.15  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable  ·  burn               ·          -  ·          -  ·    28180  ·            2  ·      24.26  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable  ·  mint               ·      56607  ·      90807  ·    65669  ·           12  ·      56.53  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable  ·  transferFrom       ·          -  ·          -  ·    66420  ·            2  ·      57.18  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll     ·  burn               ·      30592  ·      87928  ·    61854  ·            4  ·      53.25  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll     ·  mint               ·      68283  ·     106517  ·    87400  ·            2  ·      75.24  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll     ·  pause              ·          -  ·          -  ·    30351  ·            1  ·      26.13  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll     ·  setBaseTokenURI    ·          -  ·          -  ·    47242  ·            1  ·      40.67  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll     ·  setTokenURI        ·          -  ·          -  ·    51809  ·            1  ·      44.60  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll     ·  transferFrom       ·          -  ·          -  ·    68712  ·            1  ·      59.15  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll     ·  unpause            ·          -  ·          -  ·    30124  ·            1  ·      25.93  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla       ·  approve            ·          -  ·          -  ·    48907  ·            1  ·      42.10  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla       ·  mint               ·      78755  ·     103923  ·    86207  ·            5  ·      74.21  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla       ·  setApprovalForAll  ·          -  ·          -  ·    46400  ·            1  ·      39.95  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla       ·  transferFrom       ·      49331  ·     106333  ·    68332  ·            3  ·      58.83  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721MockBurnable   ·  burn               ·          -  ·          -  ·    19611  ·            2  ·      16.88  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721MockBurnable   ·  mint               ·      56842  ·     159170  ·   105179  ·           12  ·      90.55  │
························|·····················|·············|·············|···········|···············|··············
|  ERC721MockBurnable   ·  transferFrom       ·          -  ·          -  ·    62491  ·            2  ·      53.80  │
························|·····················|·············|·············|···········|···············|··············
|  Deployments                                ·                                       ·  % of limit   ·             │
··············································|·············|·············|···········|···············|··············
|  ERC721AMockBurnable                        ·          -  ·          -  ·  1330210  ·       10.7 %  ·    1145.16  │
··············································|·············|·············|···········|···············|··············
|  ERC721AMockVanilla                         ·          -  ·          -  ·  1210541  ·        9.7 %  ·    1042.14  │
··············································|·············|·············|···········|···············|··············
|  ERC721BMockBurnable                        ·          -  ·          -  ·  1157652  ·        9.3 %  ·     996.61  │
··············································|·············|·············|···········|···············|··············
|  ERC721BMockVanilla                         ·          -  ·          -  ·  1093716  ·        8.8 %  ·     941.56  │
··············································|·············|·············|···········|···············|··············
|  ERC721BPresetAll                           ·          -  ·          -  ·  2482945  ·       19.9 %  ·    2137.53  │
··············································|·············|·············|···········|···············|··············
|  ERC721BVanilla                             ·          -  ·          -  ·  1225326  ·        9.8 %  ·    1054.87  │
··············································|·············|·············|···········|···············|··············
|  ERC721MockBurnable                         ·          -  ·          -  ·  1270258  ·       10.2 %  ·    1093.55  │
··············································|·············|·············|···········|···············|··············
|  ERC721MockVanilla                          ·          -  ·          -  ·  1208218  ·        9.7 %  ·    1040.14  │
·---------------------------------------------|-------------|-------------|-----------|---------------|-------------·
</pre>
