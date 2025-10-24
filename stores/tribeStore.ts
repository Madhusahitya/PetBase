import { create } from 'zustand'

interface TribeMember {
  tokenId: string
  user: string
  joinedAt: number
}

interface TribeState {
  // Tribe memberships by tokenId
  tribeMemberships: { [tokenId: string]: boolean }
  
  // Tribe member details
  tribeMembers: { [tokenId: string]: TribeMember[] }
  
  // Actions
  setTribeMembership: (tokenId: string, isMember: boolean) => void
  addTribeMember: (tokenId: string, user: string) => void
  removeTribeMember: (tokenId: string, user: string) => void
  setTribeMembers: (tokenId: string, members: TribeMember[]) => void
  clearTribeData: () => void
}

export const useTribeStore = create<TribeState>((set) => ({
  tribeMemberships: {},
  tribeMembers: {},
  
  setTribeMembership: (tokenId: string, isMember: boolean) =>
    set((state) => ({
      tribeMemberships: {
        ...state.tribeMemberships,
        [tokenId]: isMember,
      },
    })),
    
  addTribeMember: (tokenId: string, user: string) =>
    set((state) => {
      const existingMembers = state.tribeMembers[tokenId] || []
      const isAlreadyMember = existingMembers.some(member => member.user === user)
      
      if (isAlreadyMember) return state
      
      const newMember: TribeMember = {
        tokenId,
        user,
        joinedAt: Date.now(),
      }
      
      return {
        tribeMembers: {
          ...state.tribeMembers,
          [tokenId]: [...existingMembers, newMember],
        },
      }
    }),
    
  removeTribeMember: (tokenId: string, user: string) =>
    set((state) => {
      const existingMembers = state.tribeMembers[tokenId] || []
      const filteredMembers = existingMembers.filter(member => member.user !== user)
      
      return {
        tribeMembers: {
          ...state.tribeMembers,
          [tokenId]: filteredMembers,
        },
      }
    }),
    
  setTribeMembers: (tokenId: string, members: TribeMember[]) =>
    set((state) => ({
      tribeMembers: {
        ...state.tribeMembers,
        [tokenId]: members,
      },
    })),
    
  clearTribeData: () =>
    set({
      tribeMemberships: {},
      tribeMembers: {},
    }),
}))
