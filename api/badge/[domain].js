export default function handler(req, res) {
  const { domain } = req.query;
  
  if (!domain) {
    return res.status(400).send('Domain parameter is required');
  }

  // Format domain to match our bucket file names (e.g. "Web Development" -> "web-development")
  const safeDomain = domain.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dutluhoqfxkfqlzbloxu.supabase.co';
  const imageUrl = `${supabaseUrl}/storage/v1/object/public/badges/${safeDomain}-badge.png`;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Internship Completed - ${domain.replace(/-/g, ' ')}</title>
        
        <!-- Open Graph / LinkedIn / Facebook Meta Tags -->
        <meta property="og:title" content="Internship Completed at DAKH Edu Solutions">
        <meta property="og:description" content="I successfully completed an internship in ${domain.replace(/-/g, ' ')}!">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:width" content="800">
        <meta property="og:image:height" content="960">
        <meta property="og:type" content="website">
        
        <!-- Twitter Meta Tags -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="Internship Completed at DAKH Edu Solutions">
        <meta name="twitter:description" content="I successfully completed an internship in ${domain.replace(/-/g, ' ')}!">
        <meta name="twitter:image" content="${imageUrl}">
        
        <!-- Redirect humans back to the home page -->
        <script>
            window.location.href = "/";
        </script>
    </head>
    <body>
        <p>Redirecting...</p>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}
