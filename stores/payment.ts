import { defineStore } from 'pinia'
import type { Payment, Event } from '~/types'

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    payments: [] as Payment[],
    loading: false
  }),
  
  getters: {
    getAllPayments: (state) => state.payments,
    
    getPaymentsByMerchant: (state) => (merchantId: string) => {
      return state.payments.filter(p => p.merchant_id === merchantId)
    },
    
    getPaymentsByVendor: (state) => (vendorId: string) => {
      return state.payments.filter(p => p.vendor_id === vendorId)
    },
    
    getPaymentStats: (state) => (businessId: string, businessType: 'merchant' | 'vendor') => {
      const relevantPayments = businessType === 'merchant'
        ? state.payments.filter(p => p.merchant_id === businessId)
        : state.payments.filter(p => p.vendor_id === businessId)
      
      const totalSpent = relevantPayments.reduce((sum, p) => {
        if (businessType === 'merchant') {
          // Merchant pays: amount + platform_fee + processing_fee
          return sum + (p.amount || 0) + (p.platform_fee || 0) + (p.processing_fee || 0)
        } else {
          // Vendor receives: vendor_payout
          return sum + (p.vendor_payout || 0)
        }
      }, 0)
      
      const totalEventPayments = relevantPayments
        .filter(p => p.event_id)
        .reduce((sum, p) => {
          if (businessType === 'merchant') {
            return sum + (p.amount || 0) + (p.platform_fee || 0) + (p.processing_fee || 0)
          } else {
            return sum + (p.vendor_payout || 0)
          }
        }, 0)
      
      const totalPlatformFees = relevantPayments.reduce((sum, p) => sum + (p.platform_fee || 0), 0)
      const totalProcessingFees = relevantPayments.reduce((sum, p) => sum + (p.processing_fee || 0), 0)
      
      return {
        totalSpent,
        totalEventPayments,
        totalPlatformFees,
        totalProcessingFees,
        totalPayments: relevantPayments.length
      }
    }
  },
  
  actions: {
    async setPayments(payments: Payment[]) {
      this.payments = payments
    },
    
    async loadPaymentsForMerchant(merchantId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const eventStore = useEventStore()
        const vendorStore = useVendorStore()
        
        // Load payments - try merchant_id first, then payer_id as fallback
        let { data: paymentsData, error } = await supabase
          .from('payments')
          .select('*')
          .eq('merchant_id', merchantId)
          .order('created_at', { ascending: false })

        if (error) {
          // Try alternative field name
          const { data: altData, error: altError } = await supabase
            .from('payments')
            .select('*')
            .eq('payer_id', merchantId)
            .order('created_at', { ascending: false })
          
          if (altError) throw altError
          paymentsData = altData
        }

        // Load related data
        if (paymentsData && paymentsData.length > 0) {
          const eventIds = paymentsData.filter((p: any) => p.event_id).map((p: any) => p.event_id)
          const vendorIds = paymentsData.filter((p: any) => p.vendor_id).map((p: any) => p.vendor_id)
          
          // Ensure events are loaded
          if (eventStore.allEvents.length === 0) {
            await eventStore.loadEvents()
          }
          
          // Ensure vendors are loaded
          if (vendorStore.allVendors.length === 0) {
            await vendorStore.loadVendors()
          }
          
          // Get events and vendors from stores
          const eventsData: any = {}
          eventIds.forEach((eventId: string) => {
            const event = eventStore.allEvents.find((e: Event) => e.id === eventId)
            if (event) {
              eventsData[eventId] = {
                id: event.id,
                event_name: event.event_name || '',
                event_date: event.start,
                vendor_id: event.vendor
              }
            }
          })
          
          const vendorsData: any = {}
          vendorIds.forEach((vendorId: string) => {
            const vendor = vendorStore.allVendors.find((v: any) => v.id === vendorId)
            if (vendor) {
              vendorsData[vendorId] = {
                id: vendor.id,
                vendor_name: vendor.vendor_name
              }
            }
          })
          
          // Attach related data to payments
          paymentsData = paymentsData.map((payment: any) => ({
            ...payment,
            events: eventsData[payment.event_id],
            vendors: vendorsData[payment.vendor_id]
          }))
        }

        // Update state with all payments (merge to avoid duplicates)
        const existingIds = new Set(this.payments.map(p => p.id))
        const newPayments = (paymentsData || []).filter((p: any) => !existingIds.has(p.id))
        this.payments = [...this.payments, ...newPayments]
        
        return paymentsData || []
      } catch (error) {
        console.error('Error loading payments for merchant:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async loadPaymentsForVendor(vendorId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const eventStore = useEventStore()
        
        // Load payments where this vendor is the recipient
        const { data: paymentsData, error } = await supabase
          .from('payments')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })

        if (error) throw error

        // Load related event data
        if (paymentsData && paymentsData.length > 0) {
          const eventIds = paymentsData.filter((p: any) => p.event_id).map((p: any) => p.event_id)
          
          // Ensure events are loaded
          if (eventStore.allEvents.length === 0) {
            await eventStore.loadEvents()
          }
          
          const eventsData: any = {}
          eventIds.forEach((eventId: string) => {
            const event = eventStore.allEvents.find((e: Event) => e.id === eventId)
            if (event) {
              eventsData[eventId] = {
                id: event.id,
                event_name: event.event_name || '',
                start: event.start,
                end: event.end,
                location_address: event.location_address
              }
            }
          })
          
          // Attach event data to payments
          paymentsData.forEach((payment: any) => {
            payment.events = eventsData[payment.event_id]
          })
        }

        // Update state with all payments (merge to avoid duplicates)
        const existingIds = new Set(this.payments.map(p => p.id))
        const newPayments = (paymentsData || []).filter((p: any) => !existingIds.has(p.id))
        this.payments = [...this.payments, ...newPayments]
        
        return paymentsData || []
      } catch (error) {
        console.error('Error loading payments for vendor:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})
