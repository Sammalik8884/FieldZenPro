const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'D:\\logos\\Dark Blue and Orange Illustrative Construction Logo.png';
const iconOutput = path.join(__dirname, 'frontend', 'public', 'assets', 'images', 'fieldzenpro-logo.png');
const faviconOutput = path.join(__dirname, 'frontend', 'public', 'favicon.png');

async function processImage() {
  // First trim the whitespace to find the actual content bounds
  const trimmed = sharp(inputPath).trim();
  const { data: trimmedData, info: trimmedInfo } = await trimmed.toBuffer({ resolveWithObject: true });
  
  // The content is at the top. We'll extract the top square (the icon)
  const size = trimmedInfo.width;
  
  // Get raw pixels of the square icon
  const { data, info } = await sharp(trimmedData)
    .extract({ left: 0, top: 0, width: size, height: size })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Make near-white pixels transparent
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      data[i + 3] = 0; // set alpha to 0
    }
  }

  const processedSharp = sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  });

  // Save the navbar icon
  await processedSharp
    .png()
    .toFile(iconOutput);

  // Save the favicon
  await processedSharp
    .resize(64, 64)
    .png()
    .toFile(faviconOutput);

  console.log('Successfully created transparent square navbar icon and favicon!');
}

processImage().catch(console.error);
