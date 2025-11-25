/**
 * Timeline Icon and Color System
 * Maps timeline item types to appropriate PrimeVue icons and CSS color classes
 */

export interface TimelineIconConfig {
  icon: string
  colorClass: string
  category: 'event' | 'business' | 'settings' | 'review'
}

/**
 * Get icon and color configuration for a timeline item type
 */
export const useTimelineIcons = () => {
  const getTimelineConfig = (type: string): TimelineIconConfig => {
    // Event-Related Actions (Primary/Cyan color)
    const eventActions: { [key: string]: TimelineIconConfig } = {
      'event_created': {
        icon: 'pi-calendar',
        colorClass: 'bg-primary-light text-primary-dark',
        category: 'event'
      },
      'event_booked': {
        icon: 'pi-calendar-plus',
        colorClass: 'bg-primary-light text-primary-dark',
        category: 'event'
      },
      'vendor_booked': {
        icon: 'pi-calendar-check',
        colorClass: 'bg-primary-light text-primary-dark',
        category: 'event'
      },
      'event_completed': {
        icon: 'pi-check-circle',
        colorClass: 'bg-success-light text-success-dark',
        category: 'event'
      },
      'event_cancelled': {
        icon: 'pi-calendar-times',
        colorClass: 'bg-error-light text-error-dark',
        category: 'event'
      },
      'recurring_event_created': {
        icon: 'pi-calendar-plus',
        colorClass: 'bg-primary-light text-primary-dark',
        category: 'event'
      },
      'recurring_event_updated': {
        icon: 'pi-calendar-clock',
        colorClass: 'bg-primary-light text-primary-dark',
        category: 'event'
      },
      'recurring_event_deleted': {
        icon: 'pi-calendar-minus',
        colorClass: 'bg-error-light text-error-dark',
        category: 'event'
      }
    }

    // Business Actions (Secondary/Gray color)
    const businessActions: { [key: string]: TimelineIconConfig } = {
      'menu_item_created': {
        icon: 'pi-file-plus',
        colorClass: 'bg-surface-border text-text-color-secondary',
        category: 'business'
      },
      'menu_item_deleted': {
        icon: 'pi-file-minus',
        colorClass: 'bg-surface-border text-text-color-secondary',
        category: 'business'
      },
      'partnership_request': {
        icon: 'pi-handshake',
        colorClass: 'bg-surface-border text-text-color-secondary',
        category: 'business'
      },
      'partnership_accepted': {
        icon: 'pi-handshake',
        colorClass: 'bg-success-light text-success-dark',
        category: 'business'
      }
    }

    // Settings-Related Actions (Success/Green color)
    const settingsActions: { [key: string]: TimelineIconConfig } = {
      'compliance_uploaded': {
        icon: 'pi-file-plus',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      },
      'compliance_verified': {
        icon: 'pi-file-check',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      },
      'user_created': {
        icon: 'pi-user-plus',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      },
      'user_updated': {
        icon: 'pi-user-edit',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      },
      'user_deleted': {
        icon: 'pi-user-minus',
        colorClass: 'bg-error-light text-error-dark',
        category: 'settings'
      },
      'vendor_created': {
        icon: 'pi-user-plus',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      },
      'vendor_deleted': {
        icon: 'pi-user-minus',
        colorClass: 'bg-error-light text-error-dark',
        category: 'settings'
      },
      'merchant_created': {
        icon: 'pi-user-plus',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      },
      'merchant_deleted': {
        icon: 'pi-user-minus',
        colorClass: 'bg-error-light text-error-dark',
        category: 'settings'
      },
      'subscription_changed': {
        icon: 'pi-dollar',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      },
      'profile_updated': {
        icon: 'pi-user-edit',
        colorClass: 'bg-success-light text-success-dark',
        category: 'settings'
      }
    }

    // Review Actions (Accent/Orange color)
    const reviewActions: { [key: string]: TimelineIconConfig } = {
      'review_submitted': {
        icon: 'pi-star-fill',
        colorClass: 'bg-accent-light text-accent-dark',
        category: 'review'
      },
      'review_updated': {
        icon: 'pi-star-half-fill',
        colorClass: 'bg-accent-light text-accent-dark',
        category: 'review'
      },
      'review_deleted': {
        icon: 'pi-star',
        colorClass: 'bg-accent-light text-accent-dark',
        category: 'review'
      }
    }

    // Combine all action maps
    const allActions = {
      ...eventActions,
      ...businessActions,
      ...settingsActions,
      ...reviewActions
    }

    // Return config for the type, or default
    return allActions[type] || {
      icon: 'pi-info-circle',
      colorClass: 'bg-primary-light text-primary-dark',
      category: 'event'
    }
  }

  return {
    getTimelineConfig
  }
}

