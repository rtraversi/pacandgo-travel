# n8n workflows (archived)

## royal-caribbean-daily-offers-digest.json

This ran daily at 8am on the n8n Cloud account (builtsmarterbyrob.app.n8n.cloud) until 2026-10-31. It was switched off when that plan was cancelled. The file is an export kept so the workflow can be rebuilt.

**What it does**
1. **Daily 8am Trigger**: a schedule.
2. **Download Offers PDF**: fetches Royal Caribbean's agent offers sheet,
   `https://creative.rccl.com/Sales/Royal/Promotions/Snapshot_of_Current_Offers.pdf`.
3. **Extract PDF Text**: reads the PDF's text, with all pages joined.
4. **Parse Offers & Build Email**: a Code node that:
   - looks for a fixed list of offer names (`KNOWN_OFFERS`: BOGO60, Kids Sail Free and others) and reads each one's "Booking Window:" end date;
   - flags offers closing within 7 days as a flash sale and puts them in the subject line;
   - strips agent-only content (Booked & Elevated or Celebrated, commission, CLIA and similar);
   - builds an HTML email.
5. **Send Daily Digest**: sends it with Gmail to pacandgorob@gmail.com.

**Rebuilding it**
- In n8n, use Workflows → Import from file and pick this JSON. Then re-select a Gmail credential on the last node, because credentials don't travel with the export.
- `KNOWN_OFFERS` is hard-coded. RCL renames its promotions often, so update the list or the digest will miss new offers. An alternative is to send the PDF text to the same Claude prompt the site already uses in `app/api/parse-deals/route.ts`, which handles any offer name.
- If you run it on the self-hosted VPS n8n instead of n8n Cloud, it costs nothing extra.

The export contains no secrets: only the Gmail credential's ID and name, not the token.
