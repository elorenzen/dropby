import { serverSupabaseServiceRole } from '#supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseServiceRole(event)
    const body = await readBody(event)

    const { email, firstName, lastName, phone, isAdmin, availableToContact, type, associatedMerchantId, associatedVendorId, businessName } = body

    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required'
      })
    }

    if (!type) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User type is required'
      })
    }

    // Create auth user via Supabase admin API with invite
    const { data: authData, error: authError } = await client.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName
      }
    })

    if (authError) {
      throw createError({
        statusCode: 400,
        statusMessage: authError.message || 'Failed to create auth user'
      })
    }

    if (!authData?.user) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Auth user was not created'
      })
    }

    // Create user record in our database
    const { data: userData, error: dbError } = await client
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        phone: phone || null,
        is_admin: isAdmin || false,
        available_to_contact: availableToContact ?? true,
        type,
        associated_merchant_id: associatedMerchantId || null,
        associated_vendor_id: associatedVendorId || null,
        registered: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      // Clean up auth user if db insert fails
      await client.auth.admin.deleteUser(authData.user.id)
      throw createError({
        statusCode: 500,
        statusMessage: dbError.message || 'Failed to create user record'
      })
    }

    // Send invite email via Resend
    try {
      await resend.emails.send({
        from: 'DropBy Support <noreply@dropby.com>',
        to: [email],
        subject: `You've been invited to join ${businessName || 'a business'} on DropBy`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to DropBy!</h2>
            <p>You've been invited to join <strong>${businessName || 'a business'}</strong> on DropBy.</p>
            <p>Please check your email for a separate message with a link to set up your password and complete your account registration.</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>This is an automated message from DropBy. Please do not reply to this email.</p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send invite email:', emailError)
    }

    return { success: true, user: userData }
  } catch (error: any) {
    console.error('Invite user error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || error.message || 'Failed to invite user'
    })
  }
})
