import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const all = html + '\n' + app;

test('has core workspace pages', () => {
  for (const name of ['Home', 'Projects', 'Files', 'Applications', 'AI Workspace', 'Activity', 'Diagnostics', 'Settings']) {
    assert.ok(all.includes(name), name);
  }
});
test('has all 14 creative repositories', () => {
  for (const name of ['artcraft','photocraft','artcraftx','lightcraft','filmcraft','vectorcraft','cadcraft','wordcraft','soundcraft','pdfcraft','designcraft','effectcraft','deckcraft','gridcraft']) {
    assert.ok(app.includes("'" + name + "'"), name);
  }
});
test('has all 7 shared repositories', () => {
  for (const name of ['artcraft-services','craft-launcher','craft-fonts','craft-libs','craft-repo-status-app','photocraft-corpus','terraform-aws-observability-accelerator']) {
    assert.ok(app.includes("'" + name + "'"), name);
  }
});
test('honestly distinguishes local shell from integrations', () => {
  assert.ok(app.includes('Not inspected'));
  assert.ok(app.includes('Not configured'));
  assert.ok(app.includes('does not launch or embed creative applications'));
  assert.ok(app.includes('This does not execute the test.'));
});
