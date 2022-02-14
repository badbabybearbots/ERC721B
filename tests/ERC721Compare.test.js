const { expect } = require('chai');
require('dotenv').config()

if (process.env.BLOCKCHAIN_NETWORK != 'hardhat') {
  console.error('Exited testing with network:', process.env.BLOCKCHAIN_NETWORK)
  process.exit(1);
}

const forex = 3000 * 300
const fromWei = 10000000 //1000000000 = 0.000000001

async function deploy(name, ...params) {
  //deploy the contract
  const ContractFactory = await ethers.getContractFactory(name)
  const contract = await ContractFactory.deploy(...params)
  await contract.deployed()

  return contract
}

async function getSigners(name, ...params) {
  //deploy the contract
  const contract = await deploy(name, ...params)
  
  //get the signers
  const signers = await ethers.getSigners()
  //attach contracts
  for (let i = 0; i < signers.length; i++) {
    const Contract = await ethers.getContractFactory(name, signers[i])
    signers[i].withContract = await Contract.attach(contract.address)
  }

  return signers
}

async function getGas(wallet, action, ...params) {
  const tx = await wallet.withContract[action](...params)
  const gas = await tx.wait()
  return gas.gasUsed
}

function pad(string, length, padding = ' ') {
  const pad = length - String(string).length
  if (pad < 0) {
    return String(string).substring(0, length)
  }

  return padding.repeat(pad) + String(string)
}

function comma(number) {
  return String(number)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

function toPrice(gwei, useComma) {
  const price = gwei.mul(forex).div(fromWei).toString() / 100
  return useComma? price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).substring(1): price
}

function lowest(index, list) {
  for (let i = 0; i < list.length; i++) {
    if (i !== index && !isNaN(parseInt(list[i])) && parseFloat(list[i]) < parseFloat(list[index])) {
      return false
    }
  }

  return true
}

function highest(index, list) {
  for (let i = 0; i < list.length; i++) {
    if (i !== index && !isNaN(parseInt(list[i])) && parseFloat(list[i]) > parseFloat(list[index])) {
      return false
    }
  }
  return true
}

const muted = (string) => `\x1b[2m${string}\x1b[0m`
const good = (string) => `\x1b[32m${string}\x1b[0m`
const bad = (string) => `\x1b[31m${string}\x1b[0m`

describe('Compare ERC721/A/B/C', function () {
  before(async function() {
    this.labels = []
    this.report = {
      'Deploy': [],
      'Mint 1': [],
      'Mint 2': [],
      'Mint 3': [],
      'Mint 4': [],
      'Mint 5': [],
      'Transfer': [],
      'Burn': []
    }
  })

  it('Should compare ERC721', async function () {
    const [
      contractOwner, 
      tokenOwner1, 
      tokenOwner2
    ] = await getSigners('ERC721MockBurnable', 'test', 'TEST')
    const ContractFactory = await ethers.getContractFactory('ERC721MockVanilla')
    const contract = await ContractFactory.deploy('test', 'TEST')
    this.labels.push('ERC721')
    this.report['Deploy'].push((
      await (
        await contract.deployed()
      ).deployTransaction.wait()
    ).gasUsed)

    await getGas(tokenOwner1, 'mint', 1)
    this.report['Mint 1'].push(await getGas(tokenOwner1, 'mint', 1))
    this.report['Mint 2'].push(await getGas(tokenOwner1, 'mint', 2))
    this.report['Mint 3'].push(await getGas(tokenOwner1, 'mint', 3))
    this.report['Mint 4'].push(await getGas(tokenOwner1, 'mint', 4))
    this.report['Mint 5'].push(await getGas(tokenOwner1, 'mint', 5))
    this.report['Transfer'].push(await getGas(
      tokenOwner1, 
      'transferFrom', 
      tokenOwner1.address, 
      tokenOwner2.address, 
      1
    ))

    this.report['Burn'].push(await getGas(tokenOwner2, 'burn', 1))
  })

  it('Should compare ERC721A', async function () {
    const [
      contractOwner, 
      tokenOwner1, 
      tokenOwner2
    ] = await getSigners('ERC721AMockBurnable', 'test', 'TEST')
    const ContractFactory = await ethers.getContractFactory('ERC721AMockVanilla')
    const contract = await ContractFactory.deploy('test', 'TEST')
    this.labels.push('ERC721A')
    this.report['Deploy'].push((
      await (
        await contract.deployed()
      ).deployTransaction.wait()
    ).gasUsed)

    await getGas(tokenOwner1, 'mint', 1)
    this.report['Mint 1'].push(await getGas(tokenOwner1, 'mint', 1))
    this.report['Mint 2'].push(await getGas(tokenOwner1, 'mint', 2))
    this.report['Mint 3'].push(await getGas(tokenOwner1, 'mint', 3))
    this.report['Mint 4'].push(await getGas(tokenOwner1, 'mint', 4))
    this.report['Mint 5'].push(await getGas(tokenOwner1, 'mint', 5))
    this.report['Transfer'].push(await getGas(
      tokenOwner1, 
      'transferFrom', 
      tokenOwner1.address, 
      tokenOwner2.address, 
      1
    ))

    this.report['Burn'].push(await getGas(tokenOwner2, 'burn', 1))
  })

  it('Should compare ERC721B', async function () {
    const [
      contractOwner, 
      tokenOwner1, 
      tokenOwner2
    ] = await getSigners('ERC721BMockBurnable', 'test', 'TEST')
    
    const ContractFactory = await ethers.getContractFactory('ERC721BMockVanilla')
    const contract = await ContractFactory.deploy('test', 'TEST')
    this.labels.push('ERC721B')
    this.report['Deploy'].push((
      await (
        await contract.deployed()
      ).deployTransaction.wait()
    ).gasUsed)

    await getGas(tokenOwner1, 'mint', 1)
    this.report['Mint 1'].push(await getGas(tokenOwner1, 'mint', 1))
    this.report['Mint 2'].push(await getGas(tokenOwner1, 'mint', 2))
    this.report['Mint 3'].push(await getGas(tokenOwner1, 'mint', 3))
    this.report['Mint 4'].push(await getGas(tokenOwner1, 'mint', 4))
    this.report['Mint 5'].push(await getGas(tokenOwner1, 'mint', 5))
    this.report['Transfer'].push((await getGas(
      tokenOwner1, 
      'transferFrom', 
      tokenOwner1.address, 
      tokenOwner2.address, 
      1
    )))

    this.report['Burn'].push(await getGas(tokenOwner2, 'burn', 1))
  })

  it('Should report', async function () {
    const border = muted(`·-${[
      pad('', 16, '-'),
      ...this.labels.map(label => pad('', 16, '-'))
    ].join('-|-')}-·`)

    const divider = muted(`..${[
      pad('', 16, '.'),
      ...this.labels.map(label => pad('', 16, '.'))
    ].join('.|.')}..`)

    const header = `${muted('|')} ${[
      pad('', 16),
      ...this.labels.map(label => pad(label, 16))
    ].join(' · ')} ${muted('|')}`

    console.log('')
    console.log('')
    console.log('ERC721/A/B Gas Comparison')
    console.log('')

    console.log(border)
    console.log(header)

    for(const action in this.report) {
      console.log(divider)

      console.log(`${muted('|')} ${[
        pad(action, 16),
        ...this.report[action].map((value, i) => {
          if (isNaN(parseInt(this.report[action][i]))) {
            return bad(pad(value, 16))
          } else if (lowest(i, this.report[action])) {
            return good(pad(comma(value), 16))
          } else if (highest(i, this.report[action])) {
            return bad(pad(comma(value), 16))
          }
          return muted(pad(comma(value), 16))
        })
      ].join(` ${muted('|')} `)} ${muted('|')}`)
    }

    console.log(border)
    console.log('')
    console.log('')
    console.log('ERC721/A/B Price Comparison ($3,000.00 / ETH)')
    console.log('')
    console.log(border)
    console.log(header)

    for(const action in this.report) {
      console.log(divider)

      console.log(`${muted('|')} ${[
        pad(action, 16),
        ...this.report[action].map((value, i) => {
          if (isNaN(parseInt(this.report[action][i]))) {
            return bad(pad(value, 16))
          } else if (lowest(i, this.report[action])) {
            return good('$' + pad(toPrice(value, true), 15))
          } else if (highest(i, this.report[action])) {
            return bad('$' + pad(toPrice(value, true), 15))
          }
          return muted('$' + pad(toPrice(value, true), 15))
        })
      ].join(` ${muted('|')} `)} ${muted('|')}`)
    }

    console.log(border)
    console.log('')
    console.log('')
  })
})