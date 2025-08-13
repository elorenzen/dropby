import { defineStore } from 'pinia'
import type { Vendor } from '~/types'

export const useVendorStore = defineStore('vendor', {
  state: () => ({
    allVendors: [] as Vendor[],
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getAllVendors: (state) => state.allVendors,
    
    // Additional computed properties
    getVerifiedVendors: (state) => {
      return state.allVendors.filter(vendor => vendor.compliance_verified)
    },
    
    getVendorsByCuisine: (state) => (cuisineType: string) => {
      return state.allVendors.filter(vendor => vendor.cuisine.includes(cuisineType))
    },
    
    getTopRatedVendors: (state) => (limit: number = 10) => {
      return state.allVendors
        .filter(vendor => vendor.average_merchant_rating > 0)
        .sort((a, b) => b.average_merchant_rating - a.average_merchant_rating)
        .slice(0, limit)
    }
  },
  
  actions: {
    async setAllVendors(vendors: Vendor[]) {
      this.allVendors = vendors
    },
    
    async getVendorById(id: string) {
      return this.allVendors.find(vendor => vendor.id === id)
    },

    async createVendor(vendorData: Partial<Vendor>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .insert(vendorData as any)
          .select()
          .single()

        if (error) throw error

        this.allVendors.push(data)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.id,
          other_ids: [data.id],
          title: 'Vendor Created',
          description: `New vendor account created: ${data.vendor_name}`,
          type: 'vendor_created'
        })
        
        return data
      } catch (error) {
        console.error('Error creating vendor:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateVendor(vendorId: string, updates: Partial<Vendor>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .update(updates as any)
          .eq('id', vendorId)
          .select()
          .single()

        if (error) throw error

        const index = this.allVendors.findIndex(vendor => vendor.id === vendorId)
        if (index !== -1) {
          this.allVendors[index] = { ...this.allVendors[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating vendor:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteVendor(vendorId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('vendors')
          .delete()
          .eq('id', vendorId)

        if (error) throw error

        this.allVendors = this.allVendors.filter(vendor => vendor.id !== vendorId)
        
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: vendorId,
          other_ids: [vendorId],
          title: 'Vendor Deleted',
          description: `Vendor account deleted`,
          type: 'vendor_deleted'
        })
        
        return true
      } catch (error) {
        console.error('Error deleting vendor:', error)
        throw error
      }
    },

    async loadVendors() {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.allVendors = data || []
        return data
      } catch (error) {
        console.error('Error loading vendors:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateComplianceStatus(vendorId: string, verified: boolean, score: number) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .update({ 
            compliance_verified: verified, 
            compliance_score: score,
            updated_at: new Date().toISOString() 
          } as any)
          .eq('id', vendorId)
          .select()
          .single()

        if (error) throw error

        const index = this.allVendors.findIndex(vendor => vendor.id === vendorId)
        if (index !== -1) {
          this.allVendors[index] = { ...this.allVendors[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating compliance status:', error)
        throw error
      }
    },

    async updateVendorRating(vendorId: string, newRating: number) {
      try {
        const vendor = this.allVendors.find(v => v.id === vendorId)
        if (!vendor) throw new Error('Vendor not found')

        const currentTotal = vendor.average_merchant_rating * vendor.total_events
        const newTotal = currentTotal + newRating
        const newTotalEvents = vendor.total_events + 1
        const newAverage = newTotal / newTotalEvents

        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('vendors')
          .update({ 
            average_merchant_rating: Math.round(newAverage * 10) / 10,
            total_events: newTotalEvents,
            updated_at: new Date().toISOString() 
          } as any)
          .eq('id', vendorId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.allVendors.findIndex(v => v.id === vendorId)
        if (index !== -1) {
          this.allVendors[index] = { ...this.allVendors[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating vendor rating:', error)
        throw error
      }
    }
  }
})
