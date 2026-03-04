---
name: feature-confirmed-working
enabled: true
event: prompt
conditions:
  - field: user_prompt
    operator: regex_match
    pattern: (?i)(working|works|confirmed|looks good|all good|it.*work|that.*work|perfect|done|ready|commit|push|update.*repo|update.*git)
---

## ✅ Feature Confirmed — Run the Docs + Repo Workflow

The user appears to have confirmed a feature is working. Follow this process:

**Step 1 — Update `lib/admin/docs-content.ts`**
- Identify which topic constant(s) need updating for this session's changes
- Update: headings, settings tables, block type counts, feature lists, terminology
- If a new block type or page type was added, add a new section
- Check for stale old-name references (e.g. "Triangle Overlay" should be "Section Into")

**Step 2 — Update `docs/` markdown files** (if relevant)
- `docs/SECTION_INTO.md` — if Section Into changed
- `docs/README_SECTIONS.md` — if section types changed
- `docs/CHANGELOG.md` — add a changelog entry
- `docs/SESSION_LOG.md` — add session entry

**Step 3 — Commit to git**
- Stage: all modified feature files + docs-content.ts + docs/*.md
- Commit message format: `feat: [short description of what was built]`
- Do NOT push unless user explicitly asks

**Topic → Feature mapping for this project:**

| What changed | Update this constant |
|-------------|---------------------|
| Section Into (shapes/image/hover) | `TAB_TRIANGLE` |
| New FLEXIBLE block type | `FLEXIBLE_ELEMENTS` + `SECTION_TYPES` |
| Animated background | `TAB_ANIMATION` + matching `ANIM_*` |
| Page types (designer/pdf/form) | `PAGES_SYSTEM` |
| Hero carousel settings | `HERO_CAROUSEL` |
| Spacing / padding | `TAB_SPACING` |
| Preview tab | `TAB_PREVIEW` |
