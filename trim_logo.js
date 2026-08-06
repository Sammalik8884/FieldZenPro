const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const input = path.join(__dirname, 'frontend/public/assets/images/fieldzenpro-logo.png');
const output = path.join(__dirname, 'frontend/public/assets/images/fieldzenpro-logo-trimmed.png');

sharp(input)
  .trim() // this removes transparent borders
  .toFile(output)
  .then(info => {
    console.log('Trimmed logo successfully:', info);
    // Let's replace the old one with the trimmed one
    fs.renameSync(output, input);
  })
  .catch(err => {
    console.error('Error trimming logo:', err);
  });
