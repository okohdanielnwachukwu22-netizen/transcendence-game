import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
test('has core workspace pages',()=>{for(const n of ['Home','Projects','Files','Applications','AI Workspace','Activity','Diagnostics','Settings'])assert.ok(html.includes(n),n)});
test('has all 14 creative repositories',()=>{for(const n of ['artcraft','photocraft','artcraftx','lightcraft','filmcraft','vectorcraft','cadcraft','wordcraft','soundcraft','pdfcraft','designcraft','effectcraft','deckcraft','gridcraft'])assert.ok(html.includes("'"+n+"'"),n)});
test('has all 7 shared repositories',()=>{for(const n of ['artcraft-services','craft-launcher','craft-fonts','craft-libs','craft-repo-status-app','photocraft-corpus','terraform-aws-observability-accelerator'])assert.ok(html.includes("'"+n+"'"),n)});
test('uses honest unverified states',()=>{assert.ok(html.includes('Not inspected'));assert.ok(html.includes('Not configured'));assert.ok(html.includes('does not launch or embed creative applications'))});
