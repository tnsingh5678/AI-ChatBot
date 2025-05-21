'use client';

import { useState, useEffect } from 'react';
import useUser from '@/lib/useUser';
import { jsPDF } from 'jspdf';

const HistoryPage = () => {
  const user = useUser(); // Getting our currently authenticated user 
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user.id) {
        setError('Please log in to view chat history');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/chat/history?user_id=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch chat history');
        }
        const result = await response.json();

        if (result.error) {
          setError(result.error);
          return;
        }

        setHistory(result.data); 
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setError('Error fetching chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatMessage = (message) => {
    return message.split('\n').map((line, index) => (
      <p key={index} className="whitespace-pre-wrap">{line}</p>
    ));
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yOffset = 10; 

    doc.setFontSize(12);
    doc.text('Chat History', 14, yOffset); 
    yOffset += 10;

    history.forEach((msg) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`You:`, 14, yOffset);
      yOffset += 5;

      msg.user_query.split('\n').forEach((line) => {
        doc.text(line, 14, yOffset);
        yOffset += 6;
      });

      doc.text(`Bot:`, 14, yOffset);
      yOffset += 5;

      msg.bot_response.split('\n').forEach((line) => {
        doc.text(line, 14, yOffset);
        yOffset += 6;
      });

      yOffset += 10;
    });

    doc.save('chat_history.pdf');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-indigo-600 animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white font-sans min-h-screen px-6 py-12">
      <h1 className="text-4xl font-extrabold text-center mb-8 text-amber-600 bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
        Your Chat History
      </h1>
      <div className="mt-8 text-center">
        <button 
          onClick={generatePDF} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-indigo-700 hover:to-pink-600 transition-transform transform hover:scale-105"
        >
          Download Chat History as PDF
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-center text-lg">No chat history available.</p>
      ) : (
        <div className="space-y-6">
          {history.map((msg) => (
            <div key={msg.id} className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300">
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-xl shadow-md">
                  <p><strong>You:</strong></p>
                  {formatMessage(msg.user_query)}
                </div>
                <div className="bg-gradient-to-r from-gray-800 to-gray-600 text-white p-4 rounded-xl shadow-md">
                  <p><strong>Bot:</strong></p>
                  {formatMessage(msg.bot_response)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      
      
    </div>
  );
};

export default HistoryPage;
