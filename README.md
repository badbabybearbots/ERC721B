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
·-----------------------------------------------|---------------------------|-----------|-----------------------------·
|              Solc version: 0.8.9              ·  Optimizer enabled: true  ·  Runs: 1  ·  Block limit: 12450000 gas  │
················································|···························|···········|······························
|  Methods                                      ·             300 gwei/gas              ·       3075.55 usd/eth       │
·······························|················|·············|·············|···········|···············|··············
|  Contract                    ·  Method        ·  Min        ·  Max        ·  Avg      ·  # calls      ·  usd (avg)  │
·······························|················|·············|·············|···········|···············|··············
|  ERC721BPresetBurnable       ·  burn          ·          -  ·          -  ·    64974  ·            1  ·      59.95  │
·······························|················|·············|·············|···········|···············|··············
|  ERC721BPresetBurnable       ·  mint          ·          -  ·          -  ·    99858  ·            1  ·      92.14  │
·······························|················|·············|·············|···········|···············|··············
|  ERC721BPresetBurnable       ·  transferFrom  ·      50983  ·     107977  ·    69981  ·            3  ·      64.57  │
·······························|················|·············|·············|···········|···············|··············
|  ERC721PresetAutoIdBurnable  ·  burn          ·          -  ·          -  ·    24221  ·            1  ·      22.35  │
·······························|················|·············|·············|···········|···············|··············
|  ERC721PresetAutoIdBurnable  ·  mint          ·          -  ·          -  ·   193370  ·            1  ·     178.42  │
·······························|················|·············|·············|···········|···············|··············
|  ERC721PresetAutoIdBurnable  ·  transferFrom  ·      45391  ·      62491  ·    51091  ·            3  ·      47.14  │
·······························|················|·············|·············|···········|···············|··············
|  Deployments                                  ·                                       ·  % of limit   ·             │
················································|·············|·············|···········|···············|··············
|  ERC721BPresetBurnable                        ·          -  ·          -  ·  1378881  ·       11.1 %  ·    1272.25  │
················································|·············|·············|···········|···············|··············
|  ERC721PresetAutoIdBurnable                   ·          -  ·          -  ·  1270258  ·       10.2 %  ·    1172.02  │
·-----------------------------------------------|-------------|-------------|-----------|---------------|-------------·
</pre>
