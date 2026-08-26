// Maps agent slug → public contact email. Only needed when it differs from the
// agent's login email in Supabase; unlisted agents fall back to their DB email.
//
// Server-only. These addresses must never be sent to the browser — the recipient
// of an inquiry is resolved inside the server action from the submitted slug, so
// the client never sees or supplies an address.
export const AGENT_EMAILS: Record<string, string> = {
  alan:     'pacandgoalan@gmail.com',
  aniska:   'pacandgoanissa@gmail.com',
  beth:     'pacandgobeth@gmail.com',
  connie:   'pacandgoconnie@gmail.com',
  dawn:     'pacandgodawn@gmail.com',
  denise:   'pacandgodenise@gmail.com',
  greg:     'pacandgogreg@gmail.com',
  jane:     'pacandgojane@gmail.com',
  joel:     'pacandgojoel@gmail.com',
  larry:    'pacandgolarry@gmail.com',
  norma:    'pacandgonorma@gmail.com',
  patty:    'pacandgopatty@gmail.com',
  rob:      'pacandgorob@gmail.com',
  rochelle: 'pacandgorochelle@gmail.com',
  rosemary: 'pacandgorosemary@gmail.com',
  sue:      'pacandgosue@gmail.com',
  any:      'pacandgopatty@gmail.com',
}

/** Inbox that receives inquiries when no specific agent was requested. */
export const HOUSE_EMAIL = AGENT_EMAILS.any

/** Address inquiry notifications are sent from. Replies go to the customer via reply_to. */
export const FROM_EMAIL = 'PAC and GO Travel <inquiries@pacandgotravel.com>'
