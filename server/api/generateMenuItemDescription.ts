import OpenAI from 'openai';

export default defineEventHandler(async (event: any) => {
    const string = getQuery(event).string
    const client = new OpenAI({
        apiKey: useRuntimeConfig().openaiApiKey, 
      });
    const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: 'Create a menu item description for the following menu item: ' + string }],
        model: 'gpt-4o-mini',
      });

    // console.log(chatCompletion)
    return chatCompletion ? chatCompletion.choices[0].message.content : 'No response from OpenAI'
});