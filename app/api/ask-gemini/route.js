import { GoogleGenAI } from '@google/genai';

// Initializing genai api key
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function POST(req) {
  try {
    
    const { prompt } = await req.json();

    // Calling our GenAI model for our request
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",  
      contents: prompt,
    });

   
  //  console.log('Gemini API Response:', response);

    return new Response(JSON.stringify({ reply: response.text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ reply: 'Error processing the request.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
