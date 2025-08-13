import { defineStore } from 'pinia'
import type { Merchant } from '~/types'

export const useMerchantStore = defineStore('merchant', {
  state: () => ({
    allMerchants: [] as Merchant[],
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getAllMerchants: (state) => state.allMerchants,
    
    // Additional computed properties
    getVerifiedMerchants: (state) => {
      return state.allMerchants.filter(merchant => merchant.compliance_verified)
    },
    

    
    getMerchantsByLocation: (state) => (lat: number, lng: number, radiusKm: number = 50) => {
      return state.allMerchants.filter(merchant => {
        if (!merchant.coordinates) return false
        
        const distance = calculateDistance(
          lat, lng, 
          merchant.coordinates.lat, merchant.coordinates.lng
        )
        return distance <= radiusKm
      })
    }
  },
  
  actions: {
    async setAllMerchants(merchants: Merchant[]) {
      this.allMerchants = merchants
    },
    
    async getMerchantById(id: string) {
      return this.allMerchants.find(merchant => merchant.id === id)
    },

    async createMerchant(merchantData: Partial<Merchant>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .insert(merchantData as any)
          .select()
          .single()

        if (error) throw error

        this.allMerchants.push(data)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.id,
          other_ids: [data.id],
          title: 'Merchant Created',
          description: `New merchant account created: ${data.merchant_name}`,
          type: 'merchant_created'
        })
        
        return data
      } catch (error) {
        console.error('Error creating merchant:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateMerchant(merchantId: string, updates: Partial<Merchant>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .update(updates as any)
          .eq('id', merchantId)
          .select()
          .single()

        if (error) throw error

        const index = this.allMerchants.findIndex(merchant => merchant.id === merchantId)
        if (index !== -1) {
          this.allMerchants[index] = { ...this.allMerchants[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating merchant:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteMerchant(merchantId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('merchants')
          .delete()
          .eq('id', merchantId)

        if (error) throw error

        // Remove from local state
        this.allMerchants = this.allMerchants.filter(merchant => merchant.id !== merchantId)
        
        // Create timeline item for merchant deletion
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: merchantId,
          other_ids: [merchantId],
          title: 'Merchant Deleted',
          description: `Merchant account deleted`,
          type: 'merchant_deleted'
        })
        
        return true
      } catch (error) {
        console.error('Error deleting merchant:', error)
        throw error
      }
    },

    async loadMerchants() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.allMerchants = data || []
        return data
      } catch (error) {
        console.error('Error loading merchants:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateComplianceStatus(merchantId: string, verified: boolean, score: number) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('merchants')
          .update({ 
            compliance_verified: verified, 
            compliance_score: score,
            updated_at: new Date().toISOString() 
          } as any)
          .eq('id', merchantId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.allMerchants.findIndex(merchant => merchant.id === merchantId)
        if (index !== -1) {
          this.allMerchants[index] = { ...this.allMerchants[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating compliance status:', error)
        throw error
      }
    }
  }
})

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
