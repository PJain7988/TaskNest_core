import { config } from 'dotenv';
config();

import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
  try {
    console.log('Sending request to Groq...');
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello' }],
      model: 'llama3-70b-8192',
      response_format: undefined
    });
    console.log('Success:', response.choices[0]?.message?.content);
  } catch (err: any) {
    console.error('Groq Error:', err.message);
    if (err.response) {
      console.error('Response Data:', err.response.data);
    }
  }
}

test();
