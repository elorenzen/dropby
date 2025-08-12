import { defineStore } from 'pinia'

export interface Vendor {
  id: string
  vendor_name: string
  vendor_description: string
  cuisine: string[]
  phone: string
  email: string
  website: string
  instagram: string
  avatar_url: string
  formatted_address: string
  coordinates: { lat: number; lng: number }
  service_radius: number
  average_merchant_rating: number
  total_events: number
  compliance_verified: boolean
  compliance_score: number
  created_at: string
  updated_at: string
}

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
    // Existing actions
    async setAllVendors(vendors: Vendor[]) {
      this.allVendors = vendors
    },
    
    async getVendorById(id: string) {
      return this.allVendors.find(vendor => vendor.id === id)
    },

    // New actions to replace direct Supabase calls
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

        // Add to local state
        this.allVendors.push(data)
        
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

        // Update local state
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

        // Remove from local state
        this.allVendors = this.allVendors.filter(vendor => vendor.id !== vendorId)
        
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

        // Update local state
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

        // Calculate new average rating
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
