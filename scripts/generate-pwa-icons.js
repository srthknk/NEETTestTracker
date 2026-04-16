#!/usr/bin/env node

/**
 * PWA Icon Generator
 * 
 * This script converts SVG icons to PNG format required by PWA manifest.
 * 
 * Installation:
 * npm install sharp
 * 
 * Usage:
 * node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

console.log('PWA Icon Generation Guide');
console.log('=========================\n');

console.log('To generate PNG icons from the SVG files, you have several options:\n');

console.log('Option 1: Using Online Tools (Easiest)\n');
console.log('1. Visit https://icoconvert.com/ or https://cloudconvert.com/svg-to-png');
console.log('2. Upload each SVG file from public/icons/');
console.log('3. Download the PNG files and save them to the same directory\n');

console.log('Option 2: Using Node.js Script\n');
console.log('1. Install sharp: npm install sharp');
console.log('2. Run this script: node scripts/generate-pwa-icons.js\n');

console.log('Option 3: Using ImageMagick (CLI)\n');
console.log('1. Install ImageMagick: apt-get install imagemagick (Linux) or brew install imagemagick (Mac)');
console.log('2. Run commands:');
console.log('   convert -background none public/icons/icon-192.svg -resize 192x192 public/icons/icon-192.png');
console.log('   convert -background none public/icons/icon-512.svg -resize 512x512 public/icons/icon-512.png');
console.log('   convert -background none public/icons/icon-maskable-192.svg -resize 192x192 public/icons/icon-maskable-192.png');
console.log('   convert -background none public/icons/icon-maskable-512.svg -resize 512x512 public/icons/icon-maskable-512.png');
console.log('   convert -background none public/icons/apple-touch-icon.svg -resize 180x180 public/icons/apple-touch-icon.png\n');

console.log('Option 4: Using Puppeteer (Programmatic)\n');
console.log('1. Install puppeteer: npm install puppeteer');
console.log('2. Create a conversion script (see example below)\n');

console.log('Required PNG files:');
console.log('- public/icons/icon-192.png (192x192)');
console.log('- public/icons/icon-512.png (512x512)');
console.log('- public/icons/icon-maskable-192.png (192x192, transparent background)');
console.log('- public/icons/icon-maskable-512.png (512x512, transparent background)');
console.log('- public/icons/apple-touch-icon.png (180x180, no transparency)\n');

console.log('Note: The SVG files are already created and can be used directly in modern browsers.');
console.log('However, PNG versions are recommended for maximum compatibility.\n');

// Try to use sharp if available
try {
  const sharp = require('sharp');
  const iconsDir = path.join(__dirname, '../public/icons');
  
  const conversions = [
    { from: 'icon-192.svg', to: 'icon-192.png', size: 192 },
    { from: 'icon-512.svg', to: 'icon-512.png', size: 512 },
    { from: 'icon-maskable-192.svg', to: 'icon-maskable-192.png', size: 192 },
    { from: 'icon-maskable-512.svg', to: 'icon-maskable-512.png', size: 512 },
    { from: 'apple-touch-icon.svg', to: 'apple-touch-icon.png', size: 180 },
  ];

  console.log('Attempting to generate PNG icons using sharp...\n');

  conversions.forEach(async (conversion) => {
    const inputPath = path.join(iconsDir, conversion.from);
    const outputPath = path.join(iconsDir, conversion.to);

    if (fs.existsSync(inputPath)) {
      try {
        await sharp(inputPath)
          .resize(conversion.size, conversion.size, { fit: 'fill' })
          .png()
          .toFile(outputPath);
        console.log(`✓ Generated ${conversion.to}`);
      } catch (error) {
        console.error(`✗ Failed to generate ${conversion.to}:`, error.message);
      }
    }
  });
} catch (error) {
  console.log('Note: sharp is not installed. Install it with: npm install sharp');
}
