// Quick test of the Gemini API key
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from 'dotenv';
config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
console.log('Key prefix:', apiKey?.slice(0, 8) + '...');
console.log('Key length:', apiKey?.length);

try {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('Sending test request...');
  const result = await model.generateContent('Say "hello" in one word.');
  console.log('✅ SUCCESS! Response:', result.response.text());
} catch (err) {
  console.error('❌ FAILED:', err.message);
  if (err.message.includes('API_KEY_INVALID')) {
    console.log('\n→ The API key is invalid. Get a new one at: https://aistudio.google.com/apikey');
  } else if (err.message.includes('429') || err.message.includes('quota')) {
    console.log('\n→ Rate limit / quota exceeded. The free tier daily limit was hit. Wait or upgrade.');
  } else if (err.message.includes('403')) {
    console.log('\n→ The API key does not have permission to use the Gemini API.');
  }
}
