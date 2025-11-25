import { defineStore } from 'pinia'
import type { Notification } from '~/types'

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [] as Notification[],
    loading: false,
    unreadCount: 0
  }),
  
  getters: {
    getAllNotifications: (state) => state.notifications,
    
    getUnreadNotifications: (state) => {
      return state.notifications.filter(n => !n.is_read)
    },
    
    getReadNotifications: (state) => {
      return state.notifications.filter(n => n.is_read)
    },
    
    getUnreadCount: (state) => {
      return state.notifications.filter(n => !n.is_read).length
    },
    
    getNotificationsByType: (state) => {
      return (actionType: string) => {
        return state.notifications.filter(n => n.action_type === actionType)
      }
    },
    
    getNotificationsByEntityType: (state) => {
      return (entityType: string) => {
        return state.notifications.filter(n => n.entity_type === entityType)
      }
    },
    
    // Group notifications by date
    getNotificationsByDate: (state) => {
      const groups: Record<string, Notification[]> = {
        today: [],
        yesterday: [],
        thisWeek: [],
        older: []
      }
      
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      state.notifications.forEach(notification => {
        const notificationDate = new Date(notification.created_at)
        
        if (notificationDate >= today) {
          groups.today.push(notification)
        } else if (notificationDate >= yesterday) {
          groups.yesterday.push(notification)
        } else if (notificationDate >= weekAgo) {
          groups.thisWeek.push(notification)
        } else {
          groups.older.push(notification)
        }
      })
      
      return groups
    }
  },
  
  actions: {
    async setNotifications(notifications: Notification[]) {
      this.notifications = notifications
      this.unreadCount = notifications.filter(n => !n.is_read).length
    },
    
    async addNotification(notification: Notification) {
      // Check if notification already exists (avoid duplicates)
      const exists = this.notifications.some(n => n.id === notification.id)
      if (!exists) {
        this.notifications.unshift(notification)
        if (!notification.is_read) {
          this.unreadCount++
        }
      }
    },
    
    async loadNotifications(userId?: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const user = useSupabaseUser()
        
        const targetUserId = userId || user.value?.id
        if (!targetUserId) {
          throw new Error('User ID is required')
        }
        
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('recipient_id', targetUserId)
          .order('created_at', { ascending: false })
          .limit(100) // Limit to most recent 100 notifications
        
        if (error) throw error
        
        this.notifications = data || []
        this.unreadCount = data?.filter(n => !n.is_read).length || 0
        
        return data
      } catch (error) {
        console.error('Error loading notifications:', error)
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async loadUnreadCount(userId?: string) {
      try {
        const supabase = useSupabaseClient()
        const user = useSupabaseUser()
        
        const targetUserId = userId || user.value?.id
        if (!targetUserId) {
          return 0
        }
        
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', targetUserId)
          .eq('is_read', false)
        
        if (error) throw error
        
        this.unreadCount = count || 0
        return this.unreadCount
      } catch (error) {
        console.error('Error loading unread count:', error)
        return 0
      }
    },
    
    async markAsRead(notificationId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { data, error } = await supabase
          .from('notifications')
          .update({
            is_read: true,
            read_at: new Date().toISOString()
          })
          .eq('id', notificationId)
          .select()
          .single()
        
        if (error) throw error
        
        // Update local state
        const index = this.notifications.findIndex(n => n.id === notificationId)
        if (index !== -1) {
          const wasUnread = !this.notifications[index].is_read
          this.notifications[index] = { ...this.notifications[index], ...data }
          if (wasUnread) {
            this.unreadCount = Math.max(0, this.unreadCount - 1)
          }
        }
        
        return data
      } catch (error) {
        console.error('Error marking notification as read:', error)
        throw error
      }
    },
    
    async markAllAsRead(userId?: string) {
      try {
        const supabase = useSupabaseClient()
        const user = useSupabaseUser()
        
        const targetUserId = userId || user.value?.id
        if (!targetUserId) {
          throw new Error('User ID is required')
        }
        
        const { error } = await supabase
          .from('notifications')
          .update({
            is_read: true,
            read_at: new Date().toISOString()
          })
          .eq('recipient_id', targetUserId)
          .eq('is_read', false)
        
        if (error) throw error
        
        // Update local state
        this.notifications = this.notifications.map(n => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString()
        }))
        this.unreadCount = 0
        
        return true
      } catch (error) {
        console.error('Error marking all notifications as read:', error)
        throw error
      }
    },
    
    async createNotification(notificationData: Partial<Notification>) {
      try {
        // Validation
        if (!notificationData.recipient_id) {
          throw new Error('recipient_id is required')
        }
        if (!notificationData.action_type) {
          throw new Error('action_type is required')
        }
        if (!notificationData.title) {
          throw new Error('title is required')
        }
        
        const supabase = useSupabaseClient()
        
        const insertData = {
          recipient_id: notificationData.recipient_id,
          sender_id: notificationData.sender_id || null,
          sender_business_id: notificationData.sender_business_id || null,
          sender_business_type: notificationData.sender_business_type || null,
          action_type: notificationData.action_type,
          entity_type: notificationData.entity_type || null,
          entity_id: notificationData.entity_id || null,
          title: notificationData.title,
          message: notificationData.message || null,
          metadata: notificationData.metadata || {},
          is_read: false
        }
        
        const { data, error } = await supabase
          .from('notifications')
          .insert(insertData as any)
          .select()
          .single()
        
        if (error) {
          console.error('Error creating notification:', error)
          throw error
        }
        
        // Add to local state if it's for current user
        const user = useSupabaseUser()
        if (data && data.recipient_id === user.value?.id) {
          await this.addNotification(data)
        }
        
        return data
      } catch (error) {
        console.error('Error creating notification:', error)
        throw error
      }
    },
    
    async deleteNotification(notificationId: string) {
      try {
        const supabase = useSupabaseClient()
        
        const { error } = await supabase
          .from('notifications')
          .delete()
          .eq('id', notificationId)
        
        if (error) throw error
        
        // Remove from local state
        const wasUnread = this.notifications.find(n => n.id === notificationId)?.is_read === false
        this.notifications = this.notifications.filter(n => n.id !== notificationId)
        if (wasUnread) {
          this.unreadCount = Math.max(0, this.unreadCount - 1)
        }
        
        return true
      } catch (error) {
        console.error('Error deleting notification:', error)
        throw error
      }
    },
    
    // Subscribe to real-time notifications
    subscribeToNotifications(userId?: string) {
      const supabase = useSupabaseClient()
      const user = useSupabaseUser()
      
      const targetUserId = userId || user.value?.id
      if (!targetUserId) return null
      
      const channel = supabase
        .channel(`notifications:${targetUserId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_id=eq.${targetUserId}`
          },
          async (payload: any) => {
            if (payload.eventType === 'INSERT') {
              await this.addNotification(payload.new as Notification)
              this.unreadCount++
            } else if (payload.eventType === 'UPDATE') {
              const index = this.notifications.findIndex(n => n.id === payload.new.id)
              if (index !== -1) {
                const wasUnread = !this.notifications[index].is_read
                this.notifications[index] = payload.new as Notification
                if (wasUnread && payload.new.is_read) {
                  this.unreadCount = Math.max(0, this.unreadCount - 1)
                }
              }
            } else if (payload.eventType === 'DELETE') {
              const wasUnread = this.notifications.find(n => n.id === payload.old.id)?.is_read === false
              this.notifications = this.notifications.filter(n => n.id !== payload.old.id)
              if (wasUnread) {
                this.unreadCount = Math.max(0, this.unreadCount - 1)
              }
            }
          }
        )
        .subscribe()
      
      return channel
    },
    
    unsubscribeFromNotifications(channel: any) {
      if (channel) {
        const supabase = useSupabaseClient()
        supabase.removeChannel(channel)
      }
    }
  }
})

