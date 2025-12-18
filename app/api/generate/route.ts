import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { generateReflection } from '@/lib/llm';

export async function POST(request: Request) {
  try {
    // Check authentication using server client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { entry_text } = body;

    // Validate input
    if (!entry_text || typeof entry_text !== 'string') {
      return NextResponse.json(
        { error: 'entry_text is required and must be a string' },
        { status: 400 }
      );
    }

    if (entry_text.trim().length === 0) {
      return NextResponse.json(
        { error: 'entry_text cannot be empty' },
        { status: 400 }
      );
    }

    if (entry_text.length > 5000) {
      return NextResponse.json(
        { error: 'entry_text must be 5000 characters or less' },
        { status: 400 }
      );
    }

    // Generate reflection using OpenAI
    const reflection = await generateReflection(entry_text);

    // Save journal entry to database
    const { data: entry, error: entryError } = await supabaseAdmin
      .from('journal_entries')
      .insert({ user_id: user.id, entry_text })
      .select('id')
      .single();

    if (entryError) {
      console.error('Error saving journal entry:', entryError);
      throw new Error('Failed to save journal entry');
    }

    // Save reflection output to database
    const { error: outputError } = await supabaseAdmin
      .from('journal_outputs')
      .insert({
        entry_id: entry.id,
        user_id: user.id,
        output: reflection
      });

    if (outputError) {
      console.error('Error saving reflection output:', outputError);
      throw new Error('Failed to save reflection');
    }

    return NextResponse.json({
      entry_id: entry.id,
      reflection
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Unable to generate reflection. Please try again.' },
      { status: 500 }
    );
  }
}
