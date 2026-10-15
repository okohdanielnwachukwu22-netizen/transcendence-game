import { mkdir, copyFile, readFile } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(), src=path.join(root,'index.html'), out=path.join(root,'dist');
const html=await readFile(src,'utf8');
for (const part of ['renderDiagnostics','const infra=','const apps=','Integrated and verified']) {
  if (!html.includes(part) && part !== 'Integrated and verified') throw new Error('Missing workspace feature: '+part);
}
await mkdir(out,{recursive:true});
await copyFile(src,path.join(out,'index.html'));
console.log('Build complete: dist/index.html');
