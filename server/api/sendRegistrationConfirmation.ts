import { serverSupabaseClient } from '#supabase/server'
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default defineEventHandler(async (event) => {
    const client = await serverSupabaseClient(event)
    const query = getQuery(event)
    const content = `
        <h4><strong>Welcome to DropBy!</strong></h4>
        <p><strong>Use the credentials below to sign in and get started.</strong></p>
        <p>Username: ${query.email}</p>
        <p>Password: ${query.password}</p>
    `

    try {
      const data = await resend.emails.send({
        from: 'DropBy Support <getstarted@resend.dev>',
        to: [
            'eric.lorenzen@gmail.com'
        ],
        subject: 'Welcome to DropBy!',
        html: content,
      });

      return data;
    } catch (error) {
      console.log('error: ', error)
      return { error };
    }
});
