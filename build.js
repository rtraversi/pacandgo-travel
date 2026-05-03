const fs     = require('fs');
const path   = require('path');
const matter = require('gray-matter');
const { execSync } = require('child_process');

const agentsDataDir = path.join(__dirname, '_agents');
const galleryDataDir = path.join(__dirname, '_gallery');
const agentsHtmlDir = path.join(__dirname, 'agents');
const indexFile     = path.join(__dirname, 'index.html');
const galleryFile   = path.join(__dirname, 'gallery.html');

function getMdFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
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
const galleryMdFiles = getMdFiles(galleryDataDir);

console.log('\nPAC and GO Build Script');
console.log('-------------------------');
console.log('Found ' + mdFiles.length + ' agent data file(s)');
console.log('Found ' + galleryMdFiles.length + ' gallery photo(s)\n');

let indexHtml    = fs.readFileSync(indexFile, 'utf8');
let indexUpdated = false;

// ── BUILD AGENT PAGES ──
mdFiles.forEach(mdFilePath => {
  const slug     = path.basename(mdFilePath).replace('.md', '');
  const htmlFile = path.join(agentsHtmlDir, slug + '.html');

  if (!fs.existsSync(htmlFile)) {
    console.log('  SKIP: No HTML page found for ' + slug);
    return;
  }

  const raw  = fs.readFileSync(mdFilePath, 'utf8');
  const data = matter(raw);
  const { name, title, bio, photo, video_url, specialties } = data.data;

  let html    = fs.readFileSync(htmlFile, 'utf8');
  const updates = [];

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

  if (photo && photo.trim() !== '') {
    html = html.replace(
      /<!-- PHOTO_START -->[\s\S]*?<!-- PHOTO_END -->/,
      '<!-- PHOTO_START -->\n<img src="' + photo + '" alt="' + name + '" />\n<!-- PHOTO_END -->'
    );
    updates.push('Photo');

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

  if (title) {
    html = html.replace(
      /<!-- TITLE_START -->[\s\S]*?<!-- TITLE_END -->/,
      '<!-- TITLE_START -->' + title + '<!-- TITLE_END -->'
    );
    updates.push('Title');
  }

  if (specialties && specialties.length > 0) {
    const specHtml = specialties.map(s => '<span class="specialty-tag">' + s + '</span>').join('\n');
    html = html.replace(
      /<!-- SPECIALTIES_START -->[\s\S]*?<!-- SPECIALTIES_END -->/,
      '<!-- SPECIALTIES_START -->\n' + specHtml + '\n<!-- SPECIALTIES_END -->'
    );
    updates.push('Specialties');
  }

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

// ── BUILD GALLERY PAGE ──
if (galleryMdFiles.length > 0) {
  console.log('\nBuilding gallery page...');

  // Sort by date descending
  const galleryItems = galleryMdFiles.map(f => {
    const raw = fs.readFileSync(f, 'utf8');
    return matter(raw).data;
  }).filter(d => d.photo).sort((a, b) => {
    return new Date(b.date || 0) - new Date(a.date || 0);
  });

  const gridHtml = '<div class="photo-grid">\n' +
    galleryItems.map((item, idx) => {
      return '  <div class="photo-item" data-idx="' + idx + '">\n' +
             '    <img src="' + item.photo + '" alt="' + (item.title || 'Travel photo') + '" loading="lazy" />\n' +
             '  </div>';
    }).join('\n') +
    '\n</div>';

  let galleryHtml = fs.readFileSync(galleryFile, 'utf8');
  galleryHtml = galleryHtml.replace(
    /<!-- GALLERY_CONTENT_START -->[\s\S]*?<!-- GALLERY_CONTENT_END -->/,
    '<!-- GALLERY_CONTENT_START -->\n' + gridHtml + '\n<!-- GALLERY_CONTENT_END -->'
  );
  fs.writeFileSync(galleryFile, galleryHtml, 'utf8');
  console.log('  UPDATED: gallery.html (' + galleryItems.length + ' photos)');
}

// ── AUTO-COMMIT ON NETLIFY ──
if (process.env.NETLIFY) {
  console.log('\nRunning on Netlify - committing built files...');
  try {
    execSync('git config user.email "build@pacandgotravel.com"');
    execSync('git config user.name "PAC and GO Build Bot"');
    execSync('git add agents/*.html index.html gallery.html');
    execSync('git commit -m "Auto-build: update pages from CMS [skip ci]" || echo "Nothing to commit"');
    execSync('git push https://x-access-token:' + process.env.GITHUB_TOKEN + '@github.com/rtraversi/pacandgo-travel.git HEAD:main');
    console.log('Built files pushed to GitHub!');
  } catch(e) {
    console.log('Git push note: ' + e.message);
  }
}

console.log('\nBuild complete!\n');
