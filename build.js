// ─────────────────────────────────────────────────────────
//  PAC and GO Travel — Build Script
//  Reads _agents/*.md and injects content into agents/*.html
//  Also updates agent card photos on index.html
// ─────────────────────────────────────────────────────────

const fs     = require('fs');
const path   = require('path');
const matter = require('gray-matter');

const agentsDataDir = path.join(__dirname, '_agents');
const agentsHtmlDir = path.join(__dirname, 'agents');
const indexFile     = path.join(__dirname, 'index.html');

const mdFiles = fs.readdirSync(agentsDataDir).filter(f => f.endsWith('.md'));

console.log('\nPAC and GO Build Script');
console.log('─────────────────────────');
console.log('Found ' + mdFiles.length + ' agent data file(s)\n');

let indexHtml    = fs.readFileSync(indexFile, 'utf8');
let indexUpdated = false;

mdFiles.forEach(mdFile => {
  const slug     = mdFile.replace('.md', '');
  const htmlFile = path.join(agentsHtmlDir, slug + '.html');

  if (!fs.existsSync(htmlFile)) {
    console.log('  SKIP: No HTML page found for ' + slug);
    return;
  }

  const raw  = fs.readFileSync(path.join(agentsDataDir, mdFile), 'utf8');
  const data = matter(raw);
  const { name, title, bio, photo, video_url, specialties } = data.data;

  let html    = fs.readFileSync(htmlFile, 'utf8');
  const updates = [];

  // BIO
  if (bio) {
    const bioHtml = bio.trim().split(/\n\n+/)
      .map(p => '<p>' + p.trim().replace(/\n/g, ' ') + '</p>')
      .join('\n');
    html = html.replace(
      /<!-- BIO_START -->[\s\S]*?<!-- BIO_END -->/,
      '<!-- BIO_START -->\n' + bioHtml + '\n<!-- BIO_END -->'
    );
    updates.push('Bio');
  }

  // PHOTO on agent page
  if (photo && photo.trim() !== '') {
    html = html.replace(
      /<!-- PHOTO_START -->[\s\S]*?<!-- PHOTO_END -->/,
      '<!-- PHOTO_START -->\n<img src="' + photo + '" alt="' + name + '" />\n<!-- PHOTO_END -->'
    );
    updates.push('Photo');

    // PHOTO on index.html card
    const agentPageLink = 'agents/' + slug + '.html';
    const agentCardPattern = new RegExp(
      '(' + agentPageLink.replace('/', '\\/') + ')' +
      '([\\s\\S]{0,3000}?<div class="agent-photo"[^>]*>\\s*)' +
      '(<img[^>]*>|<div class="agent-photo-placeholder">[\\s\\S]*?<\\/div>)'
    );
    const newIndex = indexHtml.replace(agentCardPattern, function(match, link, before) {
      indexUpdated = true;
      return link + before + '<img src="' + photo + '" alt="' + name + '" />';
    });
    if (newIndex !== indexHtml) {
      indexHtml = newIndex;
      updates.push('Index card photo');
    }
  }

  // TITLE
  if (title) {
    html = html.replace(
      /<!-- TITLE_START -->[\s\S]*?<!-- TITLE_END -->/,
      '<!-- TITLE_START -->' + title + '<!-- TITLE_END -->'
    );
    updates.push('Title');
  }

  // SPECIALTIES
  if (specialties && specialties.length > 0) {
    const specHtml = specialties.map(s => '<span class="specialty-tag">' + s + '</span>').join('\n');
    html = html.replace(
      /<!-- SPECIALTIES_START -->[\s\S]*?<!-- SPECIALTIES_END -->/,
      '<!-- SPECIALTIES_START -->\n' + specHtml + '\n<!-- SPECIALTIES_END -->'
    );
    updates.push('Specialties');
  }

  // VIDEO
  if (video_url && video_url.trim() !== '') {
    let embedUrl = video_url
      .replace('watch?v=', 'embed/')
      .replace('youtu.be/', 'www.youtube.com/embed/');
    const videoHtml = '<!-- VIDEO_START -->\n' +
      '<div class="agent-video" style="margin:0 auto 48px;max-width:820px;padding:0 24px;">\n' +
      '  <h3 style="font-family:\'Playfair Display\',serif;font-size:1.2rem;margin-bottom:16px;color:var(--navy);">Meet ' + name + '</h3>\n' +
      '  <div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:10px;">\n' +
      '    <iframe src="' + embedUrl + '" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" allowfullscreen></iframe>\n' +
      '  </div>\n</div>\n<!-- VIDEO_END -->';
    html = html.replace(/<!-- VIDEO_START -->[\s\S]*?<!-- VIDEO_END -->/, videoHtml);
    updates.push('Video');
  }

  fs.writeFileSync(htmlFile, html, 'utf8');
  console.log('  UPDATED: agents/' + slug + '.html');
  updates.forEach(u => console.log('    - ' + u + ' updated'));
});

if (indexUpdated) {
  fs.writeFileSync(indexFile, indexHtml, 'utf8');
  console.log('\n  UPDATED: index.html (agent card photos)');
}

console.log('\nBuild complete!\n');
