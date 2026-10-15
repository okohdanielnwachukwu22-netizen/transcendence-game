import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { isAllowedOrigin, isWithinRoot, safeRelativePath, buildMcpArgs } from "./server.mjs";

test("accepts only explicitly configured origins", () => {
  const origins = new Set(["https://craft-workspace.vercel.app", "http://localhost:5173"]);
  assert.equal(isAllowedOrigin("https://craft-workspace.vercel.app", origins), true);
  assert.equal(isAllowedOrigin("http://evil.example", origins), false);
  assert.equal(isAllowedOrigin(undefined, origins), false);
});

test("root boundary compares complete path segments", () => {
  const root = path.resolve("/tmp/craft-approved");
  assert.equal(isWithinRoot(root, path.join(root, "image.psd")), true);
  assert.equal(isWithinRoot(root, path.join(root, "sub", "image.psd")), true);
  assert.equal(isWithinRoot(root, path.resolve("/tmp/craft-approved-escape", "x.psd")), false);
  assert.equal(isWithinRoot(root, path.resolve(root, "..", "private.psd")), false);
});

test("relative path checker refuses absolute and traversal paths", () => {
  assert.equal(safeRelativePath("photo.psd"), "photo.psd");
  assert.equal(safeRelativePath("campaign/input.psd"), "campaign/input.psd");
  assert.throws(() => safeRelativePath("../secret.psd"));
  assert.throws(() => safeRelativePath("C:\\\\private\\\\secret.psd"));
  assert.throws(() => safeRelativePath("/etc/passwd"));
});

test("MCP CLI is invoked with only explicit roots and no shell argument", () => {
  assert.deepEqual(buildMcpArgs("/approved"), ["mcp", "--automation-read-root", "/approved"]);
  assert.deepEqual(buildMcpArgs("/approved", "/approved/out"), ["mcp", "--automation-read-root", "/approved", "--automation-write-root", "/approved/out"]);
});
