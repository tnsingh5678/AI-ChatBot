import { supabase } from '@/lib/supabaseClient';// Import your Supabase client directly
import { z } from 'zod';

// Define the schema for validation
const chatSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'), 
  user_query: z.string().min(1, 'User query cannot be empty'),
  bot_response: z.string().min(1, 'Bot response cannot be empty'),
  chat_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request) {
  try {
    // Validate request body
    const validation = chatSchema.safeParse(await request.json());

    // If validation fails, return 400 with error details
    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validation.error.errors,
        }),
        { status: 400 }
      );
    }

    // Extracting our validate data
    const { user_id , user_query, bot_response, chat_id, metadata } = validation.data;

    // Storing to supabase db  
    const { data, error: dbError } = await supabase
      .from('chat_history')
      .insert([
        {
          user_id,
          user_query,
          bot_response,
          chat_id,
          metadata,
          timestamp: new Date().toISOString(),
        },
      ])
      .select();

    // If there was an error inserting into the database, return 500
    if (dbError) {
      console.error('Supabase error:', dbError);
      return new Response(
        JSON.stringify({
          error: 'Database error',
          details: dbError.message,
        }),
        { status: 500 }
      );
    }

    
    return new Response(
      JSON.stringify({
        success: true,
        data: data[0],
        message: 'Chat saved successfully',
      }),
      { status: 200 }
    );
  } catch (error) {

    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      { status: 500 }
    );
  }
}
