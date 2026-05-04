# EmailJS Integration — Implementation Guide
# Pac and Go Travel Mockup
# =====================================================

## STEP 1 — Add to EVERY page (agent pages + index.html)
## Add these two lines just before </body>:

    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
    <script src="/emailjs-contact.js"></script>


## STEP 2 — AGENT PROFILE PAGES (/agents/*.html)
## Replace whatever "Send a Message" form exists with this block.
## The ONLY thing that changes per agent is data-agent-key.

<!-- ── Contact Form (agent profile page) ── -->
<section class="agent-contact">
  <h2>Send a Message</h2>
  <form id="agent-contact-form" data-agent-key="AGENT-SLUG-HERE">
    <div class="form-group">
      <label for="contact-name">Your Name *</label>
      <input type="text" id="contact-name" name="contact-name" placeholder="Full name" required>
    </div>
    <div class="form-group">
      <label for="contact-email">Email Address *</label>
      <input type="email" id="contact-email" name="contact-email" placeholder="your@email.com" required>
    </div>
    <div class="form-group">
      <label for="contact-phone">Phone Number</label>
      <input type="tel" id="contact-phone" name="contact-phone" placeholder="(555) 000-0000">
    </div>
    <div class="form-group">
      <label for="contact-message">Message *</label>
      <textarea id="contact-message" name="contact-message" rows="5" placeholder="Tell us about your dream trip..." required></textarea>
    </div>
    <button type="submit">Send Message</button>
    <div id="contact-status" class="contact-status"></div>
  </form>
</section>


## AGENT SLUG REFERENCE — use these exact values for data-agent-key:
## alan-klein.html        → data-agent-key="alan-klein"
## anissa-dean.html       → data-agent-key="anissa-dean"
## beth-vanergrift.html   → data-agent-key="beth-vanergrift"
## connie-brant.html      → data-agent-key="connie-brant"
## dawn-roffey.html       → data-agent-key="dawn-roffey"
## denise-berger.html     → data-agent-key="denise-berger"
## jane-goerke.html       → data-agent-key="jane-goerke"
## joel-trinidad.html     → data-agent-key="joel-trinidad"
## larry-oakley.html      → data-agent-key="larry-oakley"
## norma-allen.html       → data-agent-key="norma-allen"
## patty-wells.html       → data-agent-key="patty-wells"
## robert-traversi.html   → data-agent-key="robert-traversi"
## rochelle-coronado.html → data-agent-key="rochelle-coronado"
## rosemary-karnes.html   → data-agent-key="rosemary-karnes"
## sue-muldoon.html       → data-agent-key="sue-muldoon"


## STEP 3 — MAIN INTAKE FORM (index.html)
## Replace/update the main contact/intake form with this.
## The agent dropdown option VALUES must match the agent slugs above.

<!-- ── Main Intake Form (index.html) ── -->
<section id="intake" class="intake-section">
  <h2>Plan Your Trip</h2>
  <form id="main-intake-form">
    <div class="form-group">
      <label for="intake-agent">Choose an Agent</label>
      <select id="intake-agent" name="intake-agent">
        <option value="any">Any Available Agent</option>
        <option value="alan-klein">Alan Klein</option>
        <option value="anissa-dean">Aniska Dean</option>
        <option value="beth-vanergrift">Beth Vanergrift</option>
        <option value="connie-brant">Connie Brant</option>
        <option value="dawn-roffey">Dawn Roffey</option>
        <option value="denise-berger">Denise Berger</option>
        <option value="jane-goerke">Jane Goerke</option>
        <option value="joel-trinidad">Joel Trinidad</option>
        <option value="larry-oakley">Larry Oakley</option>
        <option value="norma-allen">Norma Allen</option>
        <option value="patty-wells">Patty Wells</option>
        <option value="robert-traversi">Robert Traversi</option>
        <option value="rochelle-coronado">Rochelle Coronado</option>
        <option value="rosemary-karnes">Rosemary Karnes</option>
        <option value="sue-muldoon">Sue Muldoon</option>
      </select>
    </div>
    <div class="form-group">
      <label for="intake-name">Your Name *</label>
      <input type="text" id="intake-name" name="intake-name" placeholder="Full name" required>
    </div>
    <div class="form-group">
      <label for="intake-email">Email Address *</label>
      <input type="email" id="intake-email" name="intake-email" placeholder="your@email.com" required>
    </div>
    <div class="form-group">
      <label for="intake-phone">Phone Number</label>
      <input type="tel" id="intake-phone" name="intake-phone" placeholder="(555) 000-0000">
    </div>
    <div class="form-group">
      <label for="intake-travelers">Number of Travelers</label>
      <input type="text" id="intake-travelers" name="intake-travelers" placeholder="e.g. 2 adults, 1 child">
    </div>
    <div class="form-group">
      <label for="intake-destination">Destination / Trip Type</label>
      <input type="text" id="intake-destination" name="intake-destination" placeholder="e.g. Caribbean cruise, Disney World">
    </div>
    <div class="form-group">
      <label for="intake-date">Approximate Travel Date</label>
      <input type="text" id="intake-date" name="intake-date" placeholder="e.g. March 2026">
    </div>
    <div class="form-group">
      <label for="intake-budget">Budget (approximate)</label>
      <input type="text" id="intake-budget" name="intake-budget" placeholder="e.g. $3,000–$5,000">
    </div>
    <div class="form-group">
      <label for="intake-message">Anything else we should know?</label>
      <textarea id="intake-message" name="intake-message" rows="4" placeholder="Special occasions, accessibility needs, preferences..."></textarea>
    </div>
    <button type="submit">Send My Inquiry</button>
    <div id="intake-status" class="contact-status"></div>
  </form>
</section>
