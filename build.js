// ─────────────────────────────────────────────────────────
//  PAC and GO Travel — Build Script
//  Reads _agents/*.md and injects content into agents/*.html
// ─────────────────────────────────────────────────────────

const fs   = require('fs');
const path = require('path');
const matter = require('gray-matter');

const agentsDataDir = path.join(__dirname, '_agents');
const agentsHtmlDir = path.join(__dirname, 'agents');

// Get all .md files in _agents/
const mdFiles = fs.readdirSync(agentsDataDir).filter(f => f.endsWith('.md'));

console.log(`\nPAC and GO Build Script`);
console.log(`─────────────────────────`);
console.log(`Found ${mdFiles.length} agent data file(s)\n`);

mdFiles.forEach(mdFile => {
  const slug     = mdFile.replace('.md', '');
  const htmlFile = path.join(agentsHtmlDir, `${slug}.html`);

  // Skip if no matching HTML page
  if (!fs.existsSync(htmlFile)) {
    console.log(`  SKIP: No HTML page found for ${slug}`);
    return;
  }

  // Parse the .md front matter
  const raw  = fs.readFileSync(path.join(agentsDataDir, mdFile), 'utf8');
  const data = matter(raw);
  const { name, title, bio, photo, video_url, email, specialties } = data.data;

  let html = fs.readFileSync(htmlFile, 'utf8');

  // ── UPDATE BIO ──
  if (bio) {
    const bioHtml = bio
      .trim()
      .split(/\n\n+/)
      .map(p => `<p>${p.trim().replace(/\n/g, ' ')}</p>`)
      .join('\n');

    // Replace everything between the bio section markers
    html = html.replace(
      /<!-- BIO_START -->[\s\S]*?<!-- BIO_END -->/,
      `<!-- BIO_START -->\n${bioHtml}\n<!-- BIO_END -->`
    );
  }

  // ── UPDATE PHOTO ──
  if (photo && photo.trim() !== '') {
    // Replace initials placeholder or existing img src
    html = html.replace(
      /<!-- PHOTO_START -->[\s\S]*?<!-- PHOTO_END -->/,
      `<!-- PHOTO_START -->\n<img src="${photo}" alt="${name}" />\n<!-- PHOTO_END -->`
    );
  }

  // ── UPDATE TITLE ──
  if (title) {
    html = html.replace(
      /<!-- TITLE_START -->[\s\S]*?<!-- TITLE_END -->/,
      `<!-- TITLE_START -->${title}<!-- TITLE_END -->`
    );
  }

  // ── UPDATE SPECIALTIES ──
  if (specialties && specialties.length > 0) {
    const specHtml = specialties
      .map(s => `<span class="specialty-tag">${s}</span>`)
      .join('\n');
    html = html.replace(
      /<!-- SPECIALTIES_START -->[\s\S]*?<!-- SPECIALTIES_END -->/,
      `<!-- SPECIALTIES_START -->\n${specHtml}\n<!-- SPECIALTIES_END -->`
    );
  }

  // ── UPDATE VIDEO ──
  if (video_url && video_url.trim() !== '') {
    // Convert YouTube watch URL to embed URL
    let embedUrl = video_url
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'www.youtube.com/embed/');

    const videoHtml = `
<!-- VIDEO_START -->
<div class="agent-video">
  <h3 style="font-family:'Playfair Display',serif; font-size:1.2rem; margin-bottom:16px; color:var(--navy);">Meet ${name}</h3>
  <div style="position:relative; padding-bottom:56.25%; height:0; overflow:hidden; border-radius:10px;">
    <iframe src="${embedUrl}" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe>
  </div>
</div>
<!-- VIDEO_END -->`;

    html = html.replace(
      /<!-- VIDEO_START -->[\s\S]*?<!-- VIDEO_END -->/,
      videoHtml
    );
  }

  fs.writeFileSync(htmlFile, html, 'utf8');
  console.log(`  UPDATED: agents/${slug}.html`);
  if (photo)     console.log(`    - Photo updated`);
  if (bio)       console.log(`    - Bio updated`);
  if (title)     console.log(`    - Title updated`);
  if (video_url) console.log(`    - Video updated`);
});

console.log(`\nBuild complete!\n`);
