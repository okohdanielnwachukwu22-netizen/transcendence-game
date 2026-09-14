import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const required = [
  'TRANSCENDENCE',
  'The Unrecorded Guardian',
  'Transfer Point',
  'localStorage',
  'THREE',
  'WASD',
  'INTERACT',
  'ATTACK'
];

const missing = required.filter((token) => !html.includes(token));
if (missing.length) {
  console.error('Validation failed. Missing:', missing.join(', '));
  process.exit(1);
}

if (!html.includes('three@0.180.0')) {
  console.error('Validation failed. Three.js runtime pin is missing.');
  process.exit(1);
}

console.log('TRANSCENDENCE client validation passed.');
console.log(`HTML size: ${Buffer.byteLength(html, 'utf8')} bytes`);
