const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function run() {
  try {
    const result = await model.generateContent('Say hello world');
    console.log(result.response.text());
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
