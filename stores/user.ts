import { defineStore } from 'pinia'

// Define proper interfaces
export interface User {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  type?: 'vendor' | 'merchant'
  associated_vendor_id?: string
  associated_merchant_id?: string
  is_admin?: boolean
  available_to_contact?: boolean
  created_at?: string
  [key: string]: any
}

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    coordinates: '',
    users: [] as User[],
    description: ''
  }),
  getters: {
    getUser: (state): User | null => state.user,
    getAllUsers: (state): User[] => state.users,
    getUserLocation: (state): string => state.coordinates,
    isAuthenticated: (state): boolean => !!state.user,
    userType: (state): 'vendor' | 'merchant' | null => state.user?.type || null
  },
  actions: {
    async setUser(userParam: User | null) {
      if (userParam) {
        this.user = userParam
      } else {
        this.user = null
      }
    },
    async setAllUsers(users: User[]) {
      this.users = users
    },
    async setUserLocation(coordinates: string) {
      this.coordinates = coordinates
    },
    async clearUser() {
      this.user = null
    }
  }
})
