## Plan

### Goal
Make the main sidebar categories visually easier to tell apart, and move **CRM / Sales** into the **Business** category.

### Changes

1. **Update `src/lib/sectionNav.ts`**
   - Change `category` for the **CRM / Sales** section from `"Resident Care"` to `"Business"`.
   - No other section labels, icons, or tab structures are changed.

2. **Update `src/components/shell/AppSidebar.tsx`**
   - Keep the **Dashboard** item standalone at the top.
   - Add a subtle horizontal divider above each category group using the existing sidebar-border token at low opacity (`border-sidebar-border/40`).
   - Increase the outer spacing between category groups so each block feels like its own section.
   - Give the category labels slightly more vertical padding (`pt-3 pb-1.5`) so they sit cleanly above their items.
   - No new colors, icons, or layout changes outside the sidebar.

### Verification
- Confirm the sidebar still highlights the active route correctly.
- Confirm **CRM / Sales** now appears under **Business** instead of **Resident Care**.
- Confirm the dividers and spacing are visible in both light and dark themes without breaking the existing compact density.

### Files changed
- `src/lib/sectionNav.ts`
- `src/components/shell/AppSidebar.tsx`