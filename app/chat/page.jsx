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
  const [loadingReply, setLoadingReply] = useState(false); 
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
    setLoadingReply(true); 
    const reply = await askGemini(prompt);  

    console.log(user.id);
    await saveChatHistory(user.id, input, reply);

    setMessages([...messages, { user_message: input, bot_reply: reply }]);
    setInput('');
    setLoadingReply(false); 
  };

  const saveChatHistory = async (userId, userQuery, botResponse) => {
    try {
      const res = await fetch('/api/chat/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
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

 
  const formatMessage = (message) => {
    return message.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white font-sans px-6 py-12 flex flex-col items-center gap-8 overflow-auto">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-center drop-shadow-lg">
        Gemini Chat with PDF
      </h1>

  
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-2xl hover:shadow-purple-400/30 transition duration-300 max-w-lg w-full">
        <label className="block text-lg font-medium mb-2 text-white">Upload a PDF</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileUpload}
          className="block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-indigo-500 file:to-purple-600 hover:file:from-indigo-600 hover:file:to-pink-600 transition-all"
        />
        {loading && <p className="text-indigo-200 mt-2 text-center text-lg animate-pulse">Loading PDF...</p>}
      </div>

    
      {fileText && (
        <div className="max-h-64 overflow-y-auto bg-white/10 backdrop-blur-lg p-4 rounded-xl shadow-lg max-w-lg w-full text-white">
          <h3 className="text-lg font-semibold mb-2">PDF Content Preview:</h3>
          <pre className="whitespace-pre-wrap text-sm">{fileText.slice(0, 1000)}...</pre>
        </div>
      )}

 
      <div className="w-full max-w-lg space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-2 animate-fade-in">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-xl shadow-lg">
              <p><strong>You:</strong> {formatMessage(msg.user_message)}</p>
            </div>
            <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white p-4 rounded-xl shadow-lg">
              <p><strong>Bot:</strong> {formatMessage(msg.bot_reply)}</p>
            </div>
          </div>
        ))}

       
        {loadingReply && (
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-4 rounded-xl shadow-lg animate-pulse">
            <p><strong>Bot is Generating...</strong></p>
          </div>
        )}
      </div>

  
      <div className="mt-6 flex items-center space-x-4 max-w-lg w-full">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about the PDF..."
          className="flex-grow px-6 py-3 rounded-xl border border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-300 shadow-md backdrop-blur-md"
        />
        <button
          onClick={handleSend}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-pink-600 transition-transform transform hover:scale-105"
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
