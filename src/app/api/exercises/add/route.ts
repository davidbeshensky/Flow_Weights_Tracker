import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ error: 'Missing exercise name' }, { status: 400 });
  }

  try {
    // Get the user session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Insert the exercise
    const { error } = await supabase
      .from('exercises')
      .insert({ name, user_id: session.user.id });

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Exercise added successfully' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
