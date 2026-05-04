// ============================================================
// Pac and Go Travel — EmailJS Contact Handler
// Service ID:  service_qouu00u
// Template ID: template_6ablo1d
// Public Key:  z27LB5a5i1Xtgpt3q
// ============================================================

const EMAILJS_CONFIG = {
  publicKey:  'z27LB5a5i1Xtgpt3q',
  serviceId:  'service_qouu00u',
  templateId: 'template_6ablo1d'
};

// Agent email routing table
const AGENT_EMAILS = {
  'alan-klein':        'pacandgoalan@gmail.com',
  'anissa-dean':       'pacandgoaniska@gmail.com',
  'beth-vanergrift':   'pacandgobeth@gmail.com',
  'connie-brant':      'pacandgoconnie@gmail.com',
  'dawn-roffey':       'pacandgodawn@gmail.com',
  'denise-berger':     'pacandgodenise@gmail.com',
  'jane-goerke':       'pacandgojane@gmail.com',
  'joel-trinidad':     'pacandgojoel@gmail.com',
  'larry-oakley':      'pacandgolarry@gmail.com',
  'norma-allen':       'pacandgonorma@gmail.com',
  'patty-wells':       'pacandgopatty@gmail.com',
  'robert-traversi':   'pacandgorob@gmail.com',
  'rochelle-coronado': 'pacandgorochelle@gmail.com',
  'rosemary-karnes':   'pacandgorosemary@gmail.com',
  'sue-muldoon':       'pacandgosue@gmail.com',
  'any':               'pacandgopatty@gmail.com'  // catch-all
};

// Initialize EmailJS once on page load
(function() {
  emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
})();

// ── AGENT PROFILE FORM ──────────────────────────────────────
// Used on every /agents/*.html page.
// Requires a <form id="agent-contact-form"> with:
//   data-agent-key="agent-slug"  on the <form> element
//   fields: #contact-name, #contact-email, #contact-phone, #contact-message
// ------------------------------------------------------------
function initAgentContactForm() {
  const form = document.getElementById('agent-contact-form');
  if (!form) return;

  const agentKey   = form.dataset.agentKey || 'any';
  const agentEmail = AGENT_EMAILS[agentKey] || AGENT_EMAILS['any'];

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('contact-status');

    // Basic validation
    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const phone   = document.getElementById('contact-phone') ? document.getElementById('contact-phone').value.trim() : '';
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showStatus(statusEl, 'error', 'Please fill in your name, email, and message.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';

    const templateParams = {
      to_email:   agentEmail,
      from_name:  name,
      reply_to:   email,
      phone:      phone || 'Not provided',
      message:    message,
      // Agent-profile forms don't always have travel details — send blanks
      travelers:  '',
      destination:'',
      travel_date:'',
      budget:     ''
    };

    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
      .then(function() {
        showStatus(statusEl, 'success', '✅ Message sent! Your agent will be in touch soon.');
        form.reset();
        btn.disabled = false;
        btn.textContent = 'Send Message';
      })
      .catch(function(err) {
        console.error('EmailJS error:', err);
        showStatus(statusEl, 'error', '❌ Something went wrong. Please try again or email us directly.');
        btn.disabled = false;
        btn.textContent = 'Send Message';
      });
  });
}

// ── MAIN INTAKE FORM ────────────────────────────────────────
// Used on index.html.
// Requires a <form id="main-intake-form"> with:
//   #intake-agent  (select dropdown — option values = agent keys e.g. "patty-wells")
//   #intake-name, #intake-email, #intake-phone
//   #intake-travelers, #intake-destination, #intake-date, #intake-budget
//   #intake-message
// ------------------------------------------------------------
function initMainIntakeForm() {
  const form = document.getElementById('main-intake-form');
  if (!form) return;

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const statusEl = document.getElementById('intake-status');

    const agentSelect = document.getElementById('intake-agent');
    const agentKey    = agentSelect ? agentSelect.value : 'any';
    const agentEmail  = AGENT_EMAILS[agentKey] || AGENT_EMAILS['any'];

    const name        = document.getElementById('intake-name').value.trim();
    const email       = document.getElementById('intake-email').value.trim();
    const phone       = document.getElementById('intake-phone') ? document.getElementById('intake-phone').value.trim() : '';
    const travelers   = document.getElementById('intake-travelers') ? document.getElementById('intake-travelers').value.trim() : '';
    const destination = document.getElementById('intake-destination') ? document.getElementById('intake-destination').value.trim() : '';
    const travelDate  = document.getElementById('intake-date') ? document.getElementById('intake-date').value.trim() : '';
    const budget      = document.getElementById('intake-budget') ? document.getElementById('intake-budget').value.trim() : '';
    const message     = document.getElementById('intake-message') ? document.getElementById('intake-message').value.trim() : '';

    if (!name || !email) {
      showStatus(statusEl, 'error', 'Please provide your name and email address.');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending…';

    const templateParams = {
      to_email:    agentEmail,
      from_name:   name,
      reply_to:    email,
      phone:       phone       || 'Not provided',
      message:     message     || 'No message provided',
      travelers:   travelers   || 'Not specified',
      destination: destination || 'Not specified',
      travel_date: travelDate  || 'Not specified',
      budget:      budget      || 'Not specified'
    };

    emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, templateParams)
      .then(function() {
        showStatus(statusEl, 'success', '✅ Your inquiry has been sent! An agent will contact you shortly.');
        form.reset();
        btn.disabled = false;
        btn.textContent = 'Send My Inquiry';
      })
      .catch(function(err) {
        console.error('EmailJS error:', err);
        showStatus(statusEl, 'error', '❌ Something went wrong. Please try again or call us directly.');
        btn.disabled = false;
        btn.textContent = 'Send My Inquiry';
      });
  });
}

// ── HELPER ──────────────────────────────────────────────────
function showStatus(el, type, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
  el.className = 'contact-status ' + type;
  setTimeout(function() { el.style.display = 'none'; }, 6000);
}

// Auto-init both forms when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initAgentContactForm();
  initMainIntakeForm();
});
