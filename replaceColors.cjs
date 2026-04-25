const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const colorMap = {
  '#0a0a0a': '#021209', // lowest
  '#131313': '#051f11', // surface
  '#1b1b1b': '#082b18', // surface-low
  '#1f1f1f': '#0d3820', // surface-container
  '#2a2a2a': '#134529', // surface-high
  '#353535': '#195331', // surface-highest
  '#474747': '#234a31', // outline-variant
  '#1a1c1c': '#064e3b', // dark green text on white
  '#c8c6c6': '#a7f3d0', // muted text
  '#c6c6c6': '#a7f3d0',
  '#919191': '#4b7b5c', // outline/dim text
  '#5e5e5e': '#4b7b5c',
  '#e2e2e2': '#f0fdf4', // bright text
  '#ff00c1': '#4ade80', // magenta -> vibrant green (terminal glitch)
  '#00fff9': '#10b981', // cyan -> emerald (terminal glitch)
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        // use regex to match case-insensitive
        const regex = new RegExp(oldColor, 'gi');
        if (regex.test(content)) {
          content = content.replace(regex, newColor);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated colors in ${file}`);
      }
    }
  });
}

processDirectory(srcDir);
console.log('Color replacement complete!');
