const sharp = require('sharp');
const path = require('path');

const inputPath = 'D:\\logos\\Dark Blue and Orange Illustrative Construction Logo.png';
const iconOutput = path.join(__dirname, 'frontend', 'public', 'assets', 'images', 'fieldzenpro-logo.png');
const faviconOutput = path.join(__dirname, 'frontend', 'public', 'favicon.png');

async function processImage() {
  // 1. Trim the whitespace
  const trimmed = sharp(inputPath).trim();
  const { data: trimmedData, info: trimmedInfo } = await trimmed.toBuffer({ resolveWithObject: true });
  
  // trimmedInfo is 1129x1311
  // The text is at the bottom. The gear and hardhat are at the top.
  // The gear/hardhat bounding box is probably around 1129x1000.
  // Let's crop the top 1000 pixels (or a square 1129x1050 but centered?)
  // Actually, let's just make the height 1020 to safely avoid the text.
  const cropHeight = 1000;
  
  const { data: croppedData, info: croppedInfo } = await sharp(trimmedData)
    .extract({ left: 0, top: 0, width: trimmedInfo.width, height: cropHeight })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Make near-white pixels transparent
  for (let i = 0; i < croppedData.length; i += 4) {
    const r = croppedData[i];
    const g = croppedData[i + 1];
    const b = croppedData[i + 2];
    if (r > 240 && g > 240 && b > 240) {
      croppedData[i + 3] = 0; // set alpha to 0
    }
  }

  const processedSharp = sharp(croppedData, {
    raw: { width: croppedInfo.width, height: croppedInfo.height, channels: 4 }
  });

  // Save the navbar icon
  await processedSharp
    .png()
    .toFile(iconOutput);

  // Save the favicon (make it square by resizing with fit: contain or cover)
  // Wait, if it's 1129x1000, it's not a perfect square. Favicon should be square.
  await processedSharp
    .resize(64, 64, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(faviconOutput);

  console.log('Fixed chopped text issue! Created transparent icons.');
}

processImage().catch(console.error);
