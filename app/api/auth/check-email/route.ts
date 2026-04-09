import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ exists: false }, { status: 400 });
        }

        // Use admin client to list users by email
        // Note: listUsers filters are limited, we'll use auth.admin.listUsers()
        // and check if any user exists with that email.
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error('Error fetching users:', error);
            // Don't leak internals, just say false or handle gracefully
            return NextResponse.json({ exists: false, error: 'Database error' }, { status: 500 });
        }

        const userExists = users.some(user => user.email?.toLowerCase() === email.toLowerCase());

        return NextResponse.json({ exists: userExists });
    } catch (err) {
        return NextResponse.json({ exists: false }, { status: 500 });
    }
}
