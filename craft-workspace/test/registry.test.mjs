import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const registry = await readFile(new URL("../src/registry.ts", import.meta.url), "utf8");
const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

test("registry includes the required 14 creative repositories", () => {
  for (const repo of ["artcraft","photocraft","artcraftx","lightcraft","filmcraft","vectorcraft","cadcraft","wordcraft","soundcraft","pdfcraft","designcraft","effectcraft","deckcraft","gridcraft"]) {
    assert.ok(registry.includes('repo: "' + repo + '"'), "Missing " + repo);
  }
});
test("registry includes all seven support repositories", () => {
  for (const repo of ["artcraft-services","craft-launcher","craft-fonts","craft-libs","craft-repo-status-app","photocraft-corpus","terraform-aws-observability-accelerator"]) {
    assert.ok(registry.includes('repo: "' + repo + '"'), "Missing " + repo);
  }
});
test("UI does not claim unbuilt native applications are integrated", () => {
  assert.ok(registry.includes('"Not inspected"'));
  assert.ok(app.includes("does not mean the application is installed"));
  assert.ok(app.includes("Not configured"));
});
