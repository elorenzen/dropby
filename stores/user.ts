import { defineStore } from 'pinia'
import type { User } from '~/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null as User | null,
    coordinates: '',
    users: [] as User[],
    description: '',
    loading: false,
    updating: false
  }),
  
  getters: {
    getUser: (state): User | null => state.user,
    getAllUsers: (state): User[] => state.users,
    getUserLocation: (state): string => state.coordinates,
    isAuthenticated: (state): boolean => !!state.user,
    userType: (state): string | null => state.user?.type || null,
    
    // Additional computed properties
    getUsersByType: (state) => (userType: string) => {
      return state.users.filter(user => user.type === userType)
    },
    
    getAdminUsers: (state) => {
      return state.users.filter(user => user.is_admin)
    },
    
    getContactableUsers: (state) => {
      return state.users.filter(user => user.available_to_contact)
    }
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
    },

    async createUser(userData: Partial<User>) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('users')
          .insert(userData as any)
          .select()
          .single()

        if (error) throw error

        this.users.push(data)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.id,
          other_ids: [data.id],
          title: 'User Created',
          description: `New user account created`,
          type: 'user_created'
        })
        
        return data
      } catch (error) {
        console.error('Error creating user:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId: string, updates: Partial<User>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('users')
          .update(updates as any)
          .eq('id', userId)
          .select()
          .single()

        if (error) throw error

        const index = this.users.findIndex(user => user.id === userId)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...data }
        }
        
        // Update current user if it's the same user
        if (this.user && this.user.id === userId) {
          this.user = { ...this.user, ...data }
        }
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.id,
          other_ids: [data.id],
          title: 'User Updated',
          description: `User profile updated`,
          type: 'user_updated'
        })
        
        return data
      } catch (error) {
        console.error('Error updating user:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteUser(userId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId)

        if (error) throw error

        // Remove from local state
        this.users = this.users.filter(user => user.id !== userId)
        
        // Clear current user if it's the same user
        if (this.user && this.user.id === userId) {
          this.user = null
        }
        
        // Create timeline item for user deletion
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: userId,
          other_ids: [userId],
          title: 'User Deleted',
          description: `User account deleted`,
          type: 'user_deleted'
        })
        
        return true
      } catch (error) {
        console.error('Error deleting user:', error)
        throw error
      }
    },

    async loadUsers() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.users = data || []
        return data
      } catch (error) {
        console.error('Error loading users:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async loadUserById(userId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()

        if (error) throw error
        
        return data
      } catch (error) {
        console.error('Error loading user:', error)
        throw error
      }
    },

    async updateUserProfile(updates: Partial<User>) {
      if (!this.user) throw new Error('No user logged in')
      
      return await this.updateUser(this.user.id, updates)
    },

    async toggleContactAvailability() {
      if (!this.user) throw new Error('No user logged in')
      
      const newStatus = !this.user.available_to_contact
      return await this.updateUser(this.user.id, { available_to_contact: newStatus })
    }
  }
})
