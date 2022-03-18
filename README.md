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
}
```

See [presets](https://github.com/badbabybearbots/ERC721B/tree/main/contracts/presets)
for more examples. 

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
|           Deploy |        1,207,378 |        1,210,541 |        1,072,769 |
...................|..................|..................|...................
|           Mint 1 |           56,842 |           56,890 |           56,601 |
...................|..................|..................|...................
|           Mint 2 |           82,424 |           59,149 |           58,618 |
...................|..................|..................|...................
|           Mint 3 |          108,006 |           61,408 |           60,635 |
...................|..................|..................|...................
|           Mint 4 |          133,588 |           63,667 |           62,652 |
...................|..................|..................|...................
|           Mint 5 |          159,170 |           65,926 |           64,669 |
...................|..................|..................|...................
|         Transfer |           62,491 |           66,389 |           66,207 |
...................|..................|..................|...................
|             Burn |           19,611 |           47,380 |           57,502 |
·------------------|------------------|------------------|------------------·
</pre>

The following example is an example cost conversion from the gas above
in USD ($3,000/eth).

<pre>
·------------------|------------------|------------------|------------------·
|                  ·           ERC721 ·          ERC721A ·          ERC721B |
...................|..................|..................|...................
|           Deploy | $       1,086.64 | $       1,089.48 | $         965.49 |
...................|..................|..................|...................
|           Mint 1 | $          51.15 | $          51.20 | $          50.94 |
...................|..................|..................|...................
|           Mint 2 | $          74.18 | $          53.23 | $          52.75 |
...................|..................|..................|...................
|           Mint 3 | $          97.20 | $          55.26 | $          54.57 |
...................|..................|..................|...................
|           Mint 4 | $         120.22 | $          57.30 | $          56.38 |
...................|..................|..................|...................
|           Mint 5 | $         143.25 | $          59.33 | $          58.20 |
...................|..................|..................|...................
|         Transfer | $          56.24 | $          59.75 | $          59.58 |
...................|..................|..................|...................
|             Burn | $          17.64 | $          42.64 | $          51.75 |
·------------------|------------------|------------------|------------------·
</pre>

The following is an example gas report from the tests ran in this 
project and could change based on the cost of `ETH` itself.

<pre>
·-----------------------------------------------|---------------------------|-----------|-----------------------------·
|              Solc version: 0.8.9              ·  Optimizer enabled: true  ·  Runs: 1  ·  Block limit: 12450000 gas  │
················································|···························|···········|······························
|  Methods                                      ·             300 gwei/gas              ·       2798.44 usd/eth       │
··························|·····················|·············|·············|···········|···············|··············
|  Contract               ·  Method             ·  Min        ·  Max        ·  Avg      ·  # calls      ·  usd (avg)  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable    ·  burn               ·          -  ·          -  ·    47380  ·            2  ·      39.78  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable    ·  mint               ·      56890  ·      91090  ·    66355  ·           12  ·      55.71  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721AMockBurnable    ·  transferFrom       ·          -  ·          -  ·    66389  ·            2  ·      55.74  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable    ·  burn               ·          -  ·          -  ·    57502  ·            2  ·      48.27  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable    ·  mint               ·      56601  ·      90801  ·    65663  ·           12  ·      55.13  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BMockBurnable    ·  transferFrom       ·          -  ·          -  ·    66207  ·            2  ·      55.58  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  burn               ·      42760  ·     111912  ·    75703  ·            4  ·      63.56  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  mint               ·      66022  ·     104256  ·    85139  ·            2  ·      71.48  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  pause              ·          -  ·          -  ·    28081  ·            1  ·      23.57  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  setBaseTokenURI    ·          -  ·          -  ·    47016  ·            1  ·      39.47  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  setTokenURI        ·          -  ·          -  ·    51656  ·            1  ·      43.37  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  transferFrom       ·          -  ·          -  ·    88731  ·            1  ·      74.49  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll       ·  unpause            ·          -  ·          -  ·    27876  ·            1  ·      23.40  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  approve            ·          -  ·          -  ·    48698  ·            1  ·      40.88  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  mint               ·      78752  ·     103920  ·    86204  ·            5  ·      72.37  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  setApprovalForAll  ·          -  ·          -  ·    46422  ·            1  ·      38.97  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetStandard  ·  transferFrom       ·      49107  ·     105917  ·    68044  ·            3  ·      57.13  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721MockBurnable     ·  burn               ·          -  ·          -  ·    19611  ·            2  ·      16.46  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721MockBurnable     ·  mint               ·      56842  ·     159170  ·   105179  ·           12  ·      88.30  │
··························|·····················|·············|·············|···········|···············|··············
|  ERC721MockBurnable     ·  transferFrom       ·          -  ·          -  ·    62491  ·            2  ·      52.46  │
··························|·····················|·············|·············|···········|···············|··············
|  Deployments                                  ·                                       ·  % of limit   ·             │
················································|·············|·············|···········|···············|··············
|  ERC721AMockBurnable                          ·          -  ·          -  ·  1330210  ·       10.7 %  ·    1116.75  │
················································|·············|·············|···········|···············|··············
|  ERC721AMockVanilla                           ·          -  ·          -  ·  1210541  ·        9.7 %  ·    1016.29  │
················································|·············|·············|···········|···············|··············
|  ERC721BMockBurnable                          ·          -  ·          -  ·  1174972  ·        9.4 %  ·     986.43  │
················································|·············|·············|···········|···············|··············
|  ERC721BMockVanilla                           ·          -  ·          -  ·  1072769  ·        8.6 %  ·     900.62  │
················································|·············|·············|···········|···············|··············
|  ERC721BPresetAll                             ·          -  ·          -  ·  1623404  ·         13 %  ·    1362.90  │
················································|·············|·············|···········|···············|··············
|  ERC721BPresetStandard                        ·          -  ·          -  ·  1204442  ·        9.7 %  ·    1011.17  │
················································|·············|·············|···········|···············|··············
|  ERC721MockBurnable                           ·          -  ·          -  ·  1269394  ·       10.2 %  ·    1065.70  │
················································|·············|·············|···········|···············|··············
|  ERC721MockVanilla                            ·          -  ·          -  ·  1207378  ·        9.7 %  ·    1013.63  │
·-----------------------------------------------|-------------|-------------|-----------|---------------|-------------·
</pre>
