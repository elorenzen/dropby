import { serverSupabaseServiceRole } from '#supabase/server'
import { requireSuperadmin } from '~/server/utils/requireSuperadmin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
  const admin = await requireSuperadmin(event)
  const client = await serverSupabaseServiceRole(event)
  const method = getMethod(event)

  if (method === 'GET') {
    const { data, error } = await client
      .from('beta_testers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({ statusCode: 500, statusMessage: 'Failed to load beta testers' })
    }
    return data ?? []
  }

  if (method === 'POST') {
    const body = await readBody(event)
    const { email, notes } = body

    if (!email || typeof email !== 'string') {
      throw createError({ statusCode: 400, statusMessage: 'Email is required' })
    }

    const normalizedEmail = email.trim().toLowerCase()

    const { data, error } = await client
      .from('beta_testers')
      .insert({
        email: normalizedEmail,
        notes: notes || null,
        added_by: admin.id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        throw createError({ statusCode: 409, statusMessage: 'This email is already a beta tester' })
      }
      throw createError({ statusCode: 500, statusMessage: 'Failed to add beta tester' })
    }

    const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://dropby.dev'
    const signUpUrl = `${siteUrl}/get-started`
    const loginUrl = `${siteUrl}/login`

    try {
      await resend.emails.send({
        from: 'DropBy Support <support@dropby.dev>',
        to: [normalizedEmail],
        subject: "You're invited to beta test DropBy",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You're invited to beta test DropBy</h2>
            <p>You've been added to our beta tester list. As a beta tester, you'll have access to all premium features at no cost while you help us improve the product.</p>
            <p><strong>Get started:</strong></p>
            <p><a href="${signUpUrl}" style="display: inline-block; padding: 12px 24px; background: #f97316; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Sign up</a> &nbsp; or &nbsp; <a href="${loginUrl}">Log in</a></p>
            <p>After you sign up and complete onboarding (create your establishment or food truck profile), your account will automatically have full premium access.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>This is an automated message from DropBy. Please do not reply to this email.</p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send beta invite email:', emailError)
    }

    return data
  }

  throw createError({ statusCode: 405, statusMessage: 'Method not allowed' })
})
