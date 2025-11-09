// Script to download Inter fonts
const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, '..', 'public', 'fonts');

// Ensure directory exists
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fonts = [
  {
    name: 'Inter-Regular.ttf',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Regular.ttf',
  },
  {
    name: 'Inter-SemiBold.ttf',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-SemiBold.ttf',
  },
  {
    name: 'Inter-Bold.ttf',
    url: 'https://github.com/rsms/inter/raw/master/docs/font-files/Inter-Bold.ttf',
  },
];

function downloadFont(fontName, url) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(fontsDir, fontName);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          redirectResponse.on('end', () => {
            console.log(`Downloaded ${fontName}`);
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        response.on('end', () => {
          console.log(`Downloaded ${fontName}`);
          resolve();
        });
      }
    }).on('error', reject);
  });
}

async function downloadAllFonts() {
  console.log('Downloading Inter fonts...');
  try {
    for (const font of fonts) {
      await downloadFont(font.name, font.url);
    }
    console.log('All fonts downloaded successfully!');
  } catch (error) {
    console.error('Error downloading fonts:', error);
    process.exit(1);
  }
}

downloadAllFonts();

