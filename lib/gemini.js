export async function POST(req) {
  try {
    const { prompt } = await req.json();

   
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    const data = await response.json();

    if (response.ok && data?.candidates?.length > 0) {
      const reply = data.candidates[0]?.content?.parts?.[0]?.text;
  
      return new Response(JSON.stringify({ reply }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ reply: 'No response from Gemini API' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('Gemini API error:', err);
    return new Response(JSON.stringify({ reply: 'Error processing the request.' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
