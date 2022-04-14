# ERC721B

An improvement on the [ERC721A](https://github.com/chiru-labs/ERC721A) 
implementation. [Read more](https://www.badbabybearbots.com/erc721b.html).

ERC721B is a stripped down version of ERC721. No bells, 
no whistles. Some key considerations are the following.

 - Primary designed for cheaply mass minting by a special token id 
   incrementer. If batch minting is not a concern, you might want to 
   still use ERC721.
 - `tokenURI()` in ERC721 cannot be used in all cases. It was added to 
   satisfy the `IERC721Metadata` interface. We moved this requirement
   to `presets/ERC721BPresetStandard.sol` instead.
 - `name()` is stored though usually never changes. returning a 
   `name() pure` is more efficient. It was added to ERC721 in order to  
   satisfy the `IERC721Metadata` interface. We moved this requirement
   to `extensions/ERC721BMetadata.sol` instead.
 - `symbol()` is stored though usually never changes. returning a 
   `symbol() pure` is more efficient. It was added to ERC721 in order to  
   satisfy the `IERC721Metadata` interface. We moved this requirement
   to `extensions/ERC721BMetadata.sol` instead.

## 1. Install

```bash
$ npm i --save-dev erc721b
```

## 2. Usage

A basic example on how to inherit the ERC721B in your contract would 
look like the following. This example uses `ERC721BBaseTokenURI` to 
generate a dynamic URI in `tokenURI`

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721b/contracts/extensions/ERC721BBaseTokenURI.sol";

contract MyCollection is Ownable, ERC721BBaseTokenURI
{
  function mint(address to, uint256 quantity) external onlyOwner {
    _safeMint(to, quantity);
  }

  function name() external view returns(string memory) {
    return "My Collection";
  }

  function symbol() external view returns(string memory) {
    return "MYC";
  }

  function supportsInterface(bytes4 interfaceId) 
    public view virtual override(ERC721B, IERC165) returns(bool) 
  {
    return interfaceId == type(IERC721Metadata).interfaceId
      || super.supportsInterface(interfaceId);
  }
}
```

If you would like to manually assign a token's URI you could use the 
following example.

```solidity
import "@openzeppelin/contracts/access/Ownable.sol";
import "erc721b/contracts/extensions/ERC721BStaticTokenURI.sol";

contract MyCollection is Ownable, ERC721BBaseTokenURI
{
  function mint(address to, uint256 quantity) external onlyOwner {
    _safeMint(to, quantity);
  }

  function name() external view returns(string memory) {
    return "My Collection";
  }

  function symbol() external view returns(string memory) {
    return "MYC";
  }

  function setTokenURI(uint256 tokenId, string memory uri) external onlyOwner {
    _setTokenURI(tokenId, uri);
  }

  function supportsInterface(bytes4 interfaceId) 
    public view virtual override(ERC721B, IERC165) returns(bool) 
  {
    return interfaceId == type(IERC721Metadata).interfaceId
      || super.supportsInterface(interfaceId);
  }
}
```

See [presets](https://github.com/badbabybearbots/ERC721B/tree/main/contracts/presets)
for more examples. 

## 3. Extensions

This library comes with the following extensions.

### 3A. ERC721BBaseTokenURI

Use this extension if you want token URIs to be determined with a base URI.
You need to manually call `_setBaseURI(string memory)` in your constructor 
or in another function.

### 3B. ERC721BBurnable

Use this extension if you want your tokens to be burnable. By default 
it is not.

### 3C. ERC721BContractURIStorage

Use this extension if you want your contract have an associated URI.
Marketplaces like OpenSea accept this. You need to manually call 
`_setContractURI(string memory)` in your constructor or in another 
function.

### 3D. ERC721BPausable

Use this extension if you want manually pause minting and transferring.
You need to manually call `_pause()` and `_unpause()` in another function.

### 3E. ERC721BSignedTransfer

Use this extension if you want want a cheaper way to approve transfers.
`signedTransferFrom()` is similar to `safeTransferFrom()` except it 
accepts a signed message from the owner as authorization.

### 3F. ERC721BStaticTokenURI

Use this extension if you want to assign static URIs to a token.

### 3G. ERC721Metadata

Use this extension if you want to assign store the name and symbol in 
your contract. We separated this out because it's cheaper to use a pure 
function like `function name() pure view returns(string memory)`.

## 4. Auditing

Clone this repo in terminal and `cd` to that folder. Run the following 
commands.

```bash
$ cp .env.sample to .env
$ npm install
```

Sign up to [CoinmarketCap](https://pro.coinmarketcap.com/signup) and 
generate an API key. In `.env` to set the `BLOCKCHAIN_CMC_KEY` to your 
API key.

## 5. Testing

Make sure in `.env` to set the `BLOCKCHAIN_NETWORK` to `hardhat`.

```bash
$ npm test
```

## 6. Reports

We've measured the gas costs and prices for minting, comparing 
OpenZeppelin's **ERC721** vs **ERC721A** vs **ERC721B**. In our 
measurements, the same application-level logic is used.

<pre>
·------------------|------------------|------------------|------------------·
|                  ·           ERC721 ·          ERC721A ·          ERC721B |
...................|..................|..................|...................
|           Deploy |        1,207,378 |        1,098,237 |        1,074,533 |
...................|..................|..................|...................
|           Mint 1 |           56,842 |           56,593 |           56,560 |
...................|..................|..................|...................
|           Mint 2 |           82,424 |           58,590 |           58,557 |
...................|..................|..................|...................
|           Mint 3 |          108,006 |           60,587 |           60,554 |
...................|..................|..................|...................
|           Mint 4 |          133,588 |           62,584 |           62,551 |
...................|..................|..................|...................
|           Mint 5 |          159,170 |           64,581 |           64,548 |
...................|..................|..................|...................
|         Transfer |           62,491 |           66,342 |           66,226 |
...................|..................|..................|...................
|             Burn |           19,611 |           65,419 |           57,501 |
·------------------|------------------|------------------|------------------·
</pre>

The following example is an example cost conversion from the gas above
in USD ($3,000/eth).

<pre>
·------------------|------------------|------------------|------------------·
|                  ·           ERC721 ·          ERC721A ·          ERC721B |
...................|..................|..................|...................
|           Deploy | $       1,086.64 | $         988.41 | $         967.07 |
...................|..................|..................|...................
|           Mint 1 | $          51.15 | $          50.93 | $          50.90 |
...................|..................|..................|...................
|           Mint 2 | $          74.18 | $          52.73 | $          52.70 |
...................|..................|..................|...................
|           Mint 3 | $          97.20 | $          54.52 | $          54.49 |
...................|..................|..................|...................
|           Mint 4 | $         120.22 | $          56.32 | $          56.29 |
...................|..................|..................|...................
|           Mint 5 | $         143.25 | $          58.12 | $          58.09 |
...................|..................|..................|...................
|         Transfer | $          56.24 | $          59.70 | $          59.60 |
...................|..................|..................|...................
|             Burn | $          17.64 | $          58.87 | $          51.75 |
·------------------|------------------|------------------|------------------·
</pre>

The following is an example gas report from the tests ran in this 
project and could change based on the cost of `ETH` itself.

<pre>
·------------------------------------------------|---------------------------|-----------|-----------------------------·
|              Solc version: 0.8.9               ·  Optimizer enabled: true  ·  Runs: 1  ·  Block limit: 12450000 gas  │
·················································|···························|···········|······························
|  Methods                                       ·             300 gwei/gas              ·       3115.21 usd/eth       │
··························|······················|·············|·············|···········|···············|··············
|  Contract               ·  Method              ·  Min        ·  Max        ·  Avg      ·  # calls      ·  usd (avg)  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable    ·  burn                ·          -  ·          -  ·    65419  ·            2  ·      61.14  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable    ·  mint                ·      56593  ·      90793  ·    65621  ·           12  ·      61.33  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable    ·  transferFrom        ·          -  ·          -  ·    66342  ·            2  ·      62.00  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable    ·  burn                ·          -  ·          -  ·    57501  ·            2  ·      53.74  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable    ·  mint                ·      56560  ·      90760  ·    65588  ·           12  ·      61.30  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable    ·  transferFrom        ·          -  ·          -  ·    66226  ·            2  ·      61.89  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  burn                ·      42759  ·     111911  ·    75702  ·            4  ·      70.75  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  mint                ·      65941  ·     104135  ·    85038  ·            2  ·      79.47  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  pause               ·          -  ·          -  ·    28125  ·            1  ·      26.28  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  setBaseTokenURI     ·          -  ·          -  ·    46977  ·            1  ·      43.90  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  setTokenURI         ·          -  ·          -  ·    51617  ·            1  ·      48.24  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  signedTransferFrom  ·          -  ·          -  ·   120340  ·            1  ·     112.47  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  transferFrom        ·          -  ·          -  ·    88750  ·            1  ·      82.94  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  unpause             ·          -  ·          -  ·    27876  ·            1  ·      26.05  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  approve             ·          -  ·          -  ·    48698  ·            1  ·      45.51  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  mint                ·      78711  ·     103799  ·    89069  ·            6  ·      83.24  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  setApprovalForAll   ·          -  ·          -  ·    46422  ·            1  ·      43.38  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  transferFrom        ·      49138  ·     105948  ·    68075  ·            3  ·      63.62  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721MockBurnable     ·  burn                ·          -  ·          -  ·    19611  ·            2  ·      18.33  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721MockBurnable     ·  mint                ·      56842  ·     159170  ·   105179  ·           12  ·      98.30  │
··························|······················|·············|·············|···········|···············|··············
|  ERC721MockBurnable     ·  transferFrom        ·          -  ·          -  ·    62491  ·            2  ·      58.40  │
··························|······················|·············|·············|···········|···············|··············
|  Deployments                                   ·                                       ·  % of limit   ·             │
·················································|·············|·············|···········|···············|··············
|  ERC721AMockBurnable                           ·          -  ·          -  ·  1199796  ·        9.6 %  ·    1121.28  │
·················································|·············|·············|···········|···············|··············
|  ERC721AMockVanilla                            ·          -  ·          -  ·  1098237  ·        8.8 %  ·    1026.37  │
·················································|·············|·············|···········|···············|··············
|  ERC721BMockBurnable                           ·          -  ·          -  ·  1176964  ·        9.5 %  ·    1099.95  │
·················································|·············|·············|···········|···············|··············
|  ERC721BMockVanilla                            ·          -  ·          -  ·  1074533  ·        8.6 %  ·    1004.22  │
·················································|·············|·············|···········|···············|··············
|  ERC721BPresetAll                              ·          -  ·          -  ·  2005909  ·       16.1 %  ·    1874.65  │
·················································|·············|·············|···········|···············|··············
|  ERC721BPresetStandard                         ·          -  ·          -  ·  1215028  ·        9.8 %  ·    1135.52  │
·················································|·············|·············|···········|···············|··············
|  ERC721MockBurnable                            ·          -  ·          -  ·  1269394  ·       10.2 %  ·    1186.33  │
·················································|·············|·············|···········|···············|··············
|  ERC721MockVanilla                             ·          -  ·          -  ·  1207378  ·        9.7 %  ·    1128.37  │
·------------------------------------------------|-------------|-------------|-----------|---------------|-------------·
</pre>
