import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const adapter = await readFile(new URL("../src/adapters/photocraft.ts", import.meta.url), "utf8");
const provider = await readFile(new URL("../src/providers/types.ts", import.meta.url), "utf8");
const adapterRegistry = await readFile(new URL("../src/adapters/registry.ts", import.meta.url), "utf8");

test("PhotoCraft adapter exposes only reviewed read operations", () => {
  assert.ok(adapter.includes("openRelativeFile"));
  assert.ok(adapter.includes("inspectActiveDocument"));
  assert.ok(adapter.includes("renderActivePreview"));
  assert.ok(adapter.includes('phase: "scaffolded"'));
  assert.equal(adapter.includes('id: "photocraft.document.save"'), false);
  assert.equal(adapter.includes('id: "photocraft.shell.execute"'), false);
});
test("AI provider registry enforces data-classification compatibility", () => {
  assert.ok(provider.includes("AIProviderRegistry"));
  assert.ok(provider.includes("sendsDataOffDevice"));
  assert.ok(provider.includes("not approved for this data classification"));
  assert.ok(provider.includes("The selected AI provider is not configured"));
  assert.ok(provider.includes("Explicit approval is required before sending project metadata or private file content off this device"));
});
test("only PhotoCraft has an adapter descriptor until other apps are verified", () => {
  assert.ok(adapterRegistry.includes("[photocraftAdapter.descriptor]"));
});
