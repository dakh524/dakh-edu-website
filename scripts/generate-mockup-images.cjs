const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const outDir = path.join(__dirname, '..', 'public', 'products');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. FrameFolio SVG Mockup
const frameFolioSvg = `
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ff-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
    <linearGradient id="wa-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#25D366"/>
      <stop offset="100%" stop-color="#128C7E"/>
    </linearGradient>
    <linearGradient id="photo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F43F5E"/>
      <stop offset="50%" stop-color="#8B5CF6"/>
      <stop offset="100%" stop-color="#1E1B4B"/>
    </linearGradient>
    <linearGradient id="photo-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#4C1D95"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="675" fill="url(#ff-bg)"/>
  
  <!-- Subtle Grid lines -->
  <g opacity="0.08" stroke="#FFFFFF" stroke-width="1">
    <line x1="0" y1="135" x2="1200" y2="135"/>
    <line x1="0" y1="270" x2="1200" y2="270"/>
    <line x1="0" y1="405" x2="1200" y2="405"/>
    <line x1="0" y1="540" x2="1200" y2="540"/>
    <line x1="300" y1="0" x2="300" y2="675"/>
    <line x1="600" y1="0" x2="600" y2="675"/>
    <line x1="900" y1="0" x2="900" y2="675"/>
  </g>

  <!-- Main Browser Window Frame -->
  <g filter="url(#shadow)">
    <rect x="70" y="45" width="1060" height="585" rx="20" fill="#0B0F19" stroke="#334155" stroke-width="2"/>
    
    <!-- Browser Top Bar -->
    <rect x="70" y="45" width="1060" height="50" rx="20" fill="#131A2A"/>
    <circle cx="105" cy="70" r="7" fill="#EF4444"/>
    <circle cx="130" cy="70" r="7" fill="#F59E0B"/>
    <circle cx="155" cy="70" r="7" fill="#10B981"/>
    
    <!-- Search / URL Bar -->
    <rect x="220" y="55" width="480" height="30" rx="15" fill="#1E293B"/>
    <text x="350" y="75" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="500">🔒 https://framefolio.studio/wedding-cinema</text>
    
    <!-- FrameFolio Brand Header -->
    <text x="105" y="145" fill="url(#gold-grad)" font-family="Georgia, serif" font-size="28" font-weight="bold" letter-spacing="2">FRAMEFOLIO</text>
    <text x="105" y="170" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="600" letter-spacing="1">LUXURY WEDDING PHOTOGRAPHY &amp; CINEMATIC FILMS</text>
    
    <!-- Navigation Pill Links -->
    <rect x="720" y="125" width="380" height="40" rx="20" fill="#1E293B"/>
    <text x="745" y="150" fill="#F8FAFC" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">Galleries</text>
    <text x="830" y="150" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="500">Packages</text>
    <text x="915" y="150" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="500">Client Stories</text>
    <rect x="1010" y="130" width="80" height="30" rx="15" fill="url(#gold-grad)"/>
    <text x="1025" y="150" fill="#000000" font-family="-apple-system, sans-serif" font-size="11" font-weight="800">BOOK</text>

    <!-- Full-Width Wedding Gallery Section -->
    <!-- Large Feature Photo Card -->
    <g>
      <rect x="105" y="200" width="460" height="260" rx="16" fill="url(#photo-grad-1)"/>
      <rect x="105" y="380" width="460" height="80" rx="16" fill="black" opacity="0.6"/>
      <text x="130" y="415" fill="#FFFFFF" font-family="Georgia, serif" font-size="20" font-weight="bold">The Udaipur Royal Heritage Wedding</text>
      <text x="130" y="440" fill="#FDE68A" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">4K Cinematic Film &#8226; 850 Candid Frames Captured</text>
      <!-- Play button badge -->
      <circle cx="510" cy="420" r="22" fill="url(#gold-grad)"/>
      <polygon points="505,410 520,420 505,430" fill="#000000"/>
    </g>

    <!-- Side Grid: 2 Smaller Photos -->
    <g>
      <rect x="585" y="200" width="230" height="120" rx="14" fill="url(#photo-grad-2)"/>
      <rect x="585" y="280" width="230" height="40" rx="14" fill="black" opacity="0.6"/>
      <text x="600" y="305" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">Pre-Wedding Sunset Glow</text>

      <rect x="585" y="340" width="230" height="120" rx="14" fill="#3B0764"/>
      <rect x="585" y="420" width="230" height="40" rx="14" fill="black" opacity="0.6"/>
      <text x="600" y="445" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">Haldi &amp; Sangeet Vibrance</text>
    </g>

    <!-- Package Card 1 (Royal Cinema) -->
    <g>
      <rect x="835" y="200" width="265" height="260" rx="16" fill="#172033" stroke="#F59E0B" stroke-width="1.5"/>
      <rect x="835" y="200" width="265" height="35" rx="16" fill="#F59E0B"/>
      <text x="890" y="224" fill="#000000" font-family="-apple-system, sans-serif" font-size="12" font-weight="900" letter-spacing="1">MOST POPULAR PACKAGE</text>
      
      <text x="855" y="265" fill="#FFFFFF" font-family="Georgia, serif" font-size="19" font-weight="bold">Royal Cinema Pack</text>
      <text x="855" y="295" fill="url(#gold-grad)" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">&#8377;1,20,000</text>
      
      <text x="855" y="330" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="12">&#10003; 2 Days Full 4K Cinematic Video</text>
      <text x="855" y="355" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="12">&#10003; 2 Candid + 2 Traditional Photographers</text>
      <text x="855" y="380" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="12">&#10003; Drone Coverage &amp; Premium Canvera Album</text>
      <text x="855" y="405" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="12">&#10003; Same-Day Reel &amp; Teaser Delivery</text>

      <!-- Package CTA -->
      <rect x="855" y="420" width="225" height="32" rx="8" fill="#334155"/>
      <text x="915" y="441" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">View Inclusions</text>
    </g>

    <!-- Bottom Action Bar: WhatsApp Floating Enquiry Pill -->
    <rect x="105" y="485" width="995" height="110" rx="16" fill="#131B2E" stroke="#1E293B" stroke-width="1"/>
    
    <text x="135" y="530" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="18" font-weight="800">Check Date Availability &amp; Custom Quotes</text>
    <text x="135" y="555" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13">Direct client booking flow with instant WhatsApp chat integration and date reservation.</text>

    <!-- WhatsApp Enquiry Button -->
    <g filter="url(#shadow)">
      <rect x="760" y="510" width="315" height="55" rx="28" fill="url(#wa-grad)"/>
      <!-- WhatsApp chat icon circle -->
      <circle cx="795" cy="537" r="15" fill="#FFFFFF"/>
      <text x="790" y="542" fill="#128C7E" font-family="-apple-system, sans-serif" font-size="16" font-weight="900">&#128172;</text>
      <text x="825" y="543" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="15" font-weight="900" letter-spacing="0.5">WhatsApp Enquiry &#8594;</text>
    </g>
  </g>
</svg>
`;

// 2. SalonSlot SVG Mockup
const salonSlotSvg = `
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ss-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#31102A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="rose-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FB7185"/>
      <stop offset="50%" stop-color="#E11D48"/>
      <stop offset="100%" stop-color="#BE123C"/>
    </linearGradient>
    <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <filter id="ss-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="675" fill="url(#ss-bg)"/>
  
  <!-- Subtle decorative ambient orbs -->
  <circle cx="200" cy="150" r="180" fill="#BE123C" opacity="0.15" filter="blur(40px)"/>
  <circle cx="1000" cy="500" r="220" fill="#7C3AED" opacity="0.15" filter="blur(40px)"/>

  <!-- Main Browser Window Frame -->
  <g filter="url(#ss-shadow)">
    <rect x="70" y="45" width="1060" height="585" rx="20" fill="#0C101C" stroke="#334155" stroke-width="2"/>
    
    <!-- Top Bar -->
    <rect x="70" y="45" width="1060" height="50" rx="20" fill="#151A2C"/>
    <circle cx="105" cy="70" r="7" fill="#EF4444"/>
    <circle cx="130" cy="70" r="7" fill="#F59E0B"/>
    <circle cx="155" cy="70" r="7" fill="#10B981"/>
    
    <rect x="220" y="55" width="480" height="30" rx="15" fill="#1E293B"/>
    <text x="350" y="75" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="500">🔒 https://salonslot.app/studio/book-appointment</text>
    
    <!-- Brand Header -->
    <text x="105" y="145" fill="url(#rose-grad)" font-family="-apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="1">SalonSlot</text>
    <text x="250" y="145" fill="#F43F5E" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1">&#8226; STUDIO &amp; SPA APPOINTMENTS</text>
    <text x="105" y="170" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13">Seamless 3-Step Booking: Service Selection &#8226; Time Slot &#8226; Booking Summary</text>

    <!-- COLUMN 1: SERVICE SELECTION (Width: 340) -->
    <g>
      <rect x="105" y="195" width="330" height="400" rx="16" fill="#121829" stroke="#1E293B" stroke-width="1.5"/>
      <text x="125" y="230" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">1. Select Services</text>
      <text x="125" y="250" fill="#64748B" font-family="-apple-system, sans-serif" font-size="12">Choose premium beauty treatments</text>

      <!-- Service Card 1 (Active/Selected) -->
      <rect x="120" y="270" width="300" height="75" rx="12" fill="#1E192B" stroke="#E11D48" stroke-width="2"/>
      <text x="135" y="298" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">Bridal Radiance Glow Facial</text>
      <text x="135" y="322" fill="#FDA4AF" font-family="-apple-system, sans-serif" font-size="12">60 Mins &#8226; Organic Serums</text>
      <text x="350" y="315" fill="#FB7185" font-family="-apple-system, sans-serif" font-size="15" font-weight="900">&#8377;2,499</text>

      <!-- Service Card 2 (Active/Selected) -->
      <rect x="120" y="360" width="300" height="75" rx="12" fill="#1E192B" stroke="#E11D48" stroke-width="2"/>
      <text x="135" y="388" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">Keratin Hair Spa &amp; Styling</text>
      <text x="135" y="412" fill="#FDA4AF" font-family="-apple-system, sans-serif" font-size="12">90 Mins &#8226; Deep Nourishing</text>
      <text x="350" y="405" fill="#FB7185" font-family="-apple-system, sans-serif" font-size="15" font-weight="900">&#8377;1,899</text>

      <!-- Service Card 3 (Unselected) -->
      <rect x="120" y="450" width="300" height="75" rx="12" fill="#172033" stroke="#334155" stroke-width="1"/>
      <text x="135" y="478" fill="#E2E8F0" font-family="-apple-system, sans-serif" font-size="14" font-weight="600">Gel Nail Art &amp; Manicure</text>
      <text x="135" y="502" fill="#64748B" font-family="-apple-system, sans-serif" font-size="12">45 Mins &#8226; Custom Designs</text>
      <text x="355" y="495" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">&#8377;999</text>

      <text x="125" y="565" fill="#10B981" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">&#10003; 2 Services Selected</text>
    </g>

    <!-- COLUMN 2: TIME SLOTS SELECTION (Width: 330) -->
    <g>
      <rect x="455" y="195" width="320" height="400" rx="16" fill="#121829" stroke="#1E293B" stroke-width="1.5"/>
      <text x="475" y="230" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">2. Available Time Slots</text>
      <text x="475" y="250" fill="#64748B" font-family="-apple-system, sans-serif" font-size="12">Select your preferred date &amp; stylist</text>

      <!-- Date selector row -->
      <rect x="475" y="270" width="85" height="50" rx="10" fill="url(#rose-grad)"/>
      <text x="495" y="292" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">TODAY</text>
      <text x="498" y="310" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="14" font-weight="900">22 Nov</text>

      <rect x="570" y="270" width="85" height="50" rx="10" fill="#1E293B"/>
      <text x="590" y="292" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">TOMORROW</text>
      <text x="593" y="310" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">23 Nov</text>

      <rect x="665" y="270" width="85" height="50" rx="10" fill="#1E293B"/>
      <text x="690" y="292" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">MON</text>
      <text x="688" y="310" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="14" font-weight="700">24 Nov</text>

      <text x="475" y="355" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="13" font-weight="700">Morning &amp; Afternoon Slots</text>

      <!-- Slot Chips -->
      <rect x="475" y="375" width="130" height="42" rx="8" fill="#1E293B"/>
      <text x="500" y="401" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">10:30 AM</text>

      <rect x="620" y="375" width="130" height="42" rx="8" fill="#1E293B" opacity="0.4"/>
      <text x="640" y="401" fill="#64748B" font-family="-apple-system, sans-serif" font-size="13">11:45 AM (Booked)</text>

      <!-- Selected Slot -->
      <rect x="475" y="430" width="130" height="42" rx="8" fill="url(#rose-grad)"/>
      <text x="500" y="456" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="13" font-weight="800">&#10003; 02:30 PM</text>

      <rect x="620" y="430" width="130" height="42" rx="8" fill="#1E293B"/>
      <text x="648" y="456" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">04:00 PM</text>

      <rect x="475" y="485" width="130" height="42" rx="8" fill="#1E293B"/>
      <text x="505" y="511" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">05:30 PM</text>

      <rect x="620" y="485" width="130" height="42" rx="8" fill="#1E293B"/>
      <text x="648" y="511" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13" font-weight="600">07:00 PM</text>

      <text x="475" y="565" fill="#FB7185" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">&#128337; Slot reserved for 10 minutes</text>
    </g>

    <!-- COLUMN 3: BOOKING SUMMARY (Width: 320) -->
    <g>
      <rect x="795" y="195" width="305" height="400" rx="16" fill="#151A2C" stroke="#7C3AED" stroke-width="2"/>
      <rect x="795" y="195" width="305" height="40" rx="16" fill="#7C3AED"/>
      <text x="870" y="222" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="13" font-weight="900" letter-spacing="1">BOOKING SUMMARY</text>

      <text x="815" y="265" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="15" font-weight="800">Studio: Glamour Lounge</text>
      <text x="815" y="285" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12">Stylist: Ananya Sharma (Senior Pro)</text>

      <line x1="815" y1="305" x2="1080" y2="305" stroke="#334155" stroke-width="1"/>

      <text x="815" y="330" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="13">Date: Today, 22 Nov</text>
      <text x="815" y="355" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="13">Time: 02:30 PM (2 hrs)</text>
      <text x="815" y="380" fill="#CBD5E1" font-family="-apple-system, sans-serif" font-size="13">Services: Facial + Hair Spa</text>

      <line x1="815" y1="405" x2="1080" y2="405" stroke="#334155" stroke-width="1"/>

      <text x="815" y="435" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12">Total Estimated Payable</text>
      <text x="815" y="468" fill="url(#rose-grad)" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">&#8377;4,398</text>

      <!-- Confirm Button -->
      <g filter="url(#ss-shadow)">
        <rect x="815" y="495" width="265" height="50" rx="12" fill="url(#rose-grad)"/>
        <text x="850" y="526" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="14" font-weight="900" letter-spacing="1">CONFIRM BOOKING &#8594;</text>
      </g>
      <text x="835" y="570" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11">&#8226; Instant SMS Confirmation Sent &#8226;</text>
    </g>
  </g>
</svg>
`;

// 3. FixDesk SVG Mockup
const fixDeskSvg = `
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="fd-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="cyan-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#22D3EE"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="emerald-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#34D399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <filter id="fd-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="675" fill="url(#fd-bg)"/>

  <!-- Main Window Frame -->
  <g filter="url(#fd-shadow)">
    <rect x="70" y="45" width="1060" height="585" rx="20" fill="#0A0F1D" stroke="#1E293B" stroke-width="2"/>
    
    <!-- Top Bar -->
    <rect x="70" y="45" width="1060" height="50" rx="20" fill="#111827"/>
    <circle cx="105" cy="70" r="7" fill="#EF4444"/>
    <circle cx="130" cy="70" r="7" fill="#F59E0B"/>
    <circle cx="155" cy="70" r="7" fill="#10B981"/>
    
    <rect x="220" y="55" width="480" height="30" rx="15" fill="#1F2937"/>
    <text x="330" y="75" fill="#9CA3AF" font-family="-apple-system, sans-serif" font-size="13" font-weight="500">🔒 https://fixdesk.service/repair-dashboard</text>
    
    <!-- Brand Header -->
    <text x="105" y="145" fill="url(#cyan-grad)" font-family="-apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="1">FixDesk</text>
    <text x="235" y="145" fill="#38BDF8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" letter-spacing="1">&#8226; MOBILE REPAIR &amp; SERVICE TRACKING DASHBOARD</text>
    <text x="105" y="170" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="13">Real-Time Job Cards with Device, Diagnostic Reports, Estimated Cost &amp; Repair Status</text>

    <!-- Top Stats Row (4 Stat Cards) -->
    <g>
      <!-- Stat 1 -->
      <rect x="105" y="195" width="235" height="85" rx="14" fill="#131C31" stroke="#1E293B" stroke-width="1"/>
      <text x="125" y="222" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">ACTIVE REPAIRS</text>
      <text x="125" y="258" fill="#38BDF8" font-family="-apple-system, sans-serif" font-size="30" font-weight="900">28 Jobs</text>

      <!-- Stat 2 -->
      <rect x="360" y="195" width="235" height="85" rx="14" fill="#131C31" stroke="#1E293B" stroke-width="1"/>
      <text x="380" y="222" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">READY FOR PICKUP</text>
      <text x="380" y="258" fill="#34D399" font-family="-apple-system, sans-serif" font-size="30" font-weight="900">14 Devices</text>

      <!-- Stat 3 -->
      <rect x="615" y="195" width="235" height="85" rx="14" fill="#131C31" stroke="#1E293B" stroke-width="1"/>
      <text x="635" y="222" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">PENDING PARTS</text>
      <text x="635" y="258" fill="#FBBF24" font-family="-apple-system, sans-serif" font-size="30" font-weight="900">4 Orders</text>

      <!-- Stat 4 -->
      <rect x="870" y="195" width="230" height="85" rx="14" fill="#131C31" stroke="#1E293B" stroke-width="1"/>
      <text x="890" y="222" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">TODAY REVENUE</text>
      <text x="890" y="258" fill="#A855F7" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">&#8377;48,500</text>
    </g>

    <!-- JOB CARDS SECTION -->
    <text x="105" y="315" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="16" font-weight="800">Live Service Job Cards &amp; Status</text>

    <!-- Job Card 1 -->
    <g>
      <rect x="105" y="335" width="995" height="75" rx="12" fill="#131C31" stroke="#0284C7" stroke-width="1.5"/>
      <rect x="120" y="352" width="40" height="40" rx="8" fill="#0284C7"/>
      <text x="132" y="377" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="16">&#128241;</text>
      
      <text x="175" y="365" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="15" font-weight="800">Apple iPhone 14 Pro Max</text>
      <text x="175" y="388" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12">Job #FX-1042 &#8226; Customer: Karthik R. &#8226; Issue: Original OLED Screen Replacement</text>

      <text x="680" y="377" fill="#F8FAFC" font-family="-apple-system, sans-serif" font-size="16" font-weight="900">&#8377;14,500</text>
      <text x="680" y="394" fill="#64748B" font-family="-apple-system, sans-serif" font-size="10">Est. Cost</text>

      <rect x="800" y="355" width="130" height="34" rx="17" fill="#0369A1"/>
      <text x="822" y="377" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="800">&#9881; IN PROGRESS</text>

      <rect x="950" y="355" width="135" height="34" rx="8" fill="#1E293B"/>
      <text x="965" y="377" fill="#38BDF8" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">Track SMS &#8594;</text>
    </g>

    <!-- Job Card 2 -->
    <g>
      <rect x="105" y="425" width="995" height="75" rx="12" fill="#131C31" stroke="#059669" stroke-width="1.5"/>
      <rect x="120" y="442" width="40" height="40" rx="8" fill="#059669"/>
      <text x="132" y="467" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="16">&#128241;</text>
      
      <text x="175" y="455" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="15" font-weight="800">Samsung Galaxy S23 Ultra</text>
      <text x="175" y="478" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12">Job #FX-1043 &#8226; Customer: Divya M. &#8226; Issue: Motherboard Power IC &amp; Battery Repair</text>

      <text x="680" y="467" fill="#F8FAFC" font-family="-apple-system, sans-serif" font-size="16" font-weight="900">&#8377;8,200</text>
      <text x="680" y="484" fill="#64748B" font-family="-apple-system, sans-serif" font-size="10">Est. Cost</text>

      <rect x="800" y="445" width="130" height="34" rx="17" fill="url(#emerald-grad)"/>
      <text x="815" y="467" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="800">&#10003; READY PICKUP</text>

      <rect x="950" y="445" width="135" height="34" rx="8" fill="#10B981"/>
      <text x="968" y="467" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">Send Invoice &#8226;</text>
    </g>

    <!-- Job Card 3 -->
    <g>
      <rect x="105" y="515" width="995" height="75" rx="12" fill="#131C31" stroke="#D97706" stroke-width="1.5"/>
      <rect x="120" y="532" width="40" height="40" rx="8" fill="#D97706"/>
      <text x="132" y="557" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="16">&#128241;</text>
      
      <text x="175" y="545" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="15" font-weight="800">OnePlus 11 5G</text>
      <text x="175" y="568" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="12">Job #FX-1044 &#8226; Customer: Sundar K. &#8226; Issue: Type-C Fast Charging Port Replacement</text>

      <text x="680" y="557" fill="#F8FAFC" font-family="-apple-system, sans-serif" font-size="16" font-weight="900">&#8377;2,400</text>
      <text x="680" y="574" fill="#64748B" font-family="-apple-system, sans-serif" font-size="10">Est. Cost</text>

      <rect x="800" y="535" width="130" height="34" rx="17" fill="#B45309"/>
      <text x="822" y="557" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="800">&#9888; DIAGNOSING</text>

      <rect x="950" y="535" width="135" height="34" rx="8" fill="#1E293B"/>
      <text x="975" y="557" fill="#FBBF24" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">View Logs &#8594;</text>
    </g>
  </g>
</svg>
`;

// 4. Sairam Hub Mobile Application SVG Mockup
const sairamHubSvg = `
<svg width="1200" height="675" viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="sh-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A1128"/>
      <stop offset="50%" stop-color="#001F54"/>
      <stop offset="100%" stop-color="#034078"/>
    </linearGradient>
    <linearGradient id="sh-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#FACC15"/>
      <stop offset="100%" stop-color="#EAB308"/>
    </linearGradient>
    <linearGradient id="phone-screen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <filter id="sh-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="675" fill="url(#sh-bg)"/>

  <!-- Left Side: Brand Narrative & Feature Pills -->
  <g>
    <rect x="90" y="80" width="160" height="34" rx="17" fill="#FEF08A" opacity="0.15"/>
    <text x="105" y="103" fill="url(#sh-gold)" font-family="-apple-system, sans-serif" font-size="12" font-weight="800" letter-spacing="1">CAMPUS APP</text>

    <text x="90" y="165" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="44" font-weight="900" letter-spacing="-1">Sairam Hub</text>
    <text x="90" y="205" fill="#93C5FD" font-family="-apple-system, sans-serif" font-size="22" font-weight="700">Smart Campus Student Companion</text>

    <text x="90" y="255" fill="#E2E8F0" font-family="-apple-system, sans-serif" font-size="15" font-weight="400">An exclusive mobile application engineered for Sairam institutions.</text>
    <text x="90" y="280" fill="#E2E8F0" font-family="-apple-system, sans-serif" font-size="15" font-weight="400">Connecting 10,000+ students with real-time academic records,</text>
    <text x="90" y="305" fill="#E2E8F0" font-family="-apple-system, sans-serif" font-size="15" font-weight="400">bus fleet tracking, instant OD approvals, and collaborative clubs.</text>

    <!-- Key Metrics Cards -->
    <g>
      <rect x="90" y="350" width="190" height="90" rx="16" fill="#001F54" stroke="#1D4ED8" stroke-width="1.5"/>
      <text x="110" y="385" fill="#60A5FA" font-family="-apple-system, sans-serif" font-size="13" font-weight="700">ACTIVE STUDENTS</text>
      <text x="110" y="423" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">10,000+</text>

      <rect x="300" y="350" width="190" height="90" rx="16" fill="#001F54" stroke="#EAB308" stroke-width="1.5"/>
      <text x="320" y="385" fill="url(#sh-gold)" font-family="-apple-system, sans-serif" font-size="13" font-weight="700">ATTENDANCE ACCURACY</text>
      <text x="320" y="423" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="28" font-weight="900">99.8%</text>
    </g>

    <!-- Feature badges -->
    <g>
      <rect x="90" y="470" width="400" height="45" rx="12" fill="#0A1E3F" stroke="#1E3A8A" stroke-width="1"/>
      <text x="110" y="498" fill="#F8FAFC" font-family="-apple-system, sans-serif" font-size="14" font-weight="600">&#128652; Real-Time College Bus Fleet GPS Tracking</text>

      <rect x="90" y="530" width="400" height="45" rx="12" fill="#0A1E3F" stroke="#1E3A8A" stroke-width="1"/>
      <text x="110" y="558" fill="#F8FAFC" font-family="-apple-system, sans-serif" font-size="14" font-weight="600">&#9889; Digital On-Duty (OD) Approval &amp; Internal Marks</text>
    </g>
  </g>

  <!-- Right Side: Centered Modern Smartphone Device Frame -->
  <g filter="url(#sh-shadow)">
    <!-- Smartphone Outer Bezel -->
    <rect x="730" y="30" width="310" height="615" rx="42" fill="#000000" stroke="#334155" stroke-width="4"/>
    <!-- Screen Inner Display -->
    <rect x="740" y="42" width="290" height="591" rx="34" fill="url(#phone-screen)"/>
    
    <!-- Dynamic Island / Speaker Notch -->
    <rect x="835" y="52" width="100" height="24" rx="12" fill="#000000"/>
    <circle cx="915" cy="64" r="5" fill="#1E293B"/>

    <!-- Status Bar -->
    <text x="760" y="68" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">09:41</text>
    <text x="980" y="68" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12">&#128267; 5G</text>

    <!-- App Header inside Phone -->
    <rect x="755" y="90" width="260" height="60" rx="14" fill="#1E3A8A"/>
    <circle cx="785" cy="120" r="18" fill="url(#sh-gold)"/>
    <text x="778" y="126" fill="#000000" font-family="-apple-system, sans-serif" font-size="14" font-weight="900">S</text>
    <text x="815" y="115" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="15" font-weight="900">SAIRAM HUB</text>
    <text x="815" y="133" fill="#93C5FD" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">Student Portal &#8226; 2026</text>

    <!-- Student Attendance Card inside Phone -->
    <rect x="755" y="165" width="260" height="120" rx="16" fill="#0B132B" stroke="#1D4ED8" stroke-width="1.5"/>
    <text x="775" y="195" fill="#94A3B8" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">SEMESTER ATTENDANCE</text>
    
    <text x="775" y="235" fill="url(#sh-gold)" font-family="-apple-system, sans-serif" font-size="34" font-weight="900">89.4%</text>
    <text x="775" y="262" fill="#10B981" font-family="-apple-system, sans-serif" font-size="12" font-weight="700">&#10003; Eligible for Exams</text>

    <!-- Circular Mini Progress Ring -->
    <circle cx="965" cy="225" r="32" fill="none" stroke="#1E293B" stroke-width="6"/>
    <circle cx="965" cy="225" r="32" fill="none" stroke="#FACC15" stroke-width="6" stroke-dasharray="170" stroke-dashoffset="25"/>
    <text x="950" y="230" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="12" font-weight="800">89%</text>

    <!-- Next Lecture Schedule Card -->
    <rect x="755" y="300" width="260" height="95" rx="14" fill="#132247"/>
    <text x="770" y="325" fill="#60A5FA" font-family="-apple-system, sans-serif" font-size="11" font-weight="800">NEXT CLASS: 10:30 AM</text>
    <text x="770" y="350" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="14" font-weight="800">Cloud &amp; DevOps Engineering</text>
    <text x="770" y="375" fill="#93C5FD" font-family="-apple-system, sans-serif" font-size="11">Lab 04 &#8226; Dr. K. Ramanathan</text>

    <!-- Campus Action Grid (4 icons) inside Phone -->
    <rect x="755" y="410" width="122" height="65" rx="12" fill="#1E293B"/>
    <text x="770" y="435" fill="#FACC15" font-family="-apple-system, sans-serif" font-size="18">&#128652;</text>
    <text x="770" y="458" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">Bus Tracker</text>

    <rect x="893" y="410" width="122" height="65" rx="12" fill="#1E293B"/>
    <text x="908" y="435" fill="#38BDF8" font-family="-apple-system, sans-serif" font-size="18">&#128203;</text>
    <text x="908" y="458" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">OD Request</text>

    <rect x="755" y="490" width="122" height="65" rx="12" fill="#1E293B"/>
    <text x="770" y="515" fill="#EC4899" font-family="-apple-system, sans-serif" font-size="18">&#128218;</text>
    <text x="770" y="538" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">Study Notes</text>

    <rect x="893" y="490" width="122" height="65" rx="12" fill="#1E293B"/>
    <text x="908" y="515" fill="#10B981" font-family="-apple-system, sans-serif" font-size="18">&#127942;</text>
    <text x="908" y="538" fill="#FFFFFF" font-family="-apple-system, sans-serif" font-size="11" font-weight="700">Hackathons</text>

    <!-- Phone Bottom Navigation Bar -->
    <rect x="740" y="575" width="290" height="55" rx="0" fill="#0B132B"/>
    <text x="770" y="605" fill="#FACC15" font-family="-apple-system, sans-serif" font-size="11" font-weight="800">Home</text>
    <text x="830" y="605" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">Events</text>
    <text x="890" y="605" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">Bus</text>
    <text x="955" y="605" fill="#64748B" font-family="-apple-system, sans-serif" font-size="11" font-weight="600">Profile</text>
    <!-- Home bar line -->
    <rect x="835" y="620" width="100" height="4" rx="2" fill="#94A3B8"/>
  </g>
</svg>
`;

async function generate() {
  console.log('Rendering 4 new high-resolution product mockups...');
  
  await sharp(Buffer.from(frameFolioSvg)).png().toFile(path.join(outDir, 'framefolio.png'));
  console.log('Generated: public/products/framefolio.png');

  await sharp(Buffer.from(salonSlotSvg)).png().toFile(path.join(outDir, 'salonslot.png'));
  console.log('Generated: public/products/salonslot.png');

  await sharp(Buffer.from(fixDeskSvg)).png().toFile(path.join(outDir, 'fixdesk.png'));
  console.log('Generated: public/products/fixdesk.png');

  await sharp(Buffer.from(sairamHubSvg)).png().toFile(path.join(outDir, 'sairamhub.png'));
  console.log('Generated: public/products/sairamhub.png');

  console.log('All 4 mockup images generated successfully!');
}

generate().catch(err => {
  console.error('Error generating images:', err);
  process.exit(1);
});
