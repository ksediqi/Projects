# CSS Audit — `portfolio.css` & `style.css`

## Summary

Both files are large and partially overlap. Issues fall into four categories:
**duplicate variables**, **conflicting variable values**, **unused/dead variables**, and **duplicate selectors/rules**.

---

## 1. Duplicate & Conflicting CSS Variables

### `--radius-sm / --radius-md / --radius-lg` — defined THREE times across the two files

| Location | `--radius-sm` | `--radius-md` | `--radius-lg` |
|---|---|---|---|
| `style.css` `:root` block 1 (L37–39) | `4px` | `8px` | `16px` |
| `style.css` `:root` block 2 (L147–149) | `0.25rem` (4px) | `0.5rem` (8px) | `1rem` (16px) |
| `portfolio.css` `:root` (L29–31) | `8px` | `14px` | `22px` |

> **Problem**: `portfolio.css` declares completely different values (`8px`, `14px`, `22px`) vs. `style.css` (`4px`, `8px`, `16px`). Since `style.css` is likely loaded last (or vice versa), one file silently overwrites the other. The `portfolio.css` values are effectively dead or they create unpredictable results depending on load order.

---

### `--font-body` — declared twice with different stacks

| Location | Value |
|---|---|
| `style.css` `:root` block 1 (L50) | `"Segoe UI", sans-serif` |
| `style.css` `:root` block 2 (L171) | `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` |
| `portfolio.css` `:root` (L26) | `'Inter', sans-serif` |

> **Problem**: Three different font stacks for `--font-body`. `portfolio.css` sets it to Inter, but `style.css` overrides it with Segoe UI. One wins silently.

---

### `--font-display` — declared twice with completely different fonts

| Location | Value |
|---|---|
| `style.css` block 2 (L170) | `'Staatliches', 'Playfair Display', Georgia, serif` |
| `portfolio.css` (L25) | `'Space Grotesk', 'Inter', sans-serif` |

> **Problem**: These are completely different fonts. One declaration silently kills the other.

---

### `--font-mono` — declared twice with different stacks

| Location | Value |
|---|---|
| `portfolio.css` (L27) | `'JetBrains Mono', 'SFMono-Regular', Consolas, monospace` |
| `style.css` block 2 (L172) | `'DM Mono', 'JetBrains Mono', ui-monospace, monospace` |

---

### `--nav-h` vs `--size-header` vs `--header-height` — same concept, 3 names

| Variable | File | Value |
|---|---|---|
| `--nav-h` | `portfolio.css` (L32) | `68px` |
| `--header-height` | `style.css` block 1 (L54) | `68px` |
| `--size-header` | `style.css` block 2 (L140) | `4.25rem (68px)` |
| `--size-header-sticky` | `style.css` block 2 (L144) | `4.25rem (68px)` |

> **Problem**: Four variables, same value, same concept. `style.css` even calls out the problem in a comment (L122–138) but `portfolio.css` still defines its own `--nav-h`. Only `--size-header` is actually used in the responsive styles.

---

### `--container-w` vs `--container-width` vs `--size-content-max`

| Variable | File | Value |
|---|---|---|
| `--container-w` | `portfolio.css` (L33) | `1180px` |
| `--container-width` | `style.css` block 1 (L55) | `1200px` |
| `--size-content-max` | `style.css` block 2 (L142) | `75rem (1200px)` |

> **Problem**: Three variable names, two different widths (`1180px` vs `1200px`). Components using `--container-w` will be 20px narrower than those using `--size-content-max`.

---

### `--ease` vs `--ease-out` — both used in `portfolio.css`

| Variable | File | Value |
|---|---|---|
| `--ease` | `portfolio.css` (L35) | `cubic-bezier(.22, .61, .36, 1)` |
| `--ease-out` | `style.css` (L193) | `cubic-bezier(0.4, 0, 0.2, 1)` |

> `portfolio.css` defines and uses `--ease`, but `style.css` never defines it — it defines `--ease-out`. `--ease` from `portfolio.css` references a spring-like curve while `--ease-out` in `style.css` is a standard ease-out. Both are fine individually but having two "default ease" tokens is confusing.

---

### `--space-xs/sm/md/lg/xl` vs `--space-1` through `--space-12` — duplicate spacing scales

| Variables | File |
|---|---|
| `--space-xs`, `--space-sm`, `--space-md`, `--space-lg`, `--space-xl` | `style.css` block 1 (L42–46) |
| `--space-1` through `--space-12` | `style.css` block 2 (L110–119) |

> **Problem**: Two competing spacing scales in the same file. `--space-lg` = `2rem` (block 1) conflicts with `--space-6` = `2rem`. Mixed usage makes refactoring hard.

---

### `--shadow-sm / --shadow-md / --shadow-lg` vs `--shadow-1 / --shadow-2 / --shadow-3`

| Variables | File |
|---|---|
| `--shadow-sm`, `--shadow-md`, `--shadow-lg` | `style.css` block 1 (L32–34) |
| `--shadow-1`, `--shadow-2`, `--shadow-3` | `style.css` block 2 (L158–160) |

> Two shadow scales in the same file. `.feature-card` uses `--shadow-lg` (block 1); `.btn` uses `--shadow-2` (block 2). No consistency.

---

## 2. Unused / Dead Variables in `portfolio.css`

These are defined in `portfolio.css`'s `:root` but appear to be superseded or never referenced in a meaningful way:

| Variable | Reason |
|---|---|
| `--bg`, `--bg-alt`, `--panel`, `--panel-2` (L3–6) | Dark-theme raw colours. `style.css` uses `--color-bg`, `--color-surface`, etc. These portfolio tokens are used in a few places but create a parallel naming system. |
| `--border`, `--border-soft` (L7–8) | Same issue — `style.css` uses `--color-border` / `--color-border-subtle`. `portfolio.css` mixes both. |
| `--text`, `--text-dim`, `--text-faint` (L10–12) | Parallel to `style.css`'s `--color-text` / `--color-text-muted`. Both sets are used in `portfolio.css`, creating inconsistency. |
| `--cyan`, `--cyan-dim`, `--violet`, `--violet-dim`, `--amber`, `--amber-dim`, `--rose`, `--rose-dim`, `--green`, `--green-dim` (L14–23) | Used only in the skills section's `.skill-icon` variants. Could be inlined or folded into the theme system. |
| `--nav-h` (L32) | Duplicate of `--size-header`. Only referenced in `scroll-hr` via `--dur-base` — actually the scroll-hr uses `--color-accent` not the nav height. `--nav-h` appears to be unused. |
| `--container-w` (L33) | Likely unused — components use `--size-content-max` or hardcoded widths. |

---

## 3. Duplicate Selectors / Rules

### `.hidden` — declared in BOTH files

- `portfolio.css` L162–164: `.hidden { display: none; }`
- `style.css` L905–907: `.hidden { display: none; }`

> Identical. One is redundant.

---

### `.code-window` — declared TWICE in `portfolio.css`

- `portfolio.css` L826–832: First definition (border, border-radius, color)
- `portfolio.css` L2777–2785: Second definition (completely different styles — glassmorphism dark background, bigger border-radius)

> **These two rules fight each other.** The second one (L2777) overwrites the first. The first definition (L826) is effectively dead for any `.code-window` not inside `.portfolio-header`.

---

### `.code-titlebar` — declared TWICE in `portfolio.css`

- `portfolio.css` L842–848: First definition
- `portfolio.css` L2787–2794: Second definition with different padding and background

> Same problem as `.code-window` above — the second overwrites the first.

---

### `.status-dot` — declared THREE times across both files

- `style.css` L506–513: Has background-color, box-shadow, animation
- `style.css` L1774–1779: Redeclared with no background (just dimensions and border-radius)
- `portfolio.css` L2761–2768: Third definition with different size (8px vs 10px) and hardcoded color `#22c55e`

> The three definitions cascade in unpredictable ways. Only one should exist.

---

### `.info-badge` — declared TWICE in `style.css`

- `style.css` L478–488: Glassmorphism floating badge (hero section context)
- `style.css` L1713–1720: Accordion item (completely different component)

> These are two visually different components sharing one class name. They partially overwrite each other.

---

### `.info-button` — declared TWICE in `style.css`

- `style.css` L490–504: Terminal-style inline button
- `style.css` L1731–1745: Accordion trigger button with `justify-content: space-between`

> Same class, two different components — they fight each other.

---

### `.import-info p` — declared TWICE in `style.css`

- `style.css` L541–547: `font-size: .85rem`, max-width, color
- `style.css` L1758–1764: `font-size: 0.9rem`, `text-align: left`, different color

---

## 4. Typo

- `portfolio.css` L602: `.section-heading { mmargin-bottom: 48px; }` — double `m` typo, so this `margin-bottom` is ignored entirely.

---

## Recommended Actions (Priority Order)

1. **[CRITICAL] Merge the two `:root` blocks in `style.css`** — remove the first block (L1–59) or merge it into the second (L108+). Eliminate `--shadow-sm/md/lg` in favour of `--shadow-1/2/3`, and `--space-xs/sm/md/lg/xl` in favour of `--space-1` through `--space-12`.

2. **[CRITICAL] Resolve the radius collision** — pick one value set. The `portfolio.css` values (`8px`, `14px`, `22px`) are clearly intentional for the portfolio design; move them to a `--porto-radius-*` namespace or override in a scoped selector.

3. **[HIGH] Remove `portfolio.css`'s own `:root` block** — move the needed porto-specific tokens (`--porto-*`) into `style.css`'s single `:root`, and delete the duplicated font/radius/nav tokens.

4. **[HIGH] Fix the two `.code-window` and `.code-titlebar` collisions** in `portfolio.css` — either merge or scope the second set under a parent selector.

5. **[HIGH] Fix `.status-dot`** — consolidate into one definition.

6. **[MEDIUM] Rename `.info-badge` and `.info-button`** — the hero floating badge and accordion item need distinct class names (e.g. `.hero-badge` vs `.accordion-item`).

7. **[LOW] Remove the `.hidden` duplicate** from `portfolio.css`.

8. **[LOW] Fix the `mmargin-bottom` typo** on `.section-heading` (L602, `portfolio.css`).

9. **[LOW] Remove unused variables**: `--nav-h`, `--container-w`, `--bg`, `--bg-alt`, `--panel`, `--panel-2`, `--border`, `--border-soft` from `portfolio.css`.
