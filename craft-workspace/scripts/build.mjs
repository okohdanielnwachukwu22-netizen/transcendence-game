import { mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const htmlPath = path.join(root, 'index.html');
const appPath = path.join(root, 'app.js');
const cssPath = path.join(root, 'styles.css');

const [html, app, css] = await Promise.all([
  readFile(htmlPath, 'utf8'),
  readFile(appPath, 'utf8'),
  readFile(cssPath, 'utf8')
]);

if (!html.includes('src="./app.js"') || !html.includes('href="./styles.css"')) {
  throw new Error('The workspace entry page must load the app script and stylesheet.');
}
for (const feature of ['renderDiagnostics', 'const infra=', 'const apps=']) {
  if (!app.includes(feature)) throw new Error('Missing workspace feature: ' + feature);
}
if (css.length < 1000) throw new Error('The workspace stylesheet appears incomplete.');

await mkdir(out, { recursive: true });
await Promise.all([
  copyFile(htmlPath, path.join(out, 'index.html')),
  copyFile(appPath, path.join(out, 'app.js')),
  copyFile(cssPath, path.join(out, 'styles.css'))
]);
console.log('Build complete: dist/index.html, dist/app.js, dist/styles.css');
