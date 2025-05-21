'use client';

import { useState, useEffect } from 'react';
import useUser from '@/lib/useUser'; 

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

        setHistory(result.data); // Storing the chat history in state
      } catch (error) {
        console.error('Error fetching chat history:', error);
        setError('Error fetching chat history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Chat History</h1>
      {history.length === 0 ? (
        <p>No chat history available.</p>
      ) : (
        history.map((msg) => (
          <div key={msg.id} className="chat-history-item">
            <p><strong>You:</strong> {msg.user_query}</p>
            <p><strong>Bot:</strong> {msg.bot_response}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default HistoryPage;
