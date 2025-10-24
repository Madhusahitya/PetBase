const { Client } = require('@xmtp/xmtp-js')
const { ethers } = require('ethers')

async function testXMTPConnection() {
  console.log('🧪 Testing XMTP Connection...')
  
  try {
    // Create a test wallet
    const wallet = ethers.Wallet.createRandom()
    console.log('📝 Test wallet address:', wallet.address)
    
    // Test production environment
    console.log('🌐 Testing production environment...')
    try {
      const prodClient = await Client.create({
        signer: wallet,
        env: 'production'
      })
      console.log('✅ Production XMTP client created successfully!')
      console.log('📡 Client address:', prodClient.address)
      return true
    } catch (prodError) {
      console.log('❌ Production failed:', prodError.message)
    }
    
    // Test dev environment
    console.log('🔧 Testing dev environment...')
    try {
      const devClient = await Client.create({
        signer: wallet,
        env: 'dev'
      })
      console.log('✅ Dev XMTP client created successfully!')
      console.log('📡 Client address:', devClient.address)
      return true
    } catch (devError) {
      console.log('❌ Dev environment failed:', devError.message)
    }
    
    console.log('❌ All XMTP environments failed')
    return false
    
  } catch (error) {
    console.error('💥 XMTP test failed:', error)
    return false
  }
}

testXMTPConnection()
  .then(success => {
    if (success) {
      console.log('🎉 XMTP is working! Real-time chat should be available.')
    } else {
      console.log('⚠️ XMTP is not working. Chat will fall back to demo mode.')
    }
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })
