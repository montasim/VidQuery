import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.join(__dirname, '..');
const distDir = path.join(sourceDir, 'extension-dist');

// Files to copy to the extension distribution
const extensionFiles = [
    'manifest.json',
    'content.js',
    'background.js',
    'styles.css',
    'popup.html',
    'popup.js',
];

// Directories to copy
const extensionDirs = ['icons'];

console.info('🚀 Building Chrome Extension...');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Copy extension files
extensionFiles.forEach((file) => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(distDir, file);

    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.info(`✅ Copied ${file}`);
    } else {
        console.info(`⚠️  Warning: ${file} not found`);
    }
});

// Copy extension directories
extensionDirs.forEach((dir) => {
    const sourcePath = path.join(sourceDir, dir);
    const destPath = path.join(distDir, dir);

    if (fs.existsSync(sourcePath)) {
        copyDir(sourcePath, destPath);
        console.info(`✅ Copied ${dir}/ directory`);
    } else {
        console.info(`⚠️  Warning: ${dir}/ directory not found`);
    }
});

// Copy README for documentation
const readmePath = path.join(sourceDir, 'README.md');
const distReadmePath = path.join(distDir, 'README.md');
if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, distReadmePath);
    console.info('✅ Copied README.md');
}

// Create a simple installation guide
const installGuide = `# YouTube Video Chat Extension

## Quick Installation Guide

1. Open Chrome and go to chrome://extensions/
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select this folder (extension-dist)
5. The extension should appear in your extensions list

## Setup

1. Click the extension icon in your browser toolbar
2. Enter your Gemini API key (get one from https://makersuite.google.com/app/apikey)
3. Go to any YouTube video and click the red chat button!

See README.md for detailed instructions.
`;

fs.writeFileSync(path.join(distDir, 'INSTALL.md'), installGuide);
console.info('✅ Created INSTALL.md');

console.info('\n🎉 Extension build complete!');
console.info(`📁 Extension files are in: ${path.relative(sourceDir, distDir)}`);
console.info('\n📋 Next steps:');
console.info('  1. Run "npm run package:extension" to create a ZIP file');
console.info('  2. Or load the extension-dist folder directly in Chrome');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const files = fs.readdirSync(src);
    files.forEach((file) => {
        const srcPath = path.join(src, file);
        const destPath = path.join(dest, file);

        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}
