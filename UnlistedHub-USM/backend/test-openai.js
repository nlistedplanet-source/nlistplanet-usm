import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

console.log('Testing OpenAI API...');
console.log('API Key:', process.env.OPENAI_API_KEY ? 'Set (' + process.env.OPENAI_API_KEY.substring(0,20) + '...)' : 'NOT SET');

try {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: 'Say hello in Hindi' }],
    max_tokens: 50
  });
  console.log('Success:', response.choices[0].message.content);
} catch (e) {
  console.error('Error:', e.message);
}
