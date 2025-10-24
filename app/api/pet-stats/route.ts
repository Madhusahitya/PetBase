import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tokenId = searchParams.get('tokenId')
  
  if (!tokenId) {
    return NextResponse.json({ error: 'Token ID required' }, { status: 400 })
  }

  try {
    // For now, return mock data
    // In a real implementation, you'd call the contract here
    const mockStats = {
      tokenId,
      name: `Pet #${tokenId}`,
      health: 80 + (parseInt(tokenId) % 20),
      happiness: 75 + (parseInt(tokenId) % 25),
      level: Math.floor(parseInt(tokenId) / 3) + 1,
      owner: `0x${Math.random().toString(16).substr(2, 40)}`
    }

    return NextResponse.json(mockStats)
  } catch (error) {
    console.error('Error fetching pet stats:', error)
    return NextResponse.json({ error: 'Failed to fetch pet stats' }, { status: 500 })
  }
}
