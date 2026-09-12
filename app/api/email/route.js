const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Helper to get random domain from tempmail service
async function getRandomDomain() {
  try {
    const res = await fetch('https://tempmail.yandez.my.id/');
    const html = await res.text();
    // Extract domains from the list after "Buat Email"
    // The page shows a list of domains separated by spaces/newlines.
    // We'll look for words that contain a dot and are likely domains.
    const domainMatches = html.match(/[a-zA-Z0-9][a-zA-Z0-9\-]*\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?/g);
    if (domainMatches && domainMatches.length > 0) {
      // Filter out common non-domains like 'com', 'id', etc.
      const domains = domainMatches.filter(d => 
        !['com', 'id', 'net', 'org', 'xyz', 'wiki', 'site', 'shop', 'club', 'online', 'icu', 'io', 'ovh', 'cf', 'ga', 'gq', 'ml', 'tk'].includes(d.split('.').pop()) &&
        d.split('.').length >= 2
      );
      if (domains.length > 0) {
        return domains[Math.floor(Math.random() * domains.length)];
      }
    }
    // fallback
    return '247chats.com';
  } catch (err) {
    console.error('Failed to fetch tempmail page:', err);
    return '247chats.com';
  }
}

// GET /api/email/generate
router.get('/generate', async (req, res) => {
  try {
    const domain = await getRandomDomain();
    const username = 'yaaaaanx';
    const email = `${username}@${domain}`;
    // Call tempmail API to generate email
    const apiRes = await fetch(`https://tempmail.yandez.my.id/api/generate?username=${encodeURIComponent(username)}&domain=${encodeURIComponent(domain)}`);
    const data = await apiRes.json();
    if (!data.success) {
      // If API fails, construct manually
      return res.json({
        success: true,
        email,
        username,
        domain,
        source: 'manual',
        generated_at: new Date().toISOString()
      });
    }
    res.json(data);
  } catch (err) {
    console.error('Error generating email:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
