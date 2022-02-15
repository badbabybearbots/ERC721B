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

function hashToken(recipient) {
  return Buffer.from(
    ethers.utils.solidityKeccak256(
      ['string', 'address'],
      ['authorized', recipient]
    ).slice(2),
    'hex'
  )
}

async function getGas(wallet, action, ...params) {
  const tx = await wallet.withContract[action](...params)
  const gas = await tx.wait()
  return gas.gasUsed
}

describe('ERC721B Provenance Tests', function () {
  before(async function() {
    this.uri = 'https://ipfs.io/ipfs/'
    this.cid = 'Qm123abc'
    this.maxSupply = 25
    this.whitelistPrice = 0.008
    this.salePrice = 0.01

    this.whitelist = {
      startDate: Date.now() + (60 * 60 * 24 * 30),
      maxPurchase: 4,
      price: ethers.utils.parseEther(String(this.whitelistPrice))
    }

    this.sale = {
      startDate: Date.now() + (60 * 60 * 24 * 30 * 2),
      maxPurchase: 5,
      price: ethers.utils.parseEther(String(this.salePrice))
    }
    const [
      contractOwner, 
      tokenOwner1, 
      tokenOwner2, 
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5, 
      tokenOwner6, 
      tokenOwner7, 
      tokenOwner8, 
      tokenOwner9
    ] = await getSigners(
      'ERC721BPresetProvenance', 
      'test', 
      'TEST', 
      this.uri,
      this.cid,
      this.maxSupply,
      this.whitelist,
      this.sale
    )
    
    this.signers = { 
      contractOwner, 
      tokenOwner1, 
      tokenOwner2,
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5, 
      tokenOwner6, 
      tokenOwner7, 
      tokenOwner8, 
      tokenOwner9
    }
  })

  it('Should get contract uri', async function () {
    const { contractOwner } = this.signers
    expect(
      await contractOwner.withContract.contractURI()
    ).to.equal(`${this.uri}${this.cid}/contract.json`)
  })

  it('Should not mint', async function () {
    const { tokenOwner1 } = this.signers
    await expect(
      tokenOwner1.withContract.mint(
        tokenOwner1.address, 
        3, 
        { value: ethers.utils.parseEther(String(this.salePrice * 3)) 
      })
    ).to.be.revertedWith('SaleNotStarted()')
  })

  it('Should not authorize', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    const message = hashToken(tokenOwner1.address)
    const proof = await contractOwner.signMessage(message)
    await expect(
      tokenOwner1.withContract.authorize(
        tokenOwner1.address, 
        3, 
        proof,
        { value: ethers.utils.parseEther(String(this.salePrice * 3)) }
      )
    ).to.be.revertedWith('WhitelistNotStarted()')
  })
  
  it('Should error when getting token URI', async function () {
    const { contractOwner } = this.signers
    await expect(
      contractOwner.withContract.tokenURI(31)
    ).to.be.revertedWith('NonExistentToken()')
  })

  it('Should time travel to whitelist date', async function () {  
    await ethers.provider.send('evm_mine');
    await ethers.provider.send('evm_setNextBlockTimestamp', [this.whitelist.startDate]); 
    await ethers.provider.send('evm_mine');
  })

  it('Should not mint', async function () {
    const { tokenOwner1 } = this.signers
    await expect(
      tokenOwner1.withContract.mint(
        tokenOwner1.address, 
        3, 
        { value: ethers.utils.parseEther(String(this.salePrice * 3)) 
      })
    ).to.be.revertedWith('SaleNotStarted()')
  })

  it('Should authorize', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    const message = hashToken(tokenOwner1.address)
    const proof = await contractOwner.signMessage(message)
    await tokenOwner1.withContract.authorize(
      tokenOwner1.address, 
      3, 
      proof,
      { value: ethers.utils.parseEther(String(this.salePrice * 3)) 
    })

    expect(await tokenOwner1.withContract.totalSupply()).to.equal(3)
    expect(await tokenOwner1.withContract.balanceOf(tokenOwner1.address)).to.equal(3)
    expect(await tokenOwner1.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(3)).to.equal(tokenOwner1.address)
    await expect(tokenOwner1.withContract.ownerOf(4)).to.be.revertedWith('NonExistentToken()')
  })

  it('Should not authorize more than 4', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    const message = hashToken(tokenOwner1.address)
    const proof = await contractOwner.signMessage(message)
    await expect(
      tokenOwner1.withContract.authorize(
        tokenOwner1.address, 
        3, 
        proof,
        { value: ethers.utils.parseEther(String(this.salePrice * 3)) }
      )
    ).to.be.revertedWith('InvalidAmount()')
  })

  it('Should authorize max', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    const message = hashToken(tokenOwner1.address)
    const proof = await contractOwner.signMessage(message)
    await tokenOwner1.withContract.authorize(
      tokenOwner1.address, 
      1, 
      proof,
      { value: ethers.utils.parseEther(String(this.salePrice)) 
    })

    expect(await tokenOwner1.withContract.totalSupply()).to.equal(4)
    expect(await tokenOwner1.withContract.balanceOf(tokenOwner1.address)).to.equal(4)
    expect(await tokenOwner1.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(3)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(4)).to.equal(tokenOwner1.address)
    await expect(tokenOwner1.withContract.ownerOf(5)).to.be.revertedWith('NonExistentToken()')
  })

  it('Should time travel to sale date', async function () {  
    await ethers.provider.send('evm_mine');
    await ethers.provider.send('evm_setNextBlockTimestamp', [this.sale.startDate]); 
    await ethers.provider.send('evm_mine');
  })

  it('Should not authorize', async function () {
    const { contractOwner, tokenOwner1 } = this.signers
    const message = hashToken(tokenOwner1.address)
    const proof = await contractOwner.signMessage(message)
    await expect(
      tokenOwner1.withContract.authorize(
        tokenOwner1.address, 
        3, 
        proof,
        { value: ethers.utils.parseEther(String(this.salePrice * 3)) }
      )
    ).to.be.revertedWith('WhitelistEnded()')
  })

  it('Should mint', async function () {
    const { tokenOwner1, tokenOwner2 } = this.signers
    await tokenOwner2.withContract.mint(
      tokenOwner2.address, 
      3, 
      { value: ethers.utils.parseEther(String(this.salePrice * 3)) }
    )

    expect(await tokenOwner1.withContract.totalSupply()).to.equal(7)
    expect(await tokenOwner1.withContract.balanceOf(tokenOwner1.address)).to.equal(4)
    expect(await tokenOwner1.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(3)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(4)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.balanceOf(tokenOwner2.address)).to.equal(3)
    expect(await tokenOwner1.withContract.ownerOf(5)).to.equal(tokenOwner2.address)
    expect(await tokenOwner1.withContract.ownerOf(6)).to.equal(tokenOwner2.address)
    expect(await tokenOwner1.withContract.ownerOf(7)).to.equal(tokenOwner2.address)
    await expect(tokenOwner1.withContract.ownerOf(8)).to.be.revertedWith('NonExistentToken()')
  })

  it('Should not mint more than 5', async function () {
    const { tokenOwner2 } = this.signers
    await expect(
      tokenOwner2.withContract.mint(
        tokenOwner2.address, 
        3, 
        { value: ethers.utils.parseEther(String(this.salePrice * 3)) 
      })
    ).to.be.revertedWith('InvalidAmount()')
  })

  it('Should mint max', async function () {
    const { tokenOwner1, tokenOwner2 } = this.signers
    await tokenOwner2.withContract.mint(
      tokenOwner2.address, 
      2, 
      { value: ethers.utils.parseEther(String(this.salePrice * 2)) 
    })

    expect(await tokenOwner1.withContract.totalSupply()).to.equal(9)
    expect(await tokenOwner1.withContract.balanceOf(tokenOwner1.address)).to.equal(4)
    expect(await tokenOwner1.withContract.ownerOf(1)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(2)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(3)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.ownerOf(4)).to.equal(tokenOwner1.address)
    expect(await tokenOwner1.withContract.balanceOf(tokenOwner2.address)).to.equal(5)
    expect(await tokenOwner1.withContract.ownerOf(5)).to.equal(tokenOwner2.address)
    expect(await tokenOwner1.withContract.ownerOf(6)).to.equal(tokenOwner2.address)
    expect(await tokenOwner1.withContract.ownerOf(7)).to.equal(tokenOwner2.address)
    expect(await tokenOwner1.withContract.ownerOf(8)).to.equal(tokenOwner2.address)
    expect(await tokenOwner1.withContract.ownerOf(9)).to.equal(tokenOwner2.address)
    await expect(tokenOwner1.withContract.ownerOf(10)).to.be.revertedWith('NonExistentToken()')
  })

  it('Should withdraw', async function () {
    const { contractOwner } = this.signers

    expect(await contractOwner.withContract.indexOffset()).to.equal(0)

    const startingBalance = await contractOwner.getBalance()
    const contractBalance = await contractOwner.withContract.provider.getBalance(
      contractOwner.withContract.address
    )

    const tx = await contractOwner.withContract.withdraw()
    const gas = await tx.wait();

    const gasUsed = gas.gasUsed.mul(1000000000)
    const newBalance = await contractOwner.getBalance()
    const newContractBalance = await contractOwner.withContract.provider.getBalance(
      contractOwner.withContract.address
    )
    
    expect(newBalance).to.be.above(startingBalance)
    expect(parseFloat(newContractBalance)).to.equal(0)
    expect(await contractOwner.withContract.indexOffset()).to.be.above(0)
  })

  it('Should get the correct token URIs', async function () {
    const { contractOwner } = this.signers

    const max = parseInt(await contractOwner.withContract.MAX_SUPPLY())
    const offset = parseInt(await contractOwner.withContract.indexOffset())

    for (i = 1; i <= 9; i++) {
      const index = ((i + offset) % max) + 1

      expect(
        await contractOwner.withContract.tokenURI(i)
      ).to.equal(`${this.uri}${this.cid}/${index}.json`)
    }
  })

  it('Should mint a lot', async function () {
    const { 
      tokenOwner3, 
      tokenOwner4, 
      tokenOwner5, 
      tokenOwner6, 
      tokenOwner7 
    } = this.signers

    await getGas(tokenOwner3, 'mint', tokenOwner3.address, 1, 
      { value: ethers.utils.parseEther(String(this.salePrice * 1)) }
    )

    const gas = {}
    gas.mint1 = (await getGas(tokenOwner3, 'mint', tokenOwner3.address, 1, 
      { value: ethers.utils.parseEther(String(this.salePrice * 1)) }
    )).toString()

    gas.mint2 = (await getGas(tokenOwner4, 'mint', tokenOwner4.address, 2, 
      { value: ethers.utils.parseEther(String(this.salePrice * 2)) }
    )).toString()

    gas.mint3 = (await getGas(tokenOwner5, 'mint', tokenOwner5.address, 3, 
      { value: ethers.utils.parseEther(String(this.salePrice * 3)) }
    )).toString()

    gas.mint4 = (await getGas(tokenOwner6, 'mint', tokenOwner6.address, 4, 
      { value: ethers.utils.parseEther(String(this.salePrice * 4)) }
    )).toString()

    gas.mint5 = (await getGas(tokenOwner7, 'mint', tokenOwner7.address, 5, 
      { value: ethers.utils.parseEther(String(this.salePrice * 5)) }
    )).toString()
  })
})