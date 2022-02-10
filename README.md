# ERC721B

An improvement on the [ERC721A](https://github.com/chiru-labs/ERC721A) 
implementation. [Read more](https://www.badbabybearbots.com/erc721b.html).

Gas prices on Ethereum have been consistently high for months, and the 
dev community needs to adapt. When popular NFT projects begin to mint, 
gas prices spike up, resulting in the entire ecosystem paying millions 
in gas fees to transact. The focus for the dev team has been to optimize 
our contract and enable our community to spend as little as possible in 
gas fees when minting. 

> The controversy ERC721A has certainly peeked interest in the community 
for achieving low mint costs for all, but had to sacrafice functionality 
and to increase gas costs in other places to do so.

We used [OpenZeppelin's ERC721](https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/token/ERC721) 
as the base and implemented the intent of the **ERC721A** with very simple 
logic. Everything that works in **ERC721** still works in **ERC721B**. 
**ERC721B** includes the following extensions.

 - **ERC721BBurnable** - Ability for owners to burn tokens
 - **ERC721BPausable** - Ability for admins to pause the contract
 - **ERC721BURIBase** - Ability to set a base URI for tokens where token URIs dynamically determined
 - **ERC721BURIStorage** - Ability to attach a fixed URI to tokens
 - **ERC721BURIContract** - Allows the contract itself to have a URI

We've measured the gas costs and prices for minting, comparing 
OpenZeppelin's **ERC721** vs **ERC721A** vs **ERC721B**. In our 
measurements, the same application-level logic is used, the only 
difference being the `_safeMint` function called.

![Gas Report](https://user-images.githubusercontent.com/120378/153183155-e78cd0d0-a84c-4df1-823b-19bd6f667790.png)

## 1. Install

```bash
$ npm i --save-dev erc721b
```

## 2. Auditing

Clone this repo in terminal and `cd` to that folder. Run the following 
commands.

```bash
$ cp .env.sample to .env
$ npm install
```

Sign up to [CoinmarketCap](https://pro.coinmarketcap.com/signup) and 
generate an API key. In `.env` to set the `BLOCKCHAIN_CMC_KEY` to your 
API key.

## 3. Testing

Make sure in `.env` to set the `BLOCKCHAIN_NETWORK` to `hardhat`.

```bash
$ npm test
```

## 4. Reports

The following is an example gas report from the tests ran in this 
project and could change based on the cost of `ETH` itself.

<pre>
·------------------------------------------|---------------------------|-----------|-----------------------------·
|           Solc version: 0.8.9            ·  Optimizer enabled: true  ·  Runs: 1  ·  Block limit: 12450000 gas  │
···········································|···························|···········|······························
|  Methods                                 ·             300 gwei/gas              ·       3183.33 usd/eth       │
·····················|·····················|·············|·············|···········|···············|··············
|  Contract          ·  Method             ·  Min        ·  Max        ·  Avg      ·  # calls      ·  usd (avg)  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll  ·  burn               ·      34539  ·      92007  ·    65832  ·            4  ·      62.87  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll  ·  mint               ·      68808  ·     107500  ·    88154  ·            2  ·      84.19  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll  ·  pause              ·          -  ·          -  ·    30351  ·            1  ·      28.99  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll  ·  setBaseTokenURI    ·          -  ·          -  ·    47242  ·            1  ·      45.12  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll  ·  setTokenURI        ·          -  ·          -  ·    51778  ·            1  ·      49.45  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll  ·  transferFrom       ·          -  ·          -  ·    70140  ·            1  ·      66.98  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BPresetAll  ·  unpause            ·          -  ·          -  ·    30124  ·            1  ·      28.77  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla    ·  approve            ·          -  ·          -  ·    51097  ·            1  ·      48.80  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla    ·  mint               ·      78822  ·     104906  ·    86732  ·            5  ·      82.83  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla    ·  setApprovalForAll  ·          -  ·          -  ·    46400  ·            1  ·      44.31  │
·····················|·····················|·············|·············|···········|···············|··············
|  ERC721BVanilla    ·  transferFrom       ·      50759  ·     107753  ·    69757  ·            3  ·      66.62  │
·····················|·····················|·············|·············|···········|···············|··············
|  Deployments                             ·                                       ·  % of limit   ·             │
···········································|·············|·············|···········|···············|··············
|  ERC721BPresetAll                        ·          -  ·          -  ·  2762160  ·       22.2 %  ·    2637.86  │
···········································|·············|·············|···········|···············|··············
|  ERC721BVanilla                          ·          -  ·          -  ·  1414369  ·       11.4 %  ·    1350.72  │
·------------------------------------------|-------------|-------------|-----------|---------------|-------------·
</pre>
