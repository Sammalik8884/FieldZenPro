const Jimp = require('jimp');
const path = require('path');
const fs = require('fs');

const inputPath = 'D:\\logos\\Dark Blue and Orange Illustrative Construction Logo.png';
const iconOutput = path.join(__dirname, 'frontend', 'public', 'assets', 'images', 'fieldzenpro-logo.png');
const faviconOutput = path.join(__dirname, 'frontend', 'public', 'favicon.png');

Jimp.read(inputPath)
  .then(image => {
    // We only need the top square. The image is 2000x2000, let's crop the logo part.
    // Wait, earlier sharp showed it was bounded from x=435, y=330.
    // The width was 1129. So let's crop to 1129x1129 starting at 435, 330.
    image.crop(435, 330, 1129, 1129);

    // Now replace all white with transparent.
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      
      // If the pixel is very light (almost white), make it transparent
      if (red > 240 && green > 240 && blue > 240) {
        this.bitmap.data[idx + 3] = 0; // Alpha
      }
    });

    // Save the navbar icon
    image.write(iconOutput);
    
    // Save the favicon
    image.resize(64, 64).write(faviconOutput);
    
    console.log('Successfully created transparent square navbar icon and favicon!');
  })
  .catch(err => {
    console.error('Error processing image:', err);
  });
