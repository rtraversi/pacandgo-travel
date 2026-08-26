// Shared between the inquiry server action and the forms that call it.
// Kept out of app/actions/inquiry.ts because a 'use server' module may only
// export async functions — a non-function export there makes the whole module
// resolve with no exports at all at build time.

export type InquiryState = { ok: boolean; error: string | null }

/** Field name of the hidden honeypot input. A filled value means a bot. */
export const HONEYPOT_FIELD = 'company'
