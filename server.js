const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Always let browsers re-check the service worker (and manifest) for updates,
// so a new deploy is picked up promptly instead of being served stale.
app.use(['/sw.js', '/manifest.json'], (req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache');
  next();
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.listen(PORT, () => {
  console.log(`Gospel Scroll running on port ${PORT}`);
});
