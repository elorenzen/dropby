import { defineStore } from 'pinia'
import type { MenuItem } from '~/types'

export const useMenuStore = defineStore('menu', {
  state: () => ({
    menuItems: [] as MenuItem[],
    loading: false,
    creating: false,
    updating: false
  }),
  
  getters: {
    getMenuItems: (state) => state.menuItems,
    
    // Additional computed properties
    getMenuItemsByType: (state) => (type: string) => {
      return state.menuItems.filter(item => item.type === type)
    },
    
    getSpecialMenuItems: (state) => {
      return state.menuItems.filter(item => item.special)
    },
    
    getMenuItemsByVendor: (state) => (vendorId: string) => {
      return state.menuItems.filter(item => item.vendor_id === vendorId)
    },
    
    getTypes: (state) => {
      return [...new Set(state.menuItems.map(item => item.type))]
    }
  },
  
  actions: {
    // Existing actions
    async setAllMenuItems(items: MenuItem[]) {
      this.menuItems = items
    },
    
    async getAllMenuItems() {
      return this.menuItems
    },

    // New actions to replace direct Supabase calls
    async createMenuItem(menuData: Partial<MenuItem>) {
      this.creating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('menu_items')
          .insert(menuData as any)
          .select()
          .single()

        if (error) throw error

        // Add to local state
        this.menuItems.push(data)
        
        // Create timeline item for menu item creation
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: data.vendor_id || '',
          other_ids: [data.id],
          title: 'Menu Item Added',
          description: `Added ${data.name} to menu`,
          type: 'menu_item_created'
        })
        
        return data
      } catch (error) {
        console.error('Error creating menu item:', error)
        throw error
      } finally {
        this.creating = false
      }
    },

    async updateMenuItem(itemId: string, updates: Partial<MenuItem>) {
      this.updating = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('menu_items')
          .update(updates as any)
          .eq('id', itemId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.menuItems.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.menuItems[index] = { ...this.menuItems[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error updating menu item:', error)
        throw error
      } finally {
        this.updating = false
      }
    },

    async deleteMenuItem(itemId: string) {
      try {
        // Get vendor_id before deletion
        const itemToDelete = this.menuItems.find(item => item.id === itemId)
        const vendorId = itemToDelete?.vendor_id || ''
        
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('menu_items')
          .delete()
          .eq('id', itemId)

        if (error) throw error

        // Remove from local state
        this.menuItems = this.menuItems.filter(item => item.id !== itemId)
        
        // Create timeline item for menu item deletion
        const timelineStore = useTimelineStore()
        await timelineStore.createTimelineItem({
          owner_id: vendorId,
          other_ids: [itemId],
          title: 'Menu Item Removed',
          description: `Removed menu item`,
          type: 'menu_item_deleted'
        })
        
        return true
      } catch (error) {
        console.error('Error deleting menu item:', error)
        throw error
      }
    },

    async loadMenuItems(vendorId: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('vendor_id', vendorId)
          .order('created_at', { ascending: false })

        if (error) throw error
        
        this.menuItems = data || []
        return data
      } catch (error) {
        console.error('Error loading menu items:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async toggleMenuItemSpecial(itemId: string) {
      try {
        const item = this.menuItems.find(item => item.id === itemId)
        if (!item) throw new Error('Menu item not found')

        const newStatus = !item.special
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('menu_items')
          .update({ special: newStatus, updated_at: new Date().toISOString() } as any)
          .eq('id', itemId)
          .select()
          .single()

        if (error) throw error

        // Update local state
        const index = this.menuItems.findIndex(item => item.id === itemId)
        if (index !== -1) {
          this.menuItems[index] = { ...this.menuItems[index], ...data }
        }
        
        return data
      } catch (error) {
        console.error('Error toggling menu item special status:', error)
        throw error
      }
    }
  }
})
