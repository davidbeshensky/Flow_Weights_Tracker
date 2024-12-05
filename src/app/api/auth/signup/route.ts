import { supabase } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Create user with Supabase Auth
    const { data: user, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      throw authError;
    }

    return NextResponse.json({ message: 'User signed up successfully', user: user.user }, { status: 201 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'An unexpected error occurred';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
