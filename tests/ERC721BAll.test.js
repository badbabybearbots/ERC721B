const { expect } = require('chai');
require('dotenv').config()

if (process.env.BLOCKCHAIN_NETWORK != 'hardhat') {
  console.error('Exited testing with network:', process.env.BLOCKCHAIN_NETWORK)
  process.exit(1);
}

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

describe('ERC721B All Tests', function () {
  before(async function() {
    const [
      contractOwner, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5, 
      tokenOwner6
    ] = await getSigners('ERC721BPresetAll', 'test', 'TEST', 'http://www.example.com/')
    
    this.signers = { 
      contractOwner, 
      tokenOwner1, 
      tokenOwner2,
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5, 
      tokenOwner6
    }
  })

  it('Should get the right contract uri', async function () {
    const { contractOwner } = this.signers
    expect(
      await contractOwner.withContract.contractURI()
    ).to.equal('http://www.example.com/')
  })

  it('Should burn', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    await contractOwner.withContract.mint(tokenOwner1.address, 5)
    await tokenOwner1.withContract.burn(3)
    expect(await contractOwner.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(5)).to.equal(tokenOwner1.address)

    await expect(
      contractOwner.withContract.ownerOf(3)
    ).to.be.revertedWith(
      'ERC721B: owner query for nonexistent token'
    )

    await tokenOwner1.withContract.burn(5)
    expect(await contractOwner.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner1.address)

    await expect(
      contractOwner.withContract.ownerOf(5)
    ).to.be.revertedWith(
      'ERC721B: owner query for nonexistent token'
    )

    await expect(
      contractOwner.withContract.ownerOf(6)
    ).to.be.revertedWith(
      'ERC721B: owner query for nonexistent token'
    )

    await tokenOwner1.withContract.burn(1)
    expect(await contractOwner.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner1.address)

    await expect(
      contractOwner.withContract.ownerOf(1)
    ).to.be.revertedWith(
      'ERC721B: owner query for nonexistent token'
    )
  })

  it('Should pause and unpause', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    await contractOwner.withContract.pause()

    await expect(
      contractOwner.withContract.mint(tokenOwner1.address, 3)
    ).to.be.revertedWith(
      'ERC721BPausable: token transfer while paused'
    )

    await expect(
      tokenOwner1.withContract.transferFrom(
        tokenOwner1.address, 
        contractOwner.address, 
        2
      )
    ).to.be.revertedWith(
      'ERC721BPausable: token transfer while paused'
    )

    await expect(
      tokenOwner1.withContract.burn(2)
    ).to.be.revertedWith(
      'ERC721BPausable: token transfer while paused'
    )

    await contractOwner.withContract.unpause()
    await contractOwner.withContract.mint(tokenOwner1.address, 3)
    await tokenOwner1.withContract.transferFrom(
      tokenOwner1.address, 
      contractOwner.address, 
      2
    )

    await contractOwner.withContract.burn(2)
  })

  it('Should get token uri', async function () {
    const { contractOwner } = this.signers
    await contractOwner.withContract.setTokenURI(6, 'bar')
    expect(await contractOwner.withContract.tokenURI(6)).to.equal('bar')

    await contractOwner.withContract.setBaseTokenURI('foo')
    expect(await contractOwner.withContract.baseTokenURI()).to.equal('foo')
    expect(await contractOwner.withContract.tokenURI(6)).to.equal('foobar')
    expect(await contractOwner.withContract.tokenURI(7)).to.equal('foo7')
  })
})