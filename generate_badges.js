import fs from 'fs';
import sharp from 'sharp';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const domains = [
  'Web Development', 'App Development', 'AI & Machine Learning', 'UI/UX Design',
  'Python Full Stack', 'MERN Stack', 'Cyber Security', 'IoT',
  'Generative AI', 'Java Full Stack', 'Cloud Computing', 'Data Science',
  'Gen AI', 'Full Stack', 'Machine Learning', 'UI and UX', 'Vibe Coding'
];

// Deduplicate just in case, case-insensitively
const uniqueDomains = Array.from(new Set(domains.map(d => d.trim())));

const colors = [
  { primary: '#2563eb', secondary: '#1e40af', ribbon: '#3b82f6' }, // Blue
  { primary: '#d97706', secondary: '#b45309', ribbon: '#f59e0b' }, // Gold
  { primary: '#dc2626', secondary: '#991b1b', ribbon: '#ef4444' }, // Red
  { primary: '#059669', secondary: '#047857', ribbon: '#10b981' }, // Green
  { primary: '#7c3aed', secondary: '#5b21b6', ribbon: '#8b5cf6' }, // Purple
];

const year = new Date().getFullYear();

const logoPath = path.resolve('./public/companylogo.jpg');
let logoBase64 = '';
if (fs.existsSync(logoPath)) {
  const logoBuffer = fs.readFileSync(logoPath);
  logoBase64 = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
} else {
  console.warn("Logo not found at ./public/companylogo.jpg, proceeding without it.");
}

const outDir = 'c:\\Users\\mrdhi\\OneDrive\\Desktop\\our codes\\stitch_dakh_edu_3d_website (1)\\badges-export';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function generateAndUpload() {
  for (const domain of uniqueDomains) {
    const color = colors[domain.length % colors.length];
    const filename = `${domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-badge.png`;
    
    // Properly escape ampersands for XML/SVG
    const safeDomain = domain.replace(/&/g, '&amp;');
    
    // Using a 800x960 canvas for high quality, scaling the 200x240 viewBox
    const svgString = `
      <svg viewBox="0 0 400 480" width="800" height="960" xmlns="http://www.w3.org/2000/svg" style="font-family: sans-serif;">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="15" stdDeviation="15" flood-opacity="0.15" />
          </filter>
        </defs>
        
        <g filter="url(#shadow)">
          <!-- Ribbon tails at the bottom -->
          <path d="M80 340 L80 460 L130 420 L180 460 L180 340 Z" fill="${color.secondary}" />
          <path d="M220 340 L220 460 L270 420 L320 460 L320 340 Z" fill="${color.secondary}" />
          
          <!-- Outer Hexagon -->
          <polygon points="200,20 360,100 360,280 200,360 40,280 40,100" fill="${color.primary}" />
          
          <!-- Inner Hexagons -->
          <polygon points="200,36 344,110 344,270 200,344 56,270 56,110" fill="#f8fafc" />
          <polygon points="200,48 332,116 332,264 200,332 68,264 68,116" fill="#ffffff" />
          
          <!-- Geometric Emblem -->
          <g transform="translate(170, 60)">
            <path d="M30 0 L60 16 L60 44 L30 60 L0 44 L0 16 Z" fill="${color.primary}" />
            <path d="M30 8 L50 20 L50 40 L30 52 L10 40 L10 20 Z" fill="#ffffff" />
            <circle cx="30" cy="30" r="8" fill="${color.primary}" />
          </g>
          
          <!-- Company Name -->
          <text x="200" y="150" text-anchor="middle" font-size="16" font-weight="bold" fill="#475569">DAKH EDU SOLUTIONS</text>
          
          <!-- INTERNSHIP COMPLETED text -->
          <text x="200" y="185" text-anchor="middle" font-size="20" font-weight="900" fill="#1e293b" letter-spacing="1">INTERNSHIP COMPLETED</text>
          
          <!-- Center Ribbon Banner -->
          <path d="M-10 216 L410 216 L390 241 L410 266 L-10 266 L10 241 Z" fill="${color.ribbon}" />
          <path d="M-10 266 L40 266 L40 284 Z" fill="${color.secondary}" />
          <path d="M410 266 L360 266 L360 284 Z" fill="${color.secondary}" />
          
          <!-- Domain Text -->
          <text x="200" y="248" text-anchor="middle" font-size="22" font-weight="bold" fill="#ffffff" style="text-transform: uppercase;">
            ${safeDomain.length > 25 ? safeDomain.substring(0, 25) + '...' : safeDomain}
          </text>
          
          <!-- Year -->
          <text x="200" y="315" text-anchor="middle" font-size="28" font-weight="bold" fill="#64748b">${year}</text>
        </g>
      </svg>
    `;

    // Convert SVG to PNG buffer
    const pngBuffer = await sharp(Buffer.from(svgString))
      .png()
      .toBuffer();
      
    console.log(`Uploading ${filename}... (${(pngBuffer.length / 1024).toFixed(2)} KB)`);
    
    const { data, error } = await supabase.storage
      .from('badges')
      .upload(filename, pngBuffer, {
        contentType: 'image/png',
        upsert: false
      });
      
    // Generate HTML Wrapper for LinkedIn Open Graph
    const htmlFilename = `${domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`;
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/badges/${filename}`;
    
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Internship Completed - ${safeDomain}</title>
    <meta property="og:title" content="Internship Completed at DAKH Edu Solutions">
    <meta property="og:description" content="I successfully completed an internship in ${safeDomain}!">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="800">
    <meta property="og:image:height" content="960">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="${imageUrl}">
    <script>
        // Redirect human visitors back to the main website
        window.location.href = "https://dakh.edu.in"; // Replace with your actual domain later
    </script>
</head>
<body>
    <p>Redirecting to certificate...</p>
</body>
</html>`;

    console.log(`Uploading HTML ${htmlFilename}...`);
    
    const { error: htmlError } = await supabase.storage
      .from('badges')
      .upload(htmlFilename, Buffer.from(htmlContent, 'utf-8'), {
        contentType: 'text/html',
        upsert: false
      });
      
    if (htmlError) {
      console.error(`Failed to upload ${htmlFilename}:`, htmlError.message);
    } else {
      console.log(`Successfully uploaded ${htmlFilename}`);
    }
  }
}

generateAndUpload().then(() => console.log('Done!')).catch(console.error);
