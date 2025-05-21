'use client'; 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';  
import { supabase } from '@/lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setAuthError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setAuthError(error.message);
      } else {
        alert('Check your email to confirm!');
      }
    } catch (error) {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    setAuthError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setAuthError(error.message);
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        await supabase.auth.setSession(session);
        console.log(session)
        if (session) {
          router.push('/chat'); 
        } else {
          setAuthError('No session found after login.');
        }
      }
    } catch (error) {
      setAuthError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/chat');
      }
    };
    checkSession();
  }, [router]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 text-white font-sans">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-6">Login / Signup</h2>

        {authError && <p className="text-red-500 text-center mb-4">{authError}</p>}

        <div className="space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
        
            required
            className="w-full px-4 py-3 text-base text-gray-700 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            
            className="w-full px-4 py-3 rounded-xl border text-base text-gray-700 border-blue-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300 ease-in-out"
          />
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={signIn}
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:bg-gradient-to-r hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={signUp}
            disabled={loading}
            className="w-full py-3 px-6 rounded-xl border-2 border-indigo-600 text-indigo-600 font-semibold hover:bg-indigo-600 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </div>
      </div>
    </main>
  );
}
