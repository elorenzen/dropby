import OpenAI from 'openai';

export default defineEventHandler(async (event: any) => {
    const stringParam:any = getQuery(event).string
    const client = new OpenAI({
        apiKey: useRuntimeConfig().openaiApiKey, 
      });
    
    const image = await client.images.generate({ prompt: stringParam });
    console.log(image)
    return image ? image.data[0].url : 'No response from OpenAI'
});