import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(req) {


  
  const user_id = req.nextUrl.searchParams.get('user_id');

  if (!user_id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {

    const { data, error } = await supabase
      .from('chat_history')
      .select('*')
      .eq('user_id', user_id) 
      .order('timestamp', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json({ error: 'Failed to fetch chat history' }, { status: 500 });
  }
}
