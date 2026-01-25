import { useToast as usePrimeToast } from 'primevue/usetoast'

export type ToastSeverity = 'success' | 'error' | 'info' | 'warn'

export interface ToastOptions {
  severity: ToastSeverity
  summary: string
  detail: string
  life?: number
  group?: string
}

/**
 * Global toast composable for showing notifications throughout the app
 * 
 * Supports multiple usage patterns:
 * 
 * @example
 * // Simple usage (auto-generates summary)
 * showToast('Information Updated!', 'success')
 * 
 * @example
 * // Detailed usage with all parameters
 * showToast('success', 'Request Approved', 'Event is now booked!', 5000)
 * 
 * @example
 * // Options object (full control)
 * showToast({
 *   severity: 'success',
 *   summary: 'Request Approved',
 *   detail: 'Event is now booked!',
 *   life: 5000
 * })
 */
export const useToast = () => {
  const toast = usePrimeToast()

  const showToast = (
    severityOrMessageOrOptions: ToastSeverity | string | ToastOptions,
    summaryOrSeverity?: string | ToastSeverity,
    detail?: string,
    life?: number
  ): void => {
    // Pattern 2: showToast(severity, summary, detail, life) - Detailed usage (check first)
    if (typeof severityOrMessageOrOptions === 'string' && 
        (severityOrMessageOrOptions === 'success' || severityOrMessageOrOptions === 'error' || 
         severityOrMessageOrOptions === 'info' || severityOrMessageOrOptions === 'warn') &&
        typeof summaryOrSeverity === 'string' && detail) {
      toast.add({
        severity: severityOrMessageOrOptions as ToastSeverity,
        summary: summaryOrSeverity,
        detail: detail,
        life: life || 3000,
        group: 'main'
      })
      return
    }
    
    // Pattern 1: showToast(message, severity) - Simple usage
    if (typeof severityOrMessageOrOptions === 'string' && 
        (summaryOrSeverity === 'success' || summaryOrSeverity === 'error' || 
         summaryOrSeverity === 'info' || summaryOrSeverity === 'warn' || !summaryOrSeverity)) {
      const message = severityOrMessageOrOptions
      const severityValue = (summaryOrSeverity as ToastSeverity) || 'info'
      const summary = severityValue === 'success' 
        ? 'Success' 
        : severityValue === 'error' 
        ? 'Error' 
        : severityValue === 'warn'
        ? 'Warning'
        : 'Info'

      toast.add({
        severity: severityValue,
        summary,
        detail: message,
        life: 3000,
        group: 'main'
      })
      return
    }
    
    // Pattern 3: showToast(options) - Options object
    if (typeof severityOrMessageOrOptions === 'object') {
      const options = severityOrMessageOrOptions as ToastOptions
      toast.add({
        severity: options.severity,
        summary: options.summary,
        detail: options.detail,
        life: options.life || 3000,
        group: options.group || 'main'
      })
      return
    }
    
    // Fallback - if nothing matches, log a warning
    console.warn('showToast: Invalid arguments', { severityOrMessageOrOptions, summaryOrSeverity, detail, life })
  }

  return {
    showToast,
    toast // Expose the underlying toast instance if needed
  }
}
