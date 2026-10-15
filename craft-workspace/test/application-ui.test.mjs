import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const registry = await readFile(new URL("../src/registry.ts", import.meta.url), "utf8");

test("application details stay inside Craft Workspace instead of opening upstream source", () => {
  assert.equal(app.includes("github.com/storytold/"), false);
  assert.ok(app.includes("APPLICATION DETAILS"));
  assert.ok(app.includes("Integration required"));
  assert.ok(app.includes("Open connection panel"));
});
test("workspace profile can be opened and saved locally", () => {
  assert.ok(app.includes('if (modal.type === "profile")'));
  assert.ok(app.includes('localStorage.setItem("craft-workspace-profile-name", name)'));
  assert.ok(app.includes("Save profile"));
});
test("document metadata loads the branded favicon", () => {
  assert.ok(html.includes('href="/favicon.svg"'));
});

test("creative application entries use direct official launch targets instead of source repositories", () => {
  assert.ok(registry.includes("launchUrl:")); 
  assert.ok(app.includes("const launchApp = (item: RegisteredApp) =>")); 
  assert.equal(app.includes('onClick={() => setModal({ type: "application", app: item })}'), false);
  assert.ok(registry.includes("launchState: \"coming-soon\""));
});
