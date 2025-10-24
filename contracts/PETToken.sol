// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PETToken is ERC20, Ownable {
    uint256 public constant INITIAL_SUPPLY = 1000000 * 10**18; // 1 million tokens
    
    // Minter role for PetNFT contract
    mapping(address => bool) public minters;
    
    constructor() ERC20("PetPals Token", "PET") Ownable(msg.sender) {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    // Modifier to check if caller is a minter
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized minter");
        _;
    }
    
    // Add minter (only owner)
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
    }
    
    // Remove minter (only owner)
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
    }
    
    // Mint tokens for rewards (owner or minter)
    function mintRewards(address to, uint256 amount) public onlyMinter {
        _mint(to, amount);
    }
    
    // Mint tokens for pet activities (owner or minter)
    function mintForActivity(address to, uint256 amount) public onlyMinter {
        _mint(to, amount);
    }

    // Airdrop mint (owner or minter)
    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }
    
    // Burn tokens (for upgrades, etc.)
    function burnTokens(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}
