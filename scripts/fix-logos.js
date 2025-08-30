const fs = require('fs');
const path = require('path');

// Directories
const extensionsDir = path.join(__dirname, 'src', 'admin', 'extensions');

// Create extensions directory if it doesn't exist
if (!fs.existsSync(extensionsDir)) {
  fs.mkdirSync(extensionsDir, { recursive: true });
}

// Function to create an SVG logo
function createSvgLogo(filePath, width, height, text, bgColor = '#4945ff', textColor = '#ffffff') {
  console.log(`Creating SVG logo: ${filePath}`);
  
  const svgContent = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="${bgColor}"/>
  <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="${height/3}" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
</svg>`;
  
  fs.writeFileSync(filePath, svgContent);
  console.log(`Created ${filePath}`);
}

// Reuse SVG files for PNG (Strapi will handle this conversion)
function copySvgAsPng(svgPath, pngPath) {
  console.log(`Copying SVG as PNG: ${pngPath}`);
  fs.copyFileSync(svgPath, pngPath);
  console.log(`Created ${pngPath}`);
}

// Create SVG logos
createSvgLogo(path.join(extensionsDir, 'auth-logo.svg'), 240, 80, 'Jagannath Tales');
createSvgLogo(path.join(extensionsDir, 'menu-logo.svg'), 160, 32, 'JT');

// Create a simple favicon SVG
const faviconSvgPath = path.join(extensionsDir, 'favicon.svg');
createSvgLogo(faviconSvgPath, 32, 32, 'J', '#4945ff', '#ffffff');

// Copy SVGs for PNG usage
copySvgAsPng(path.join(extensionsDir, 'auth-logo.svg'), path.join(extensionsDir, 'auth-logo.png'));
copySvgAsPng(path.join(extensionsDir, 'menu-logo.svg'), path.join(extensionsDir, 'menu-logo.png'));
copySvgAsPng(faviconSvgPath, path.join(extensionsDir, 'favicon.png'));
copySvgAsPng(faviconSvgPath, path.join(__dirname, 'public', 'favicon.png'));

// Create a simple .ico file for favicon
const icoSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
  <rect width="32" height="32" fill="#4945ff"/>
  <text x="16" y="16" font-family="Arial" font-size="24" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="#ffffff">J</text>
</svg>`;
fs.writeFileSync(path.join(extensionsDir, 'favicon.ico'), icoSvgContent);

console.log('All logo files have been created successfully!');
