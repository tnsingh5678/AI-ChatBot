
"use client"
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const useUser = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
  
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error fetching session:', error.message);
        return;
      }
      setUser(data?.session?.user || null);
    };

    fetchUser();

   
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription?.unsubscribe();
    };
  }, []);

  return user;
};

export default useUser;
