/**
 * Admin configuration for TasteMuse
 */
export const ADMIN_EMAILS = [
    'tiendm.ce190701@gmail.com',
    'tastemusehihi@gmail.com' // Added as secondary admin from navigation top bar
];

export function isAdmin(email?: string | null): boolean {
    if (!email) return false;
    return ADMIN_EMAILS.includes(email.toLowerCase());
}
