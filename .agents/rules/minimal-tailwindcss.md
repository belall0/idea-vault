---
description: Apply strict minimal aesthetic and functional styling when writing Tailwind CSS.
trigger: model_decision
---

# Strictly Minimal Tailwind CSS

Apply the following minimal, functional aesthetics whenever writing or altering Tailwind CSS classes, particularly in React components.

## Core Aesthetics

- **Keep the design strictly minimal.** Focus ONLY on basic layout (`flex`, `grid`), spacing (`p-*`, `m-*`, `gap-*`), and typography (`text-*`, `font-*`).
- **Use functional borders.** Distinctly delineate interactive elements and containers using subtle borders (e.g., `border border-border`, `rounded`).
- **Use theme values, not hardcoded colors.** Always use semantic theme variables (e.g., `bg-background`, `text-foreground`, `bg-muted`, `text-muted-foreground`) instead of hardcoded colors (like `bg-white`, `text-gray-700`).
- **Limit primary colors.** Use primary theme colors (e.g., `bg-primary`, `text-primary-foreground`) ONLY for primary call-to-action (CTA) buttons.

## No Decorative Fluff

- **NO decorative utility classes.** Omit any class that does not directly contribute to usability, alignment, or reading structure.
- **NO non-essential hover effects.** Do NOT use `hover:` classes EXCEPT on buttons.
- **KEEP button hover states minimal.** For buttons, use subtle hover states (e.g., `hover:bg-accent`, `transition-colors`) to communicate functionality, or rely on component defaults (like Shadcn UI buttons).
- **NO visual effects.** Strictly avoid transitions, animations, or visual effects (`transition-all`, `duration-*`, `shadow-*`, `ring-*`, etc.) unless explicitly requested.

## Code Cleanliness

- **Keep component structure clean.** Avoid deep nesting and overly complex flex wrappers. A simple `flex flex-col gap-*` is often sufficient.
- **Minimize classes.** Apply only the absolute minimum classes required to achieve a structured and readable layout.

## Examples

### Good Example

```jsx
// Minimal and structured, uses theme variables, subtle borders, no fluff.
<div className="flex flex-col gap-4 rounded border border-border bg-background p-4">
  <h2 className="text-lg font-semibold text-foreground">Settings</h2>
  <p className="text-sm text-muted-foreground">Manage your account preferences.</p>
  <button className="rounded bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90">
    Save Changes
  </button>
</div>
```

### Bad Example

```jsx
// Hardcoded colors, overly decorative, unnecessary shadows, transitions on non-interactive elements.
<div className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow-lg transition-all duration-300 hover:scale-105 sm:flex-row">
  <h2 className="text-xl font-bold text-gray-800 drop-shadow-md">Settings</h2>
  <p className="text-base font-light tracking-wide text-gray-600">
    Manage your account preferences.
  </p>
  <div className="flex w-full justify-end">
    <button className="rounded-full bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-3 text-white transition-all hover:-translate-y-1 hover:shadow-xl">
      Save Changes
    </button>
  </div>
</div>
```
