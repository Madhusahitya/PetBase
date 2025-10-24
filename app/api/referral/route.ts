import { NextRequest, NextResponse } from 'next/server'

// Mock referral tracking (in production, use Supabase or database)
const referrals = new Map<string, { count: number; invites: string[] }>()

export async function POST(request: NextRequest) {
  try {
    const { referrer, invitee } = await request.json()
    
    if (!referrer || !invitee) {
      return NextResponse.json({ error: 'Missing referrer or invitee' }, { status: 400 })
    }

    // Track referral
    const existing = referrals.get(referrer) || { count: 0, invites: [] }
    if (!existing.invites.includes(invitee)) {
      existing.count += 1
      existing.invites.push(invitee)
      referrals.set(referrer, existing)
    }

    return NextResponse.json({ 
      success: true, 
      referralCount: existing.count,
      referralCode: `ref_${referrer.slice(0, 8)}`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process referral' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const referrer = searchParams.get('referrer')
  
  if (!referrer) {
    return NextResponse.json({ error: 'Missing referrer' }, { status: 400 })
  }

  const data = referrals.get(referrer) || { count: 0, invites: [] }
  
  return NextResponse.json({
    referralCount: data.count,
    invites: data.invites,
    referralCode: `ref_${referrer.slice(0, 8)}`
  })
}
