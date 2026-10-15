# Supabase migration draft

The SQL under migrations/ is a draft for a future authenticated shared-workspace layer. It has not been applied.

Before use, choose a dedicated Craft Workspace Supabase project and verify the billable plan, organization, region, Data API settings and authentication setup. The currently linked project is named TRANSCENDENCE and is unrelated to this workspace, so it was left unchanged.

The draft creates project, asset-metadata and activity tables with row-level security and owner-bound policies. It does not create a public storage bucket, upload files, configure auth providers, or contain API keys. Asset bytes require a private storage bucket and its own tested policies; do not store file contents in Postgres rows.
