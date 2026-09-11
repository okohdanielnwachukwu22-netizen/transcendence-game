# Development Rules

1. Do not hard-code secrets, Supabase service-role keys, or credentials.
2. Client-side Supabase keys must use public/anonymous credentials only; privileged operations belong server-side.
3. Multiplayer authority belongs to the server, not the browser.
4. Separate content/data from game logic.
5. Keep deterministic seeds for fairness-sensitive procedural outcomes.
6. Preserve permanent mission failures and consequences as explicit state, not UI-only flags.
7. God and higher stages must not depend on ordinary level arithmetic.
8. Do not make Damien mandatory for every player's identity or progression.
9. Every major feature needs a playable test path before being marked complete.
10. Optimize for low-end devices and mobile browsers from the beginning.
