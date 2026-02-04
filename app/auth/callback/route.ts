import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');
    const error_description = requestUrl.searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
        console.error('OAuth error:', error, error_description);
        return NextResponse.redirect(
            `${requestUrl.origin}/login?error=${encodeURIComponent(error_description || error)}`
        );
    }

    // Exchange code for session
    if (code) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
            process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_URL!,
            process.env.NEXT_PUBLIC_TASTEMUSESUPABASE_ANON_KEY!
        );

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            return NextResponse.redirect(
                `${requestUrl.origin}/login?error=${encodeURIComponent(exchangeError.message)}`
            );
        }

        // Successful authentication - redirect to home or dashboard
        return NextResponse.redirect(`${requestUrl.origin}/`);
    }

    // No code or error - redirect to login
    return NextResponse.redirect(`${requestUrl.origin}`);
}
