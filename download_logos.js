import fs from 'fs';
import path from 'path';
import https from 'https';

const colleges = [
  { name: 'sairam.png', url: 'https://sairam.edu.in/wp-content/uploads/2023/10/sairam-sec-logo.png' },
  { name: 'panimalar.png', url: 'https://panimalar.ac.in/assets/images/pec-logo.png' },
  { name: 'cit.svg', url: 'https://www.citchennai.edu.in/images/dynamic/logos/01.svg' },
  { name: 'rec.jpg', url: 'https://upload.wikimedia.org/wikipedia/en/5/5a/Rajalakshmi_Engineering_College_logo.jpg' },
  { name: 'easwari.png', url: 'https://srmeaswari.ac.in/wp-content/uploads/2022/12/cropped-headerlogo_blafavck-1.png' },
  { name: 'hindustan.svg', url: 'https://hindustanuniv.ac.in/assets/image/new-logo.svg' },
  { name: 'vit.svg', url: 'https://upload.wikimedia.org/wikipedia/en/c/c5/Vellore_Institute_of_Technology_logo_2021.svg' },
  { name: 'srm.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/SRM_University_logo.svg' },
  { name: 'annauniv.svg', url: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Anna_University_logo.svg' },
  { name: 'pondiuni.png', url: 'https://upload.wikimedia.org/wikipedia/en/d/dc/Pondicherry_University_logo.png' },
  { name: 'nitc.svg', url: 'https://upload.wikimedia.org/wikipedia/en/b/b5/National_Institute_of_Technology%2C_Calicut_Logo.svg' },
  { name: 'iisc.svg', url: 'https://upload.wikimedia.org/wikipedia/en/3/3b/IISc_logo.svg' },
  { name: 'iitd.svg', url: 'https://upload.wikimedia.org/wikipedia/en/f/fd/IIT_Delhi_Logo.svg' },
  { name: 'bits.svg', url: 'https://upload.wikimedia.org/wikipedia/en/d/d3/BITS_Pilani-Logo.svg' }
];

const dir = './public/colleges';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirect
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
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
      console.log(`Success: ${college.name}`);
    } catch (err) {
      console.error(`Error downloading ${college.name}:`, err.message);
    }
  }
};

run();
