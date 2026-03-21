/**
 * Spendly Asset Generator
 * 
 * This script generates the app icon and splash screen using the 'canvas' package.
 * To run this:
 * 1. npm install canvas
 * 2. node scripts/generate-assets.js
 */

const fs = require('fs');
const path = require('path');

try {
    const { createCanvas } = require('canvas');

    const ASSETS_DIR = path.join(__dirname, '../assets');
    if (!fs.existsSync(ASSETS_DIR)) {
        fs.mkdirSync(ASSETS_DIR);
    }

    const ACCENT_COLOR = '#6C63FF';
    const SLATE_DARK = '#1A1A2E';

    // 1. App Icon (1024x1024)
    const generateIcon = () => {
        const canvas = createCanvas(1024, 1024);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = ACCENT_COLOR;
        ctx.fillRect(0, 0, 1024, 1024);

        // Letter S
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 512px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 512, 530);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(ASSETS_DIR, 'icon.png'), buffer);
        fs.writeFileSync(path.join(ASSETS_DIR, 'adaptive-icon.png'), buffer);
        console.log('✅ Generated icons');
    };

    // 2. Splash Screen (1284x2778)
    const generateSplash = () => {
        const canvas = createCanvas(1284, 2778);
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 1284, 2778);

        // Logo Circle
        ctx.fillStyle = ACCENT_COLOR;
        ctx.beginPath();
        ctx.arc(642, 1200, 150, 0, Math.PI * 2);
        ctx.fill();

        // Logo Letter
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 180px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 642, 1210);

        // App Name
        ctx.fillStyle = SLATE_DARK;
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Spendly', 642, 1450);

        const buffer = canvas.toBuffer('image/png');
        fs.writeFileSync(path.join(ASSETS_DIR, 'splash.png'), buffer);
        console.log('✅ Generated splash screen');
    };

    generateIcon();
    generateSplash();

} catch (err) {
    console.error('❌ Error: The "canvas" package is required to run this script.');
    console.log('Run: npm install canvas');
}
