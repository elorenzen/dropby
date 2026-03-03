/**
 * Environment detection and utilities for dev / staging / production.
 * Use NUXT_PUBLIC_APP_ENV in .env (development | staging | production).
 */

export type AppEnv = 'development' | 'staging' | 'production'

export function useEnvironment() {
  const config = useRuntimeConfig()
  const appEnv = (config.public.appEnv as AppEnv) || 'development'

  const isDev = appEnv === 'development'
  const isStaging = appEnv === 'staging'
  const isProd = appEnv === 'production'
  /** True when running in a deployed environment (staging or production). */
  const isLive = isStaging || isProd

  return {
    appEnv,
    isDev,
    isStaging,
    isProd,
    isLive
  }
}
