const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const originalInput = 'D:\\logos\\Dark Blue and Orange Illustrative Construction Logo.png';
const output = path.join(__dirname, 'frontend', 'public', 'assets', 'images', 'fieldzenpro-logo.png');

// First trim to get rid of the padding, then take the top square
sharp(originalInput)
  .trim()
  .toBuffer({ resolveWithObject: true })
  .then(({ data, info }) => {
    // The trimmed image has the gear/hardhat at the top, and text at the bottom.
    // Assuming the gear/hardhat forms a rough square at the top, we extract a square equal to the width.
    const size = info.width; // 1129
    return sharp(data)
      .extract({ left: 0, top: 0, width: size, height: size }) // grab the top square
      .toFile(output);
  })
  .then(info => {
    console.log('Created square logo successfully:', info);
  })
  .catch(err => {
    console.error('Error creating square logo:', err);
  });
