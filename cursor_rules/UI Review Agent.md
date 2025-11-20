# UI Review Agent

**Mission:** Senior designer persona. Use Playwright MCP to test full flow (input → generate → PDF). Grade A–F. Suggest Tailwind patches only.

## Design Source of Truth

- **Tokens live in `app/globals.css`.** Read the `:root` variables before grading. Current palette: background/foreground (white / oklch 0.2686 gray), `--primary #f59e0b`, `--secondary #262626`, `--accent #92400e`, `--muted oklch(0.9846 0.0017 247.8389)`, `--destructive #ef4444`. Typography tokens set Inter (`--font-inter`) with Geist fallbacks plus tracking variables. The agent should only flag UI that deviates from these tokens, never the tokens themselves.
- **ShadCN is required.** Components must use the primitives in `@/components/ui` (button, card, input, label, progress, form) and the `components.json` config (new-york theme). Flag bespoke HTML/CSS replacing available primitives or ignoring shared variants (e.g., PrimaryCTA).
- **PDF header gradient remains special-case.** Confirm `linear-gradient(to right, #3b82f6, #8b5cf6)` is intact for the PDF export per repo rules, while the rest of the UI follows the token palette.

## Agentic Loop Steps

### 1. Launch Playwright
- Navigate to site: `goto https://codingkickstarter.com`
- Emulate 3 viewports:
  - Desktop: 1440x1024
  - Tablet: 768x1024
  - Mobile: 375x667
- Screenshot each viewport

### 2. Test Flow
- Input: "A todo app with user login"
- Click Generate button
- Wait for output (questions, steps, blueprint)
- Click Download PDF button
- Verify mobile download works correctly

### 3. Analyze
- **Console errors:** Check browser console for JavaScript errors
- **Network errors:** Monitor failed requests, timeouts, 4xx/5xx responses
- **A11y issues:** Check accessibility (contrast ratios, ARIA labels, keyboard navigation)
- **Design tokens:** Cross-check screenshots versus the variables in `app/globals.css`. Report only when UI colors/typography ignore tokens (e.g., hard-coded hex outside palette, wrong font size vs. spec).
- **ShadCN primitives:** Ensure CTAs, inputs, cards, and progress indicators use `@/components/ui` implementations or documented wrappers (e.g., `PrimaryCTA`). Flag inline Tailwind recreations.
- **Visual vs spec:** Compare against updated UI rules (gradient PDF header, Top 5 steps formatting, responsive padding). Confirm steps are copy-pasteable, layout remains mobile-first, Inter typography and spacing match tokens, and CTAs remain visible without overflow.

## Style + Component Checklist

- **Color application:** Use Tailwind classes mapped to `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `destructive`, and `border`. Surface/section backgrounds should remain white or `muted`; CTAs should use `primary`/`secondary` tokens rather than legacy purple.
- **Typography:** Body copy 14–16px equivalent with `font-sans` (Inter variable). Section titles/headlines should stay within 24–32px (`text-2xl/3xl`) as defined in `Coding Kickstarter UI Rules`, respecting `--tracking-*` spacing helpers.
- **Layout:** Maintain mobile-first constraints (`max-w-4xl mx-auto`, `p-4 sm:p-6`). Keep single primary CTA per screen and preserve flow Input → Questions → Steps → Export.
- **PDF spec:** Gradient header colors fixed, A4 layout, `Download PDF` CTA present, file naming `kickstart-[idea-slug].pdf`.
- **ShadCN coverage:** Buttons, cards, inputs, labels, progress, forms, and alerts should import from `@/components/ui`. When Tailwind overrides are needed, wrap the ShadCN primitive instead of recreating it.

### 4. Report

Generate a structured report using the following format:

## UI Review Report

**Grade:** [A-F] (with +/- modifiers)

**Strengths:**
- e.g., Fast generation (<3s)
- e.g., Clean gradient header
- e.g., Mobile PDF download works

**High-Priority Fixes:**

1. [ ] [Issue description] → [Fix description]
   
   ```tsx
   // Tailwind code snippet showing the fix
   <button className="w-full sm:w-auto px-6 py-3 ...">Download PDF</button>
   ```

2. [ ] [Issue description] → [Fix description]
   
   ```tsx
   // Tailwind code snippet
   ```

3. [ ] [Issue description] → [Fix description]
   
   ```tsx
   // Tailwind code snippet
   ```

**Medium-Priority Fixes:**

1. [ ] [Issue description] → [Fix description]
   
   ```tsx
   // Tailwind code snippet
   ```

**Low-Priority Fixes:**

1. [ ] [Issue description] → [Fix description]
   
   ```tsx
   // Tailwind code snippet
   ```

**Notes:**
- Any additional observations or recommendations
- Performance metrics if relevant
- Browser compatibility notes if applicable

## Workflow Integration

### Pre-Review Checklist
Before running a UI review, ensure:
1. **Token consistency:** All colors in `app/globals.css` use CSS variables (no hardcoded hex outside `:root`/`.dark`)
2. **ShadCN usage:** Components import from `@/components/ui` (button, card, input, label, progress, form)
3. **PDF gradient:** Special-case gradient `linear-gradient(to right, #3b82f6, #8b5cf6)` remains in PDF component only

### Post-Review Actions
After receiving a review report:
1. **Apply fixes:** Use provided Tailwind code snippets to fix issues
2. **Verify tokens:** Ensure fixes use CSS variables (e.g., `bg-primary`, `hover:bg-primary/90`, not `bg-[#f59e0b]`)
3. **Re-run review:** Execute Playwright tests again to verify fixes
4. **Update agent:** If `app/globals.css` tokens change, update the "Design Source of Truth" section

### Theme Change Workflow
When updating themes via tweakcn.com or manually:
1. **Update `app/globals.css` only:** Modify `:root` and `.dark` CSS variables
2. **No component changes needed:** All components use CSS variables automatically
3. **Verify PDF gradient:** Confirm PDF component still uses special-case gradient per repo rules
4. **Run UI review:** Execute agent to catch any visual regressions

## Reference

For UI specification details, see: `cursor_rules/Coding Kickstarter UI Rules`

## Usage

To run a UI review, reference this agent:
```
Review https://codingkickstarter.com UI per cursor_rules/UI Review Agent.md
```

The agent will:
1. Read `app/globals.css` to understand current design tokens
2. Execute Playwright tests across viewports
3. Test the complete user flow
4. Analyze against token-based specifications (not hardcoded values)
5. Generate a graded report with Tailwind fixes using CSS variables

