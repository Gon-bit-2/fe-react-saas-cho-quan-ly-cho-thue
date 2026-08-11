const fs = require('fs');
const https = require('https');
const path = require('path');

const projectOutput = 'C:/Users/vanth/.gemini/antigravity-ide/brain/cb213aca-902c-4bd6-99a0-1b8df2b6514e/.system_generated/steps/7/output.txt';
const designsDir = path.join(__dirname, '.stitch', 'designs');

if (!fs.existsSync(designsDir)) {
  fs.mkdirSync(designsDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve();
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const data = JSON.parse(fs.readFileSync(projectOutput, 'utf8'));
  const w20Screens = data.screens.filter(s => s.title && s.title.includes('W20'));
  
  if (w20Screens.length === 0) {
    console.log("No W20 screens found in output.txt");
    return;
  }
  
  console.log(`Found ${w20Screens.length} W20 screens. Downloading...`);
  
  for (const s of w20Screens) {
    // Extact just the id (e.g., "W20-01" from "W20-01 — Hàng chờ đánh giá")
    const titleMatch = s.title.match(/W20-\d+/);
    const shortTitle = titleMatch ? titleMatch[0] : s.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    
    console.log(`Downloading ${shortTitle}...`);
    
    // Download HTML
    if (s.htmlCode && s.htmlCode.downloadUrl) {
      await download(s.htmlCode.downloadUrl, path.join(designsDir, `${shortTitle}.html`));
      console.log(`Saved ${shortTitle}.html`);
    }
    
    // Download Screenshot
    if (s.screenshot && s.screenshot.downloadUrl) {
      const imgUrl = `${s.screenshot.downloadUrl}=w${s.width || 1024}`;
      await download(imgUrl, path.join(designsDir, `${shortTitle}.png`));
      console.log(`Saved ${shortTitle}.png`);
    }
  }
  console.log("Done!");
}

main().catch(console.error);
