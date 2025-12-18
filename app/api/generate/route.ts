import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sampleReflection } from '@/lib/schemas';

export async function POST(request: Request) {
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
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

    // For now, return the hardcoded sample reflection
    // This will be replaced with actual LLM call in Step 15
    return NextResponse.json({
      reflection: sampleReflection
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
