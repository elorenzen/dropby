// ============================================================================
// CENTRALIZED API CLIENT
// ============================================================================

import { transformError, type ApiError } from '~/types/api'

export const useApi = () => {
  const isDev = process.env.NODE_ENV === 'development'
  
  // MVP: Simple Set to track active requests (no requestId needed)
  const activeRequests = new Set<AbortController>()
  
  // Retry logic (Simplified for MVP: 1 retry with 1 second delay)
  const fetchWithRetry = async (
    url: string,
    options: any,
    maxRetries = 1, // MVP: Only 1 retry
    retryCount = 0
  ): Promise<any> => {
    try {
      const response = await $fetch(url, options)
      return response
    } catch (error: any) {
      const transformedError = transformError(error)
      
      // Don't retry client errors (4xx) except 429 (rate limit)
      if (!transformedError.isRetryable() || retryCount >= maxRetries) {
        throw transformedError
      }
      
      // MVP: Simple fixed delay (1 second) instead of exponential backoff
      // Post-MVP: Can upgrade to exponential backoff: Math.pow(2, retryCount) * 1000
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Retry the request
      return fetchWithRetry(url, options, maxRetries, retryCount + 1)
    }
  }
  
  // Main API call function
  const apiCall = async <T = any>(
    url: string,
    options: any = {}
  ): Promise<T> => {
    // MVP: Basic cancellation - track all active requests
    const abortController = new AbortController()
    activeRequests.add(abortController)
    const startTime = Date.now()
    
    try {
      // Request interceptor: Dev logging
      if (isDev) {
        console.log(`[API Request] ${options.method || 'GET'} ${url}`, {
          body: options.body,
          timestamp: new Date().toISOString()
        })
      }
      
      // Make request with retry logic
      const response = await fetchWithRetry(url, {
        ...options,
        signal: abortController.signal
      })
      
      // Response interceptor: Dev logging
      if (isDev) {
        const duration = Date.now() - startTime
        console.log(`[API Response] ${options.method || 'GET'} ${url}`, {
          status: 'success',
          duration: `${duration}ms`
        })
      }
      
      return response
    } catch (error: any) {
      // Don't throw if request was aborted (component unmounted)
      if (error.name === 'AbortError') {
        return null as T
      }
      
      // Transform and rethrow typed error
      throw transformError(error)
    } finally {
      activeRequests.delete(abortController)
    }
  }
  
  return {
    get: <T = any>(url: string, options?: any) =>
      apiCall<T>(url, { ...options, method: 'GET' }),
    post: <T = any>(url: string, body?: any, options?: any) =>
      apiCall<T>(url, { ...options, method: 'POST', body }),
    put: <T = any>(url: string, body?: any, options?: any) =>
      apiCall<T>(url, { ...options, method: 'PUT', body }),
    delete: <T = any>(url: string, options?: any) =>
      apiCall<T>(url, { ...options, method: 'DELETE' }),
    cancelAll: () => {
      activeRequests.forEach(controller => controller.abort())
      activeRequests.clear()
    }
  }
}
