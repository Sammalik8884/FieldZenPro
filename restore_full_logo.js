const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const originalInput = 'D:\\logos\\Dark Blue and Orange Illustrative Construction Logo.png';
const output = path.join(__dirname, 'frontend', 'public', 'assets', 'images', 'fieldzenpro-logo.png');

// This will tightly trim ALL transparent padding, keeping the full hard hat, gear, AND the text perfectly intact.
sharp(originalInput)
  .trim()
  .toFile(output)
  .then(info => {
    console.log('Restored full trimmed logo successfully:', info);
  })
  .catch(err => {
    console.error('Error restoring logo:', err);
  });
