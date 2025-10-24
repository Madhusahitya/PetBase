import { PublicClient } from 'viem'
import { PET_NFT_ADDRESS, PET_NFT_ABI_FINAL as PET_NFT_ABI } from './contracts'

export interface Pet {
  tokenId: string
  name: string
  petType: 'puppy' | 'kitten' | 'dragon'
  health: number
  happiness: number
  level: number
  traits: string[]
  owner: string
  tribeSize?: number
  maxTribeSize?: number
  tribeMembers?: string[]
}

export async function getAllPetsFromBlockchain(publicClient: PublicClient): Promise<Pet[]> {
  try {
  console.log('🚀 Starting getAllPetsFromBlockchain...')
  console.log('Contract address:', PET_NFT_ADDRESS)
  console.log('ABI length:', PET_NFT_ABI?.length)
  console.log('🔍 Contract address type:', typeof PET_NFT_ADDRESS)
  console.log('🔍 Is new contract?', PET_NFT_ADDRESS === '0x318E81B4a5472EB9E98E693CDC7274E79ab8e718')
    
    // Debug: List all available functions in the ABI
    console.log('🔍 Available functions in ABI:')
    PET_NFT_ABI.forEach((func: any, index: number) => {
      if (func.type === 'function' && func.stateMutability === 'view') {
        console.log(`  ${index}: ${func.name}(${func.inputs?.map((input: any) => input.type).join(', ') || ''})`)
      }
    })
    
    // Get total supply
    console.log('🔍 Attempting to call totalSupply on contract:', PET_NFT_ADDRESS)
    console.log('🔍 Using ABI with', PET_NFT_ABI.length, 'functions')
    
    let totalSupply: bigint
    try {
      totalSupply = await publicClient.readContract({
        address: PET_NFT_ADDRESS,
        abi: PET_NFT_ABI,
        functionName: 'totalSupply',
        args: [],
      }) as bigint
      console.log('✅ totalSupply call successful:', totalSupply)
    } catch (error) {
      console.error('❌ totalSupply call failed:', error)
      // Try alternative approach - check if contract exists
      try {
        const code = await publicClient.getCode({ address: PET_NFT_ADDRESS })
        console.log('🔍 Contract code at address:', code ? 'EXISTS' : 'NOT DEPLOYED')
        if (!code) {
          console.error('❌ Contract not deployed at address:', PET_NFT_ADDRESS)
          return []
        }
      } catch (codeError) {
        console.error('❌ Error checking contract code:', codeError)
      }
      
      // Fallback: Try to get token count by checking individual tokens
      console.log('🔄 Attempting fallback method to get token count...')
      try {
        // Try to get the _tokenIdCounter directly
        const tokenCounter = await publicClient.readContract({
          address: PET_NFT_ADDRESS,
          abi: PET_NFT_ABI,
          functionName: '_tokenIdCounter',
          args: [],
        }) as bigint
        console.log('✅ Got _tokenIdCounter:', tokenCounter)
        totalSupply = tokenCounter
      } catch (counterError) {
        console.error('❌ _tokenIdCounter also failed:', counterError)
        // Last resort: try to find tokens by checking ownership
        console.log('🔄 Trying to find tokens by checking ownership...')
        let foundTokens = 0
        for (let i = 1; i <= 100; i++) { // Check first 100 tokens
          try {
            await publicClient.readContract({
              address: PET_NFT_ADDRESS,
              abi: PET_NFT_ABI,
              functionName: 'ownerOf',
              args: [BigInt(i)],
            })
            foundTokens = i
          } catch {
            break // Token doesn't exist
          }
        }
        console.log(`🔍 Found ${foundTokens} tokens by checking ownership`)
        totalSupply = BigInt(foundTokens)
      }
    }

    console.log(`🔍 Total supply: ${totalSupply}`)

    if (totalSupply === BigInt(0)) {
      console.log('❌ No pets found - total supply is 0')
      return []
    }

    const pets: Pet[] = []
    const totalPets = Number(totalSupply)
    const batchSize = 100 // Process 100 pets at a time to avoid RPC limits

    // Process pets in batches to avoid RPC limits
    // Token IDs start from 1 (not 0) based on _tokenIdCounter in contract
    console.log(`📦 Processing ${totalPets} pets in batches of ${batchSize}`)
    
    for (let batchStart = 1; batchStart <= totalPets; batchStart += batchSize) {
      const batchEnd = Math.min(batchStart + batchSize - 1, totalPets)
      const batchCalls = []
      
      console.log(`🔄 Processing batch ${batchStart} to ${batchEnd}`)
      
      // Build multicall for this batch
      for (let i = batchStart; i <= batchEnd; i++) {
        const tokenId = BigInt(i)
        
        // Add 4 contract calls for this pet to batch (try getPetName instead of petNames)
        batchCalls.push(
          {
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'getPetStats',
            args: [tokenId],
          },
          {
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'getPetName',
            args: [tokenId],
          },
          {
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'ownerOf',
            args: [tokenId],
          },
          {
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'tokenURI',
            args: [tokenId],
          }
        )
      }

      console.log(`🔍 Making multicall for batch ${batchStart}-${batchEnd-1} with ${batchCalls.length} calls`)
      
      try {
        // Execute multicall for this batch
        const batchResults = await publicClient.multicall({
          contracts: batchCalls,
          allowFailure: true,
        })

        console.log(`✅ Multicall completed, got ${batchResults.length} results`)

        // Process results in groups of 4 (one group per pet)
        const batchPetCount = batchEnd - batchStart + 1
        console.log(`🔍 Processing ${batchPetCount} pets from batch results`)
        for (let i = 0; i < batchPetCount; i++) {
          const baseIndex = i * 4
          const [statsResult, nameResult, ownerResult, tokenURIResult] = batchResults.slice(baseIndex, baseIndex + 4)
          
          const petIndex = batchStart + i
          console.log(`🔍 Processing pet ${petIndex}:`, {
            stats: statsResult.status,
            name: nameResult.status,
            owner: ownerResult.status,
            tokenURI: tokenURIResult.status
          })
          
    // Try to get real data first, then fallback to basic data
    let petName = `Pet #${petIndex}`
    let petHealth = 80
    let petHappiness = 70
    let petLevel = 1
    let petOwner = '0x0000000000000000000000000000000000000000'
    
    // Try to get the owner (this usually works)
    if (ownerResult.status === 'success') {
      petOwner = ownerResult.result as string
      console.log(`✅ Got owner for pet ${petIndex}: ${petOwner}`)
    }
    
    // Try to get stats if available
    if (statsResult.status === 'success') {
      try {
        console.log(`🔍 Raw stats result for pet ${petIndex}:`, statsResult.result)
        
        // The result might be a struct or array, let's handle both cases
        let statsData = statsResult.result
        
        // If it's a struct with named properties
        if (typeof statsData === 'object' && statsData !== null) {
          if ('health' in statsData) {
            const stats = statsData as { health: bigint; happiness: bigint; level: bigint }
            petHealth = Number(stats.health)
            petHappiness = Number(stats.happiness)
            petLevel = Number(stats.level)
          } else if (Array.isArray(statsData)) {
            // If it's an array
            petHealth = Number(statsData[0])
            petHappiness = Number(statsData[1])
            petLevel = Number(statsData[2])
          }
        }
        
        console.log(`✅ Got stats for pet ${petIndex}: health=${petHealth}, happiness=${petHappiness}, level=${petLevel}`)
      } catch (e) {
        console.log(`⚠️ Stats parsing failed for pet ${petIndex}:`, e)
        console.log(`⚠️ Raw stats data:`, statsResult.result)
      }
    }
    
    // Try to get name from getPetName (function call)
    if (nameResult.status === 'success') {
      try {
        const name = nameResult.result as string
        console.log(`🔍 Raw name result for pet ${petIndex}:`, name)
        if (name && name !== '0x' && name.trim()) {
          petName = name.trim()
          console.log(`✅ Got name for pet ${petIndex}: ${petName}`)
        } else {
          console.log(`⚠️ Empty or invalid name for pet ${petIndex}:`, name)
        }
      } catch (e) {
        console.log(`⚠️ Name parsing failed for pet ${petIndex}:`, e)
      }
    } else {
      console.log(`❌ Name result failed for pet ${petIndex}:`, nameResult)
      console.log(`❌ Name error details:`, {
        status: nameResult.status,
        error: nameResult.error,
        result: nameResult.result
      })
      if (nameResult.error) {
        const msg = nameResult.error instanceof Error ? nameResult.error.message : String(nameResult.error)
        console.log(`❌ Name error message:`, msg)
        console.log(`❌ Name error code:`, (nameResult.error as any).code)
        console.log(`❌ Name error name:`, (nameResult.error as any).name)
      }
    }
    
    // Try to get pet type from available contract functions
    let petType: 'puppy' | 'kitten' | 'dragon' = 'puppy' // Default fallback
    
    try {
      console.log(`🔍 Attempting to get pet traits for pet ${petIndex}...`)
      // Use getPetTraits to determine pet type
      const traitsResult = await publicClient.readContract({
        address: PET_NFT_ADDRESS,
        abi: PET_NFT_ABI,
        functionName: 'getPetTraits',
        args: [BigInt(petIndex)],
      }) as any
      
      console.log(`🔍 Traits result for pet ${petIndex}:`, traitsResult)
      
      if (traitsResult && Array.isArray(traitsResult) && traitsResult.length > 0) {
        // Try to determine pet type from traits
        const traits = traitsResult.map(trait => trait.toLowerCase())
        console.log(`🔍 Pet ${petIndex} traits:`, traits)
        
        // Look for specific traits that indicate pet type
        if (traits.some(trait => trait.includes('dog') || trait.includes('puppy') || trait.includes('canine'))) {
          petType = 'puppy'
        } else if (traits.some(trait => trait.includes('cat') || trait.includes('kitten') || trait.includes('feline'))) {
          petType = 'kitten'
        } else if (traits.some(trait => trait.includes('dragon') || trait.includes('reptile') || trait.includes('scaly'))) {
          petType = 'dragon'
        } else {
          // Fallback to modulo if traits don't indicate type
          petType = petIndex % 3 === 0 ? 'puppy' : petIndex % 3 === 1 ? 'kitten' : 'dragon'
          console.log(`⚠️ Traits don't indicate pet type, using modulo fallback`)
        }
        
        console.log(`✅ Determined pet type from traits for pet ${petIndex}: ${petType}`)
      } else {
        console.log(`⚠️ No traits found, using modulo fallback`)
        petType = petIndex % 3 === 0 ? 'puppy' : petIndex % 3 === 1 ? 'kitten' : 'dragon'
      }
    } catch (error) {
      console.log(`⚠️ Could not get pet traits for pet ${petIndex}:`, error)
      console.log(`⚠️ Using fallback pet type based on index`)
      // Fallback to modulo for demo purposes
      petType = petIndex % 3 === 0 ? 'puppy' : petIndex % 3 === 1 ? 'kitten' : 'dragon'
    }
    
    console.log(`🎯 Final pet type for pet ${petIndex}: ${petType}`)

    // Generate meaningful fallback names based on pet stats
    if (petName === `Pet #${petIndex}`) {
      const adjectives = ['Happy', 'Brave', 'Loyal', 'Playful', 'Wise', 'Energetic', 'Gentle', 'Curious', 'Friendly', 'Adventurous']
      const names = ['Buddy', 'Max', 'Luna', 'Charlie', 'Bella', 'Rocky', 'Daisy', 'Milo', 'Zoe', 'Jack']
      
      const adjective = adjectives[petIndex % adjectives.length]
      const baseName = names[petIndex % names.length]
      petName = `${adjective} ${baseName}`
      console.log(`🎨 Generated fallback name for pet ${petIndex}: ${petName}`)
    }
    
    // Fallback: try to get name from tokenURI metadata (from multicall result)
    if (petName === `Pet #${petIndex}` && tokenURIResult.status === 'success') {
      try {
        const tokenURI = tokenURIResult.result as string
        console.log(`🔍 TokenURI for pet ${petIndex}:`, tokenURI)

        // Handle data URI (base64 or UTF-8 JSON)
        if (tokenURI?.startsWith('data:application/json')) {
          const base64Prefix = 'data:application/json;base64,'
          const utf8Prefix = 'data:application/json;utf8,'
          let jsonStr = ''
          if (tokenURI.startsWith(base64Prefix)) {
            const b64 = tokenURI.slice(base64Prefix.length)
            try {
              jsonStr = Buffer.from(b64, 'base64').toString('utf-8')
            } catch {}
          } else if (tokenURI.startsWith(utf8Prefix)) {
            jsonStr = decodeURIComponent(tokenURI.slice(utf8Prefix.length))
          }
          if (jsonStr) {
            try {
              const meta = JSON.parse(jsonStr)
              if (typeof meta?.name === 'string' && meta.name.trim()) {
                petName = meta.name.trim()
                console.log(`✅ Name from tokenURI for pet ${petIndex}: ${petName}`)
              }
            } catch {}
          }
        }

        // Handle remote HTTP(S) or IPFS URIs by best-effort fetch via browser (only in client)
        if (petName === `Pet #${petIndex}` && typeof window !== 'undefined' && tokenURI && (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs://'))) {
          const httpUrl = tokenURI.startsWith('ipfs://')
            ? `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`
            : tokenURI
          try {
            const res = await fetch(httpUrl)
            if (res.ok) {
              const meta = await res.json().catch(() => null)
              if (meta && typeof meta.name === 'string' && meta.name.trim()) {
                petName = meta.name.trim()
                console.log(`✅ Name fetched for pet ${petIndex}: ${petName}`)
              }
            }
          } catch {}
        }
      } catch (e) {
        console.log(`⚠️ TokenURI parsing failed for pet ${petIndex}:`, e)
      }
    }
    
    // petType is already set from blockchain metadata above
    
    // Fetch tribe members for this pet
    const activeTribeMembers: string[] = []
    try {
      for (let i = 0; i < 10; i++) {
        try {
          const member = await publicClient.readContract({
            address: PET_NFT_ADDRESS,
            abi: PET_NFT_ABI,
            functionName: 'tribeMembers',
            args: [BigInt(petIndex), BigInt(i)]
          }) as string
          
          if (member && member !== '0x0000000000000000000000000000000000000000') {
            activeTribeMembers.push(member)
          }
        } catch (error) {
          // If we get an error, we've reached the end of the array
          break
        }
      }
    } catch (error) {
      console.log(`⚠️ Failed to fetch tribe members for pet ${petIndex}:`, error)
    }

    pets.push({
      tokenId: petIndex.toString(),
      name: petName,
      petType,
      health: petHealth,
      happiness: petHappiness,
      level: petLevel,
      traits: ['friendly', 'playful'],
      owner: petOwner,
      tribeSize: activeTribeMembers.length,
      maxTribeSize: 10,
      tribeMembers: activeTribeMembers,
    })
    
    console.log(`✅ Created pet ${petIndex}: ${petName} (health: ${petHealth}, happiness: ${petHappiness}, level: ${petLevel})`)
        }
      } catch (error) {
        console.error(`❌ Error fetching batch ${batchStart}-${batchEnd-1}:`, error)
        console.log('🔄 Trying individual calls for this batch...')
        
        // Fallback: try to get real data with individual calls
        for (let i = batchStart; i <= batchEnd; i++) {
          console.log(`🔄 Trying individual calls for pet ${i}...`)
          
          let petName = `Pet #${i}`
          let petHealth = 80
          let petHappiness = 70
          let petLevel = 1
          let petOwner = '0x0000000000000000000000000000000000000000'
          
          try {
            // Try to get owner (this usually works)
            const owner = await publicClient.readContract({
              address: PET_NFT_ADDRESS,
              abi: PET_NFT_ABI,
              functionName: 'ownerOf',
              args: [BigInt(i)],
            })
            petOwner = owner as string
            console.log(`✅ Got owner for pet ${i}: ${petOwner}`)
          } catch (e) {
            console.log(`⚠️ Owner call failed for pet ${i}`)
          }
          
          // Try getPetName first (function)
          try {
            const name = await publicClient.readContract({
              address: PET_NFT_ADDRESS,
              abi: PET_NFT_ABI,
              functionName: 'getPetName',
              args: [BigInt(i)],
            })
            console.log(`🔍 Individual getPetName call for pet ${i}:`, name)
            if (name && name !== '0x' && typeof name === 'string' && name.trim()) {
              petName = name.trim()
              console.log(`✅ Got name for pet ${i} using getPetName: ${petName}`)
            } else {
              console.log(`⚠️ getPetName returned empty/invalid name for pet ${i}:`, name)
            }
          } catch (e) {
            console.log(`⚠️ getPetName failed for pet ${i}:`, e)
          }
          
          // Try petNames as fallback (mapping function)
          if (petName === `Pet #${i}`) {
            try {
              const name = await publicClient.readContract({
                address: PET_NFT_ADDRESS,
                abi: PET_NFT_ABI,
                functionName: 'petNames',
                args: [BigInt(i)],
              })
              console.log(`🔍 Individual petNames call for pet ${i}:`, name)
              if (name && name !== '0x' && typeof name === 'string' && name.trim()) {
                petName = name.trim()
                console.log(`✅ Got name for pet ${i} using petNames: ${petName}`)
              } else {
                console.log(`⚠️ petNames returned empty/invalid name for pet ${i}:`, name)
              }
            } catch (e) {
              console.log(`⚠️ petNames failed for pet ${i}:`, e)
            }
          }
          
          // Try other functions as fallback
          if (petName === `Pet #${i}`) {
            const functionNames = ['name', 'getName', 'petName', 'tokenName']
            for (const funcName of functionNames) {
              try {
                const name = await publicClient.readContract({
                  address: PET_NFT_ADDRESS,
                  abi: PET_NFT_ABI,
                  functionName: funcName,
                  args: [BigInt(i)],
                })
                if (name && name !== '0x' && typeof name === 'string') {
                  petName = name
                  console.log(`✅ Got name for pet ${i} using ${funcName}: ${petName}`)
                  break
                }
              } catch (e) {
                // Function doesn't exist or failed, try next one
              }
            }
          }
          
          // Generate meaningful fallback names if still no name
          if (petName === `Pet #${i}`) {
            const petType = i % 3 === 0 ? 'puppy' : i % 3 === 1 ? 'kitten' : 'dragon'
            const adjectives = ['Happy', 'Brave', 'Loyal', 'Playful', 'Wise', 'Energetic', 'Gentle', 'Curious', 'Friendly', 'Adventurous']
            const names = ['Buddy', 'Max', 'Luna', 'Charlie', 'Bella', 'Rocky', 'Daisy', 'Milo', 'Zoe', 'Jack']
            
            const adjective = adjectives[i % adjectives.length]
            const baseName = names[i % names.length]
            petName = `${adjective} ${baseName}`
            console.log(`🎨 Generated fallback name for pet ${i}: ${petName}`)
          }
          
          // Try tokenURI as last resort
          if (petName === `Pet #${i}`) {
            try {
              const tokenURI = await publicClient.readContract({
                address: PET_NFT_ADDRESS,
                abi: PET_NFT_ABI,
                functionName: 'tokenURI',
                args: [BigInt(i)],
              }) as string
              console.log(`🔍 TokenURI for pet ${i}:`, tokenURI)

              // Handle data URI (base64 or UTF-8 JSON)
              if (tokenURI?.startsWith('data:application/json')) {
                const base64Prefix = 'data:application/json;base64,'
                const utf8Prefix = 'data:application/json;utf8,'
                let jsonStr = ''
                if (tokenURI.startsWith(base64Prefix)) {
                  const b64 = tokenURI.slice(base64Prefix.length)
                  try {
                    jsonStr = Buffer.from(b64, 'base64').toString('utf-8')
                  } catch {}
                } else if (tokenURI.startsWith(utf8Prefix)) {
                  jsonStr = decodeURIComponent(tokenURI.slice(utf8Prefix.length))
                }
                if (jsonStr) {
                  try {
                    const meta = JSON.parse(jsonStr)
                    if (typeof meta?.name === 'string' && meta.name.trim()) {
                      petName = meta.name.trim()
                      console.log(`✅ Name from tokenURI for pet ${i}: ${petName}`)
                    }
                  } catch {}
                }
              }

              // Handle remote HTTP(S) or IPFS URIs by best-effort fetch via browser (only in client)
              if (petName === `Pet #${i}` && typeof window !== 'undefined' && tokenURI && (tokenURI.startsWith('http') || tokenURI.startsWith('ipfs://'))) {
                const httpUrl = tokenURI.startsWith('ipfs://')
                  ? `https://ipfs.io/ipfs/${tokenURI.replace('ipfs://', '')}`
                  : tokenURI
                try {
                  const res = await fetch(httpUrl)
                  if (res.ok) {
                    const meta = await res.json().catch(() => null)
                    if (meta && typeof meta.name === 'string' && meta.name.trim()) {
                      petName = meta.name.trim()
                      console.log(`✅ Name fetched for pet ${i}: ${petName}`)
                    }
                  }
                } catch {}
              }
            } catch (e) {
              console.log(`⚠️ TokenURI call failed for pet ${i}`)
            }
          }
          
          const petType = i % 3 === 0 ? 'puppy' : i % 3 === 1 ? 'kitten' : 'dragon'
          
          // Fetch tribe members for this pet
          const activeTribeMembers: string[] = []
          try {
            for (let j = 0; j < 10; j++) {
              try {
                const member = await publicClient.readContract({
                  address: PET_NFT_ADDRESS,
                  abi: PET_NFT_ABI,
                  functionName: 'tribeMembers',
                  args: [BigInt(i), BigInt(j)]
                }) as string
                
                if (member && member !== '0x0000000000000000000000000000000000000000') {
                  activeTribeMembers.push(member)
                }
              } catch (error) {
                // If we get an error, we've reached the end of the array
                break
              }
            }
          } catch (error) {
            console.log(`⚠️ Failed to fetch tribe members for pet ${i}:`, error)
          }

          pets.push({
            tokenId: i.toString(),
            name: petName,
            petType,
            health: petHealth,
            happiness: petHappiness,
            level: petLevel,
            traits: ['friendly', 'playful'],
            owner: petOwner,
            tribeSize: activeTribeMembers.length,
            maxTribeSize: 10,
            tribeMembers: activeTribeMembers,
          })
          
          console.log(`✅ Created pet ${i}: ${petName}`)
        }
      }
    }

    console.log(`✅ Fetched ${pets.length} pets from blockchain using multicall`)
    return pets
  } catch (error) {
    console.error('Error fetching pets from blockchain:', error)
    return []
  }
}

export function getDemoPetsFromLocalStorage(): Pet[] {
  try {
    const stored = localStorage.getItem('petbase-created-pets')
    if (!stored) return []
    
    const demoPets: Pet[] = JSON.parse(stored)
    return demoPets.map(pet => ({
      ...pet,
      tribeSize: 0,
      maxTribeSize: 10,
    }))
  } catch (error) {
    console.error('Error fetching demo pets:', error)
    return []
  }
}

export async function getAllPets(publicClient: PublicClient): Promise<Pet[]> {
  console.log('🔄 Cache busting - clearing any cached pet data...')
  
  // Clear any cached pet data to ensure fresh fetch
  if (typeof window !== 'undefined') {
    localStorage.removeItem('petbase-cached-pets')
    localStorage.removeItem('petbase-last-fetch')
    localStorage.removeItem('petbase-tribe-memberships')
    sessionStorage.clear() // Clear all session storage
  }
  
  // Only fetch blockchain pets - no more demo mode
  const blockchainPets = await getAllPetsFromBlockchain(publicClient)
  
  console.log(`✅ Fetched ${blockchainPets.length} blockchain pets (demo mode disabled)`)
  return blockchainPets
}
