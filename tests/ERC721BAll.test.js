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

function signTransfer(from, to, tokenId, nonce) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address', 'address', 'uint256', 'uint256'],
      ['transfer', from, to, tokenId, nonce]
    ).slice(2),
    'hex'
  )
}

describe('ERC721B All Tests', function () {
  before(async function() {
    const [
      contractOwner, 
      tokenOwner1, 
      tokenOwner2
    ] = await getSigners('ERC721BPresetAll', 'test', 'TEST', 'http://www.example.com/')
    
    this.signers = { 
      contractOwner, 
      tokenOwner1, 
      tokenOwner2
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
      'NonExistentToken()'
    )

    await tokenOwner1.withContract.burn(5)
    expect(await contractOwner.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner1.address)

    await expect(
      contractOwner.withContract.ownerOf(5)
    ).to.be.revertedWith(
      'NonExistentToken()'
    )

    await expect(
      contractOwner.withContract.ownerOf(6)
    ).to.be.revertedWith(
      'NonExistentToken()'
    )

    await tokenOwner1.withContract.burn(1)
    expect(await contractOwner.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner1.address)

    await expect(
      contractOwner.withContract.ownerOf(1)
    ).to.be.revertedWith(
      'NonExistentToken()'
    )
  })

  it('Should pause and unpause', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    await contractOwner.withContract.pause()

    await expect(
      contractOwner.withContract.mint(tokenOwner1.address, 3)
    ).to.be.revertedWith(
      'InvalidCall()'
    )

    await expect(
      tokenOwner1.withContract.transferFrom(
        tokenOwner1.address, 
        contractOwner.address, 
        2
      )
    ).to.be.revertedWith(
      'InvalidCall()'
    )

    await expect(
      tokenOwner1.withContract.burn(2)
    ).to.be.revertedWith(
      'InvalidCall()'
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

  it('Should sign off a transfer', async function () {
    const { contractOwner, tokenOwner1, tokenOwner2 } = this.signers

    const message = signTransfer(tokenOwner1.address, tokenOwner2.address, 4, 1)
    const signature = await tokenOwner1.signMessage(message)

    expect(
      await contractOwner.withContract.isTransferConsumed(tokenOwner1.address, tokenOwner2.address, 4, 1)
    ).to.equal(false)

    await contractOwner.withContract['signedTransferFrom(address,address,uint256,uint256,bytes)'](
      tokenOwner1.address, 
      tokenOwner2.address, 
      4, 1, signature
    )
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner2.address)
    expect(
      await contractOwner.withContract.isTransferConsumed(tokenOwner1.address, tokenOwner2.address, 4, 1)
    ).to.equal(true)
  })

  it('Should not sign off a transfer', async function () {
    const { contractOwner, tokenOwner1, tokenOwner2 } = this.signers

    let message = signTransfer(tokenOwner1.address, tokenOwner2.address, 4, 1)
    let signature = await tokenOwner1.signMessage(message)

    await expect(//already consumed
      contractOwner.withContract['signedTransferFrom(address,address,uint256,uint256,bytes)'](
        tokenOwner1.address, 
        tokenOwner2.address, 
        4, 1, signature
      )
    ).to.be.revertedWith('InvalidCall()')

    message = signTransfer(tokenOwner1.address, tokenOwner2.address, 2, 1)
    signature = await tokenOwner1.signMessage(message)

    await expect(//wrong nonce
      contractOwner.withContract['signedTransferFrom(address,address,uint256,uint256,bytes)'](
        tokenOwner1.address, 
        tokenOwner2.address, 
        2, 2, signature
      )
    ).to.be.revertedWith('InvalidCall()')

    await expect(//wrong token
      contractOwner.withContract['signedTransferFrom(address,address,uint256,uint256,bytes)'](
        tokenOwner1.address, 
        tokenOwner2.address, 
        3, 1, signature
      )
    ).to.be.revertedWith('InvalidCall()')

    await expect(//wrong receipient
      contractOwner.withContract['signedTransferFrom(address,address,uint256,uint256,bytes)'](
        contractOwner.address, 
        tokenOwner2.address, 
        2, 1, signature
      )
    ).to.be.revertedWith('InvalidCall()')
  })
})