const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory storage for URL shortening
const urlDatabase = {};
let nextShortUrlId = 1;

app.use('/public', express.static(`${process.cwd()}/public`));
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// API endpoint for shortening URL
app.post('/api/shorturl', function(req, res) {
  const originalUrl = req.body.url;

  // Validate the URL format
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Validate the URL domain using dns.lookup
  const urlParts = new URL(originalUrl);
  dns.lookup(urlParts.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }
    
    // Generate short URL and store in database
    const shortUrl = nextShortUrlId++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// Redirect to original URL when accessing short URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shortUrl = req.params.short_url;
  const originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.status(404).send('URL not found');
  }

  res.redirect(originalUrl);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
