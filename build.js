const fs     = require('fs');
const path   = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

const agentsDataDir = path.join(__dirname, '_agents');
const agentsHtmlDir = path.join(__dirname, 'agents');
const indexFile     = path.join(__dirname, 'index.html');

function getMdFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getMdFiles(full));
    } else if (f.endsWith('.md')) {
      results.push(full);
    }
  });
  return results;
}

const mdFiles = getMdFiles(agentsDataDir);

console.log('\nPAC and GO Build Script');
console.log('-------------------------');
console.log('Found ' + mdFiles.length + ' agent data file(s)\n');

let indexHtml    = fs.readFileSync(indexFile, 'utf8');
let indexUpdated = false;

mdFiles.forEach(mdFilePath => {
  const slug     = path.basename(mdFilePath).replace('.md', '');
  const htmlFile = path.join(agentsHtmlDir, slug + '.html');

  if (!fs.existsSync(htmlFile)) {
    console.log('  SKIP: No HTML page found for ' + slug);
    return;
  }

  const raw  = fs.readFileSync(mdFilePath, 'utf8');
  const data = matter(raw);
  const { name, title, bio, photo, video_url, specialties, gallery } = data.data;

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

    // PHOTO on index.html
    const markerKey   = slug.toUpperCase().replace(/-/g, '_');
    const startMarker = '<!-- AGENT_CARD_' + markerKey + '_START -->';
    const endMarker   = '<!-- AGENT_CARD_' + markerKey + '_END -->';
    const startIdx = indexHtml.indexOf(startMarker);
    const endIdx   = indexHtml.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1) {
      const before   = indexHtml.substring(0, startIdx + startMarker.length);
      const cardHtml = indexHtml.substring(startIdx + startMarker.length, endIdx);
      const after    = indexHtml.substring(endIdx);
      const newCard  = cardHtml.replace(
        /(<div class="agent-photo">)([\s\S]*?)(<\/div>\s*\n\s*<div class="agent-info">)/,
        '$1\n        <img src="' + photo + '" alt="' + name + '" />\n      $3'
      );
      if (newCard !== cardHtml) {
        indexHtml    = before + newCard + after;
        indexUpdated = true;
        updates.push('Index card photo');
      }
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

  // GALLERY
  if (gallery && gallery.length > 0) {
    const first_name = name.split(' ')[0];
    const galleryHtml = '<!-- GALLERY_START -->\n' +
      '<div class="agent-gallery" style="max-width:820px;margin:0 auto 64px;padding:0 24px;">\n' +
      '  <p style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:#c9a84c;font-weight:700;margin-bottom:10px;">Travel Gallery</p>\n' +
      '  <h3 style="font-family:\'Playfair Display\',serif;font-size:1.6rem;color:#0d2b45;margin-bottom:24px;">' + first_name + '\'s Travel Photos</h3>\n' +
      '  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">\n' +
      gallery.map(function(item) {
        const src = typeof item === 'string' ? item : (item.photo || item);
        return '    <div style="border-radius:10px;overflow:hidden;aspect-ratio:4/3;background:#eaf2f8;">\n' +
               '      <img src="' + src + '" alt="' + name + ' travel photo" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s;" onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'" />\n' +
               '    </div>';
      }).join('\n') + '\n' +
      '  </div>\n</div>\n<!-- GALLERY_END -->';

    if (html.indexOf('<!-- GALLERY_START -->') !== -1) {
      html = html.replace(/<!-- GALLERY_START -->[\s\S]*?<!-- GALLERY_END -->/, galleryHtml);
    } else {
      // Insert gallery before the contact form section
      html = html.replace('<!-- CONTACT FORM -->', galleryHtml + '\n\n<!-- CONTACT FORM -->');
    }
    updates.push('Gallery (' + gallery.length + ' photos)');
  }

  fs.writeFileSync(htmlFile, html, 'utf8');
  console.log('  UPDATED: agents/' + slug + '.html');
  updates.forEach(u => console.log('    - ' + u + ' updated'));
});

if (indexUpdated) {
  fs.writeFileSync(indexFile, indexHtml, 'utf8');
  console.log('\n  UPDATED: index.html (agent card photos)');
}

// Auto-commit back to GitHub when running on Netlify
if (process.env.NETLIFY) {
  console.log('\nRunning on Netlify - committing built files...');
  try {
    execSync('git config user.email "build@pacandgotravel.com"');
    execSync('git config user.name "PAC and GO Build Bot"');
    execSync('git add agents/*.html index.html');
    execSync('git commit -m "Auto-build: update agent pages [skip ci]" || echo "Nothing to commit"');
    execSync('git push https://x-access-token:' + process.env.GITHUB_TOKEN + '@github.com/rtraversi/pacandgo-travel.git HEAD:main');
    console.log('Built files pushed to GitHub!');
  } catch(e) {
    console.log('Git push note: ' + e.message);
  }
}

console.log('\nBuild complete!\n');
