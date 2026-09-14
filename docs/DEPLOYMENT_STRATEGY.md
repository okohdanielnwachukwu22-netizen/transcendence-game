# Deployment strategy

TRANSCENDENCE uses GitHub as the source of truth, Netlify as the single production web delivery target, and Supabase as the persistent/realtime backend.

Vercel is intentionally not added as a second production deployment target right now. Netlify already provides the delivery path we need, while a second always-on deployment would add duplicate build activity and operational noise without improving the prototype.

A future Vercel project can be introduced for previews, isolated experiments, or a server workload when a concrete need appears. Production remains single-target until that need is demonstrated.