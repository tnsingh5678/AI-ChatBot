'use client';

import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import useUser from '@/lib/useUser';


pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [fileText, setFileText] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useUser();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let extractedText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(' ');
        extractedText += pageText + '\n';
      }

      setFileText(extractedText);
    } catch (err) {
      console.error('Error parsing PDF:', err);
    } finally {
      setLoading(false);
    }
  };

const handleSend = async () => {
  
    if (!user) {
      alert('Please log in to chat');
      return;
    }

    const prompt = input; 
    const reply = await askGemini(prompt);  // Asking our api GEMINI

    console.log(user.id)
    await saveChatHistory(user.id, input, reply);

    setMessages([...messages, { user_message: input, bot_reply: reply }]);
    setInput('');
  };

  const saveChatHistory = async (userId, userQuery, botResponse) => {
    try {
      const res = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id : userId,
          user_query: userQuery,
          bot_response: botResponse,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save chat');
      }
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

 return (
<main className="min-h-screen bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 p-8 text-white font-sans flex flex-col justify-center items-center overflow-hidden">
      <h1 className="text-5xl font-extrabold text-center text-white mb-10 text-shadow-md">
        Gemini Chat with PDF
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 mb-8 max-w-lg w-full">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 file:text-white hover:file:bg-gradient-to-r hover:file:from-indigo-600 hover:file:to-pink-600 focus:outline-none"
        />
        {loading && <p className="text-blue-600 mt-2 text-center text-lg">Loading PDF...</p>}
      </div>

      {fileText && (
        <div className="max-h-64 overflow-y-auto bg-white p-4 rounded-xl shadow-lg mb-8 max-w-lg w-full">
          <h3 className="text-lg font-semibold mb-2 text-gray-800">PDF Content Preview:</h3>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">{fileText.slice(0, 1000)}...</pre>
        </div>
      )}

      <div className="w-full max-w-lg space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className="flex flex-col space-y-4">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-lg shadow-lg">
              <p className="text-md font-medium"><strong>You:</strong> {msg.user_message}</p>
            </div>
            <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-gray-100 p-4 rounded-lg shadow-lg">
              <p className="text-md font-medium"><strong>Bot:</strong> {msg.bot_reply}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center space-x-4 max-w-lg w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about the PDF..."
          className="flex-grow px-6 py-3 rounded-xl border border-gray-300 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-lg transition duration-300 ease-in-out"
        />
        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-700 hover:to-pink-700 transition duration-300 transform hover:scale-105"
        >
          Send
        </button>
      </div>
    </main>
  );
}

async function askGemini(prompt) {
  const res = await fetch('/api/ask-gemini', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();
  return data?.reply || 'No response from the model';
}
