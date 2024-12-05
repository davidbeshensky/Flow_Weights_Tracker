import { supabase } from '@/lib/supabaseClient';
import {NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: 'missing required fields bozo'}, {status: 400});
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            throw error;
        }

        return NextResponse.json({ message: 'Login successful', user: data.user }, {status: 200});
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