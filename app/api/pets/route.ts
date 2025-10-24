import { NextResponse } from 'next/server'

export async function GET() {
  const pets = Array.from({ length: 8 }).map((_, i) => ({
    tokenId: i + 1,
    name: `Pet ${i + 1}`,
    type: i % 3 === 0 ? 'puppy' : i % 3 === 1 ? 'kitten' : 'dragon',
    tribeSize: (i % 5) + 1,
    image: i % 3 === 0 ? 'https://place-puppy.com/300x200' : i % 3 === 1 ? 'https://placekitten.com/300/200' : 'https://picsum.photos/seed/drag/300/200',
    bio: 'Fun puppy squad!'
  }))
  return NextResponse.json({ pets })
}


