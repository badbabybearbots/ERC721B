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

describe('ERC721B Standard Tests', function () {
  before(async function() {
    const [
      contractOwner, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5, 
      tokenOwner6
    ] = await getSigners('ERC721BPresetStandard', 'test', 'TEST')
    
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

  it('Should have zero tokens', async function () {
    const { contractOwner } = this.signers
    expect(await contractOwner.withContract.totalSupply()).to.equal(0)
  })

  it('Should mint', async function () {
    const {
      contractOwner, 
      tokenOwner1, 
      tokenOwner2,
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5
    } = this.signers

    expect(contractOwner.withContract.mint(tokenOwner5.address, 5))
      .to.emit(contractOwner.withContract, 'Transfer')
      .withArgs(
        '0x0000000000000000000000000000000000000000', 
        tokenOwner5.address,
        1
      )
    await contractOwner.withContract.mint(tokenOwner4.address, 4)
    await contractOwner.withContract.mint(tokenOwner3.address, 3)

    expect(await contractOwner.withContract.ownerOf(1)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(2)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(3)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(5)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(6)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(7)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(8)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(9)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(10)).to.equal(tokenOwner3.address)
    expect(await contractOwner.withContract.ownerOf(11)).to.equal(tokenOwner3.address)
    expect(await contractOwner.withContract.ownerOf(12)).to.equal(tokenOwner3.address)
    expect(await contractOwner.withContract.totalSupply()).to.equal(12)

    await expect(
      contractOwner.withContract.ownerOf(13)
    ).to.be.revertedWith(
      'NonExistentToken()'
    )

    await contractOwner.withContract.mint(tokenOwner2.address, 2)
    await contractOwner.withContract.mint(tokenOwner1.address, 1)

    expect(await contractOwner.withContract.ownerOf(13)).to.equal(tokenOwner2.address)
    expect(await contractOwner.withContract.ownerOf(14)).to.equal(tokenOwner2.address)
    expect(await contractOwner.withContract.ownerOf(15)).to.equal(tokenOwner1.address)
    expect(await contractOwner.withContract.totalSupply()).to.equal(15)
    
    await expect(
      contractOwner.withContract.ownerOf(16)
    ).to.be.revertedWith(
      'NonExistentToken()'
    )

    expect(
      await contractOwner.withContract.balanceOf(tokenOwner5.address)
    ).to.equal(5)

    expect(
      await contractOwner.withContract.balanceOf(tokenOwner4.address)
    ).to.equal(4)

    expect(
      await contractOwner.withContract.balanceOf(tokenOwner3.address)
    ).to.equal(3)

    expect(
      await contractOwner.withContract.balanceOf(tokenOwner2.address)
    ).to.equal(2)

    expect(
      await contractOwner.withContract.balanceOf(tokenOwner1.address)
    ).to.equal(1)
  })

  it('Should transfer', async function () {
    const { 
      contractOwner, 
      tokenOwner1, 
      tokenOwner2,
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5, 
      tokenOwner6
    } = this.signers

    await tokenOwner5.withContract.transferFrom(tokenOwner5.address, tokenOwner6.address, 2)
    await tokenOwner5.withContract.transferFrom(tokenOwner5.address, tokenOwner6.address, 1)
    await tokenOwner6.withContract.transferFrom(tokenOwner6.address, tokenOwner5.address, 2)

    expect(await contractOwner.withContract.ownerOf(1)).to.equal(tokenOwner6.address)
    expect(await contractOwner.withContract.ownerOf(2)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(3)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(4)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(5)).to.equal(tokenOwner5.address)
    expect(await contractOwner.withContract.ownerOf(6)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(7)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(8)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(9)).to.equal(tokenOwner4.address)
    expect(await contractOwner.withContract.ownerOf(10)).to.equal(tokenOwner3.address)
    expect(await contractOwner.withContract.ownerOf(11)).to.equal(tokenOwner3.address)
    expect(await contractOwner.withContract.ownerOf(12)).to.equal(tokenOwner3.address)
    expect(await contractOwner.withContract.ownerOf(13)).to.equal(tokenOwner2.address)
    expect(await contractOwner.withContract.ownerOf(14)).to.equal(tokenOwner2.address)
    expect(await contractOwner.withContract.ownerOf(15)).to.equal(tokenOwner1.address)
    
    await expect(
      contractOwner.withContract.ownerOf(16)
    ).to.be.revertedWith(
      'NonExistentToken()'
    )
  })

  it('Should approve', async function () {
    const { contractOwner, tokenOwner4, tokenOwner5, tokenOwner6 } = this.signers
    await tokenOwner5.withContract.approve(tokenOwner6.address, 2)
    expect(await contractOwner.withContract.getApproved(2)).to.equal(tokenOwner6.address)

    await tokenOwner4.withContract.setApprovalForAll(tokenOwner6.address, true)
    expect(
      await contractOwner.withContract.isApprovedForAll(
        tokenOwner4.address, 
        tokenOwner6.address
      )
    ).to.equal(true)
  })
})