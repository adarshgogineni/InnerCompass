import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { InteractiveReflectionSchema } from '@/lib/schemas';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication
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
    const { reflection } = body;

    // Validate reflection data
    if (!reflection) {
      return NextResponse.json(
        { error: 'reflection is required' },
        { status: 400 }
      );
    }

    // Validate against schema
    try {
      InteractiveReflectionSchema.parse(reflection);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid reflection data' },
        { status: 400 }
      );
    }

    // Verify the user owns this journal entry
    const { data: entry, error: entryError } = await supabaseAdmin
      .from('journal_entries')
      .select('user_id')
      .eq('id', id)
      .single();

    if (entryError || !entry) {
      return NextResponse.json(
        { error: 'Journal entry not found' },
        { status: 404 }
      );
    }

    if (entry.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update the reflection in the database
    const { error: updateError } = await supabaseAdmin
      .from('journal_outputs')
      .update({ output: reflection })
      .eq('entry_id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating reflection:', updateError);
      throw new Error('Failed to update reflection');
    }

    return NextResponse.json({
      success: true,
      message: 'Reflection updated successfully',
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Unable to update reflection. Please try again.' },
      { status: 500 }
    );
  }
}
