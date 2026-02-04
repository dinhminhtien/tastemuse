import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_URL!,
            process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.signOut();

        if (error) {
            return NextResponse.json(
                { error: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to sign out' },
            { status: 500 }
        );
    }
}
