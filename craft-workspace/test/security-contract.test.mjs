import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../supabase/migrations/202610150001_workspace_foundation.sql", import.meta.url), "utf8");

test("draft cloud tables enable RLS and only grant application access to authenticated users", () => {
  for (const table of ["workspace_projects", "workspace_assets", "workspace_activity"]) {
    assert.ok(migration.includes("alter table public." + table + " enable row level security"), table + " must enable RLS");
    assert.ok(migration.includes("grant select, insert"), table + " needs intentional authenticated grants");
  }
  assert.ok(migration.includes("to authenticated"));
  assert.ok(migration.includes("revoke all on public.workspace_assets from anon, public"));
});

test("asset and activity links check that the user owns the project", () => {
  assert.ok(migration.includes("where p.id = workspace_assets.project_id and p.owner_id = (select auth.uid())"));
  assert.ok(migration.includes("where p.id = workspace_activity.project_id and p.owner_id = (select auth.uid())"));
});
