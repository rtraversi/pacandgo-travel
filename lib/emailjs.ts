export const EMAILJS = {
  publicKey:  'z27LB5a5i1Xtgpt3q',
  serviceId:  'service_qouu00u',
  templateId: 'template_6ablo1d',
}

// Maps agent slug → public contact email. Only needed when it differs from the
// agent's login email in Supabase; unlisted agents fall back to their DB email.
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
