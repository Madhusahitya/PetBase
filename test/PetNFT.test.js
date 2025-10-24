const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PetNFT", function () {
  let petNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const PetNFT = await ethers.getContractFactory("PetNFT");
    petNFT = await PetNFT.deploy();
    await petNFT.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await petNFT.name()).to.equal("PetPals");
      expect(await petNFT.symbol()).to.equal("PPET");
    });

    it("Should set the correct owner", async function () {
      expect(await petNFT.owner()).to.equal(owner.address);
    });
  });

  describe("Pet Minting", function () {
    it("Should mint a pet with correct stats", async function () {
      await petNFT.mintPet(addr1.address, "Test Pet", 100, 80, 1);
      
      const petStats = await petNFT.getPetStats(1);
      expect(petStats.health).to.equal(100);
      expect(petStats.happiness).to.equal(80);
      expect(petStats.level).to.equal(1);
      
      expect(await petNFT.ownerOf(1)).to.equal(addr1.address);
    });

    it("Should emit PetMinted event", async function () {
      await expect(petNFT.mintPet(addr1.address, "Test Pet", 100, 80, 1))
        .to.emit(petNFT, "PetMinted")
        .withArgs(addr1.address, 1, "Test Pet", 100, 80, 1);
    });
  });

  describe("Trait System", function () {
    beforeEach(async function () {
      await petNFT.mintPet(addr1.address, "Test Pet", 100, 80, 1);
    });

    it("Should allow pet owner to upgrade traits", async function () {
      await petNFT.connect(addr1).upgradeTrait(1, "laser eyes");
      
      const traits = await petNFT.getPetTraits(1);
      expect(traits[0]).to.equal("laser eyes");
    });

    it("Should emit TraitUpgraded event", async function () {
      await expect(petNFT.connect(addr1).upgradeTrait(1, "laser eyes"))
        .to.emit(petNFT, "TraitUpgraded")
        .withArgs(1, "laser eyes", addr1.address);
    });

    it("Should not allow non-owner to upgrade traits", async function () {
      await expect(petNFT.connect(addr2).upgradeTrait(1, "laser eyes"))
        .to.be.revertedWith("Not authorized to upgrade this pet");
    });
  });

  describe("Alliance System", function () {
    it("Should allow owner to add alliance members", async function () {
      await petNFT.addAlliance(addr1.address);
      expect(await petNFT.alliances(addr1.address)).to.be.true;
    });

    it("Should emit AllianceAdded event", async function () {
      await expect(petNFT.addAlliance(addr1.address))
        .to.emit(petNFT, "AllianceAdded")
        .withArgs(addr1.address);
    });

    it("Should allow alliance members to upgrade any pet", async function () {
      await petNFT.mintPet(addr2.address, "Test Pet", 100, 80, 1);
      await petNFT.addAlliance(addr1.address);
      
      await petNFT.connect(addr1).upgradeTrait(1, "laser eyes");
      const traits = await petNFT.getPetTraits(1);
      expect(traits[0]).to.equal("laser eyes");
    });

    it("Should not allow non-owner to add alliance members", async function () {
      await expect(petNFT.connect(addr1).addAlliance(addr2.address))
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Error Handling", function () {
    it("Should revert when getting stats for non-existent pet", async function () {
      await expect(petNFT.getPetStats(1))
        .to.be.revertedWith("Pet does not exist");
    });

    it("Should revert when upgrading traits for non-existent pet", async function () {
      await expect(petNFT.upgradeTrait(1, "laser eyes"))
        .to.be.revertedWith("Pet does not exist");
    });
  });
});
