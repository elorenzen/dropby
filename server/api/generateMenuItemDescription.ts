import OpenAI from 'openai';
import { serverSupabaseUser } from '#supabase/server'

const RATE_LIMIT_WINDOW_MS = 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 10
const requestLog = new Map<string, { count: number; windowStart: number }>()

export default defineEventHandler(async (event: any) => {
    const authUser = await serverSupabaseUser(event)
    if (!authUser) {
      throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
    }

    const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
    const now = Date.now()
    const entry = requestLog.get(ip)

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      requestLog.set(ip, { count: 1, windowStart: now })
    } else {
      if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        throw createError({ statusCode: 429, statusMessage: 'Too many requests, please try again shortly' })
      }
      entry.count += 1
      requestLog.set(ip, entry)
    }

    const string = String(getQuery(event).string || '').trim()
    if (!string || string.length < 2 || string.length > 120) {
      throw createError({ statusCode: 400, statusMessage: 'Please provide a menu item name between 2 and 120 characters' })
    }

    const config = useRuntimeConfig(event)
    if (!config.openaiApiKey) {
      throw createError({ statusCode: 500, statusMessage: 'OpenAI API key is not configured' })
    }

    const client = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: 'Create a menu item description for the following menu item: ' + string }],
        model: 'gpt-4o-mini',
      });

    // console.log(chatCompletion)
    return chatCompletion ? chatCompletion.choices[0].message.content : 'No response from OpenAI'
});