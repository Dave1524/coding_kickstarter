# Theme Token Migration Summary

## Overview
Migrated all hardcoded colors to CSS variables in `app/globals.css`, ensuring the entire website can be themed by updating a single file.

## Changes Made

### 1. CSS Variables Added (`app/globals.css`)
- Added `--gradient-from` and `--gradient-to` variables for gradient support
- All colors now use CSS variables that can be updated via tweakcn.com or manually

### 2. Component Updates

#### `components/PrimaryCTA.tsx`
- Replaced `hover:bg-[#d97706]` with `hover:bg-primary/90` (uses CSS variable)

#### `app/page.tsx`
- Replaced gradient colors `from-[#f59e0b] to-[#fbbf24]` with `from-primary to-chart-1`
- Replaced all `hover:bg-[#d97706]` with `hover:bg-primary/90`
- All buttons now use theme tokens

#### `components/AIExpansionAlert.tsx`
- Replaced hardcoded blue colors (`bg-blue-50`, `border-blue-500`, `text-blue-800`, etc.) with theme tokens:
  - `bg-primary/10`, `border-primary`, `text-primary`, `text-muted-foreground`

#### `app/history/page.tsx`
- Replaced all `slate-*` colors with theme tokens:
  - `text-slate-900` → `text-foreground`
  - `text-slate-600` → `text-muted-foreground`
  - `bg-white` → `bg-card`
  - `border-slate-200` → `border-border`
  - `bg-slate-50` → `bg-muted`
- Replaced hardcoded indigo/pink colors with `text-primary` and `text-accent`
- Background gradient now uses `from-background via-muted/30 to-muted/50`

### 3. UI Review Agent Updates (`cursor_rules/UI Review Agent.md`)
- Added "Design Source of Truth" section that reads from `app/globals.css`
- Added "Workflow Integration" section with:
  - Pre-review checklist
  - Post-review actions
  - Theme change workflow
- Updated agent to check against CSS variables, not hardcoded values
- Enforced ShadCN component usage requirements

## Theme Change Workflow

### To Change Theme via tweakcn.com:
1. Export theme from tweakcn.com
2. Copy CSS variables to `app/globals.css` (`:root` and `.dark` sections)
3. No component changes needed - all components use CSS variables automatically
4. Run UI review agent to verify visual consistency

### To Change Theme Manually:
1. Edit `app/globals.css` only
2. Update `:root` variables for light mode
3. Update `.dark` variables for dark mode
4. All components will automatically reflect changes

## Special Cases

### PDF Component
- PDF header gradient (`linear-gradient(to right, #3b82f6, #8b5cf6)`) remains hardcoded per repo rules
- This is intentional as @react-pdf/renderer doesn't support CSS variables or gradients
- PDF colors are separate from web UI theme

## Verification

All components now use:
- `bg-primary`, `text-primary-foreground` instead of hardcoded hex
- `hover:bg-primary/90` instead of `hover:bg-[#d97706]`
- `text-foreground`, `text-muted-foreground` instead of `text-slate-*`
- `bg-card`, `border-border` instead of `bg-white`, `border-slate-*`
- Gradient colors use `from-primary to-chart-1` instead of hardcoded hex

## Next Steps

1. Test theme changes by updating `app/globals.css`
2. Run UI review agent to verify consistency
3. Consider adding gradient support variables if needed for future enhancements

