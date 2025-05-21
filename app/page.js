'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      router.push(session ? '/chat' : '/login');
    };
    checkSession();
  }, []);

  return (
    <main>
      <p>Redirecting...</p>
    </main>
  );
}
