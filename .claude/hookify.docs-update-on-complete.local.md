---
name: docs-update-on-complete
enabled: true
event: stop
pattern: .*
---

## 📚 Docs & Repo Update Checklist

Before stopping, check whether any features were built or changed this session.

**If YES — run this checklist in order:**

1. **Update `lib/admin/docs-content.ts`**
   - Find the topic constant(s) matching the changed feature (e.g. `TAB_TRIANGLE`, `FLEXIBLE_ELEMENTS`, `PAGES_SYSTEM`, etc.)
   - Update heading, description, settings tables, and any feature lists to reflect the current state
   - Rename any old terminology (e.g. "Triangle Overlay" → "Section Into")
   - If a whole new feature was added, create a new `const TOPIC_NAME` and wire it into the navigation tree

2. **Wait for user confirmation** that the feature works as expected before committing

3. **Commit to git** once user confirms:
   - Stage all modified files (components, types, lib, docs-content.ts, docs/*.md)
   - Use a descriptive conventional commit message: `feat:`, `fix:`, `docs:`, etc.
   - Do NOT push unless user explicitly asks

**Topics in `lib/admin/docs-content.ts` to keep in sync with features:**

| Topic Constant | Covers |
|----------------|--------|
| `TAB_TRIANGLE` | Section Into tab — shapes, gradients, image fill, hover text |
| `FLEXIBLE_ELEMENTS` | All 11 block types including ISP Price Card |
| `FLEXIBLE_OVERVIEW` | Content modes, designer usage |
| `FLEXIBLE_STYLING` | Effects, backgrounds, styling options |
| `FLEXIBLE_ANIMATIONS` | AnimBg integration |
| `TAB_ANIMATION` | Animated backgrounds tab |
| `SECTION_TYPES` | Section type comparison table |
| `PAGES_SYSTEM` | Designer / PDF / Form / Full page types |
| `HERO_CAROUSEL` | Slide settings, mobile media |
| `ANIM_*` constants | Each animated background type |

**If NO features changed** (e.g. investigation-only session) — skip this checklist.
