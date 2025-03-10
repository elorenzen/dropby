import OpenAI from 'openai';
import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event: any) => {
    const stringParam:any = getQuery(event).string
    const client          = new OpenAI({ apiKey: useRuntimeConfig().openaiApiKey });
    const supabase        = await serverSupabaseClient(event)
    
    const image           = await client.images.generate({ prompt: stringParam });
    const imageUrl        = image.data[0].url;
    
    // Fetch the image from URL
    const response        = await fetch(imageUrl);
    const blob            = await response.blob();
    const fileName        = `menu_${Date.now()}.${blob.type.split('/')[1]}`;
    const file            = new File([blob], fileName, { type: blob.type });

    // Upload to Supabase bucket
    const { error } = await supabase.storage
      .from('menu_images')
      .upload(fileName, file)

    if (error) throw error

    // Return the stored file URL
    const { data: { publicUrl } } = supabase.storage
      .from('menu_images')
      .getPublicUrl(fileName)
    return publicUrl ? publicUrl : 'No response from OpenAI'
    // return image ? image.data[0].url : 'No response from OpenAI'

});