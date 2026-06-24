import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const colleges = [
  // VIT - correct Wikimedia Commons path found via search
  { name: 'vit.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Vellore_Institute_of_Technology_logo.svg' },
  // SRM - correct Wikimedia Commons path
  { name: 'srm.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/SRM_Institute_of_Science_and_Technology_logo.svg' },
  // Anna University - from official website header
  { name: 'annauniv.png', url: 'https://www.annauniv.edu/images/au_logo.png' },
  // Pondicherry University - from official website
  { name: 'pondiuni.png', url: 'https://www.pondiuni.edu.in/wp-content/uploads/2021/09/pu-logo.png' },
  // NIT Calicut - from official website
  { name: 'nitc.png', url: 'https://nitc.ac.in/images/logo.png' },
  // IISc - from official website
  { name: 'iisc.jpg', url: 'https://iisc.ac.in/wp-content/uploads/2020/08/IISc_Master_Seal_Black_Transparent.png' },
  // IIT Delhi - from official website
  { name: 'iitd.png', url: 'https://home.iitd.ac.in/uploads/change-logo/IIT-Delhi-Logo.png' },
  // BITS Pilani - from official website
  { name: 'bits.png', url: 'https://www.bits-pilani.ac.in/wp-content/uploads/bits-pilani-logo.png' },
  // Rajalakshmi Engineering College - from official website
  { name: 'rec.png', url: 'https://www.rajalakshmi.org/img/logo.png' },
];

const dir = './public/colleges';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.google.com/'
      }
    };
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
        file.close();
        fs.unlinkSync(dest);
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`HTTP ${response.statusCode} for '${url}'`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
};

const run = async () => {
  for (const college of colleges) {
    const dest = path.join(dir, college.name);
    console.log(`Downloading ${college.name}...`);
    try {
      await download(college.url, dest);
      const stats = fs.statSync(dest);
      console.log(`✓ ${college.name} (${stats.size} bytes)`);
    } catch (err) {
      console.error(`✗ ${college.name}: ${err.message}`);
    }
    await sleep(800); // Polite delay between requests
  }
  console.log('\nDone!');
};

run();
