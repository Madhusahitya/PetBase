// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Interface for PET token with minting capability
interface IPETToken {
    function mint(address to, uint256 amount) external;
}

contract PetNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Pet stats structure
    struct PetStats {
        uint256 health;
        uint256 happiness;
        uint256 level;
    }
    
    // Mappings
    mapping(uint256 => PetStats) public petStats;
    // Global alliance (legacy) remains for authorization
    mapping(address => bool) public alliances;
    // Traits per pet
    mapping(uint256 => string[]) public petTraits;
    // Tribe members per pet (up to 10)
    mapping(uint256 => address[]) public tribeMembers;
    // Pet names
    mapping(uint256 => string) public petNames;
    // Level-up sellability (enabled at level 10)
    mapping(uint256 => bool) public sellEnabled;
    // Airdrop count per pet
    mapping(uint256 => uint256) public airdropCount;
    // Release value for level 10 pets (0.01 ETH)
    uint256 public constant RELEASE_VALUE = 0.01 ether;
    // Tribe participation threshold (50% of max health)
    uint256 public constant TRIBE_PARTICIPATION_THRESHOLD = 50;

    // PET token used for rewards
    address public petToken;
    
    // Events
    event PetMinted(uint256 indexed tokenId, address indexed owner, string name);
    event PetMintedDetailed(address indexed to, uint256 indexed tokenId, string name, uint256 health, uint256 happiness, uint256 level);
    event TraitUpgraded(uint256 indexed tokenId, string trait, address indexed upgrader);
    event AllianceAdded(address indexed member);
    event AllianceRemoved(address indexed member);
    event TribeJoined(uint256 indexed tokenId, address indexed user);
    event MilestoneRewarded(uint256 indexed tokenId, uint256 amount, uint256 split, uint256 recipients);
    event LevelUp(uint256 indexed tokenId, uint256 newLevel);
    event PetReleased(uint256 indexed tokenId, address indexed owner, uint256 amount);
    event AirdropDistributed(uint256 indexed tokenId, uint256 amount, uint256 level);
    
    constructor() ERC721("PetPals", "PPET") Ownable(msg.sender) payable {}
    
    // Modifier to check if caller is owner or tribe member
    modifier onlyOwnerOrTribe(uint256 tokenId) {
        require(ownerOf(tokenId) != address(0), "Pet does not exist");
        require(
            ownerOf(tokenId) == msg.sender || isTribeMember(tokenId, msg.sender),
            "Not authorized: owner or tribe member required"
        );
        _;
    }
    
    // Modifier to check if tribe is active (has sufficient participation)
    modifier tribeActive(uint256 tokenId) {
        require(ownerOf(tokenId) != address(0), "Pet does not exist");
        PetStats memory stats = petStats[tokenId];
        require(stats.health > TRIBE_PARTICIPATION_THRESHOLD, "Tribe participation too low");
        _;
    }
    
    // Check if address is a tribe member
    function isTribeMember(uint256 tokenId, address member) public view returns (bool) {
        address[] memory members = tribeMembers[tokenId];
        for (uint256 i = 0; i < members.length; i++) {
            if (members[i] == member) {
                return true;
            }
        }
        return false;
    }
    
    // Get total number of pets minted
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
    
    // Get pet name by token ID
    function getPetName(uint256 tokenId) public view returns (string memory) {
        return petNames[tokenId];
    }
    
    // Admin: set PET token address
    function setPetToken(address token) external onlyOwner {
        petToken = token;
    }
    
    // Admin: configure PET token minter role (call this after deploying both contracts)
    function configurePetTokenMinter() external onlyOwner {
        require(petToken != address(0), "PET token not set");
        // This function should be called after the PET token owner adds this contract as a minter
    }
    
    // Admin: fund contract for level 10 rewards
    function fundContract() external payable onlyOwner {
        // Contract can receive ETH for level 10 rewards
    }
    
    // Admin: withdraw excess ETH (only owner)
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "ETH withdrawal failed");
    }
    
    // Mint a new pet NFT
    function mintPet(
        address to,
        string memory name,
        uint256 health,
        uint256 happiness,
        uint256 level
    ) public {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        // Set pet stats
        petStats[tokenId] = PetStats({
            health: health,
            happiness: happiness,
            level: level
        });
        
        // Store pet name
        petNames[tokenId] = name;
        
        // Mint the NFT first
        _safeMint(to, tokenId);
        
        // Set placeholder IPFS URI after minting
        string memory tokenUri = string(abi.encodePacked("ipfs://QmPlaceholderHash/", _toString(tokenId), ".json"));
        _setTokenURI(tokenId, tokenUri);
        
        // Emit events for real-time tracking
        emit PetMinted(tokenId, to, name);
        emit PetMintedDetailed(to, tokenId, name, health, happiness, level);
    }
    
    // Self-join tribe for a specific pet. Max 10 members, no duplicates
    function tribeJoin(uint256 tokenId) external {
        require(ownerOf(tokenId) != address(0), "Pet does not exist");
        address[] storage members = tribeMembers[tokenId];
        require(members.length < 10, "Tribe is full");
        for (uint256 i = 0; i < members.length; i++) {
            require(members[i] != msg.sender, "Already in tribe");
        }
        members.push(msg.sender);
        emit TribeJoined(tokenId, msg.sender);
    }

    // Reward tribe members on milestone. Requires level >=5.
    // Distributes `amount` equally using transferFrom from caller to each member.
    function onMilestone(uint256 tokenId, uint256 amount) external {
        require(ownerOf(tokenId) != address(0), "Pet does not exist");
        require(petStats[tokenId].level >= 5, "Level too low");
        require(amount > 0, "Invalid amount");
        address[] storage members = tribeMembers[tokenId];
        require(members.length > 0, "No tribe members");
        require(petToken != address(0), "PET not set");
        uint256 share = amount / members.length;
        require(share > 0, "Amount too small");
        IERC20 token = IERC20(petToken);
        for (uint256 i = 0; i < members.length; i++) {
            bool ok = token.transferFrom(msg.sender, members[i], share);
            require(ok, "Transfer failed");
        }
        emit MilestoneRewarded(tokenId, amount, share, members.length);
    }
    
    // Get pet stats
    function getPetStats(uint256 tokenId) public view returns (PetStats memory) {
        require(ownerOf(tokenId) != address(0), "Pet does not exist");
        return petStats[tokenId];
    }
    
    // Upgrade pet trait (only owner or alliance member)
    function upgradeTrait(uint256 tokenId, string memory trait) public {
        require(ownerOf(tokenId) != address(0), "Pet does not exist");
        require(
            ownerOf(tokenId) == msg.sender || alliances[msg.sender],
            "Not authorized to upgrade this pet"
        );
        
        petTraits[tokenId].push(trait);
        emit TraitUpgraded(tokenId, trait, msg.sender);
    }
    
    // Alliance management (only owner)
    function addAlliance(address member) public onlyOwner {
        alliances[member] = true;
        emit AllianceAdded(member);
    }
    
    function removeAlliance(address member) public onlyOwner {
        alliances[member] = false;
        emit AllianceRemoved(member);
    }
    
    // Get pet traits
    function getPetTraits(uint256 tokenId) public view returns (string[] memory) {
        require(ownerOf(tokenId) != address(0), "Pet does not exist");
        return petTraits[tokenId];
    }
    
    // Level up a pet (requires health > 80 and authorization)
    function levelUp(uint256 tokenId) external onlyOwnerOrTribe(tokenId) tribeActive(tokenId) {
        PetStats storage stats = petStats[tokenId];
        require(stats.health > 80, "Insufficient health for level up");
        
        // Increment level
        stats.level++;
        
        // Emit level up event
        emit LevelUp(tokenId, stats.level);
        
        // Airdrop PET tokens to tribe members based on tier
        airdropToTribeMembers(tokenId);
        
        // If pet reaches level 10, enable selling and transfer ETH to owner
        if (stats.level == 10) {
            sellEnabled[tokenId] = true;
            address owner = ownerOf(tokenId);
            
            // Transfer 0.01 ETH to the owner
            (bool success, ) = payable(owner).call{value: RELEASE_VALUE}("");
            require(success, "ETH transfer failed");
            
            emit PetReleased(tokenId, owner, RELEASE_VALUE);
        }
    }
    
    // Airdrop PET tokens to tribe members based on tier
    function airdropToTribeMembers(uint256 tokenId) internal {
        require(petToken != address(0), "PET token not set");
        
        address[] memory members = tribeMembers[tokenId];
        if (members.length == 0) return;
        
        PetStats memory stats = petStats[tokenId];
        uint256 airdropAmount = 0;
        
        // Tier-based airdrop amounts
        if (stats.level == 5) {
            airdropAmount = 5 * 1e18; // 5 PET tokens at level 5
        } else if (stats.level == 10) {
            airdropAmount = 10 * 1e18; // 10 PET tokens at level 10
        } else if (sellEnabled[tokenId]) {
            airdropAmount = 20 * 1e18; // 20 PET tokens when selling is enabled
        }
        
        if (airdropAmount > 0) {
            // Mint tokens to each tribe member
            IPETToken petTokenContract = IPETToken(petToken);
            for (uint256 i = 0; i < members.length; i++) {
                try petTokenContract.mint(members[i], airdropAmount) {
                    // Mint successful
                } catch {
                    // If mint fails, skip this member
                    continue;
                }
            }
            
            // Update airdrop count
            airdropCount[tokenId] += airdropAmount * members.length;
            
            // Emit airdrop event
            emit AirdropDistributed(tokenId, airdropAmount, stats.level);
        }
    }
    
    // Helper function to convert uint256 to string
    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
