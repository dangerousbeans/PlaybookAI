const fs = require('fs');
const { createCanvas } = require('canvas');

// Create a canvas with dimensions 400x400
const canvas = createCanvas(400, 400);
const ctx = canvas.getContext('2d');

// Fill background with light blue
ctx.fillStyle = '#e6f7ff';
ctx.fillRect(0, 0, 400, 400);

// Draw a simple stylized "AI" icon
ctx.fillStyle = '#007bff';
ctx.beginPath();
ctx.arc(200, 180, 100, 0, Math.PI * 2);
ctx.fill();

// Draw an inner white circle
ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(200, 180, 70, 0, Math.PI * 2);
ctx.fill();

// Draw "AI" text
ctx.font = 'bold 70px Arial';
ctx.fillStyle = '#007bff';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('AI', 200, 180);

// Draw a chat bubble below
ctx.fillStyle = '#007bff';
ctx.beginPath();
ctx.moveTo(150, 300);
ctx.lineTo(180, 280);
ctx.lineTo(210, 300);
ctx.fill();

// Save the image
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('ai-coach.png', buffer);

console.log('Image generated successfully: ai-coach.png');
