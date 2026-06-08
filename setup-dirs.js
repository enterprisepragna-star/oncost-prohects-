const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\hp\\Documents\\ONCOST WEBSITE';

// Create directory recursively
function createDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created: ${dir}`);
  }
}

// List of directories to create
const dirs = [
  'src\\app\\shop',
  'src\\app\\collections',
  'src\\app\\signup',
  'src\\app\\login',
  'src\\app\\forgot-password',
  'src\\app\\contact',
  'src\\app\\account',
  'src\\app\\bulk-orders',
  'src\\app\\about',
  'src\\app\\privacy',
  'src\\app\\terms',
  'src\\app\\services',
  'src\\app\\careers',
  'pages\\api',
];

// Create all directories
dirs.forEach(dir => {
  createDir(path.join(baseDir, dir));
});

console.log('All directories created successfully!');
