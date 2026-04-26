# Design System Document: The Invisible Shield

> **SoT:** UI·비주얼 결정 시 이 문서를 우선합니다. Cursor 규칙 `.cursor/rules/design.mdc`는 여기로 연결됩니다.

# Custom Design System (based on Spotify)

## 1. Visual Theme & Atmosphere

Spotify's web interface is a dark, immersive music player that wraps listeners in a near-black cocoon (`#121212`, `#181818`, `#1f1f1f`) where album art and content become the primary source of color. The design philosophy is "content-first darkness" — the UI recedes into shadow so that music, podcasts, and playlists can glow. Every surface is a shade of charcoal, creating a theater-like environment where the only true color comes from the iconic Spotify Green (`#1ed760`) and the album artwork itself.

The typography uses SpotifyMixUI and SpotifyMixUITitle — proprietary fonts from the CircularSp family (Circular by Lineto, customized for Spotify) with an extensive fallback stack that includes Arabic, Hebrew, Cyrillic, Greek, Devanagari, and CJK fonts, reflecting Spotify's global reach. The type system is compact and functional: 700 (bold) for emphasis and navigation, 600 (semibold) for secondary emphasis, and 400 (regular) for body. Buttons use uppercase with positive letter-spacing (1.4px–2px) for a systematic, label-like quality.

What distinguishes Spotify is its pill-and-circle geometry. Primary buttons use 500px–9999px radius (full pill), circular play buttons use 50% radius, and search inputs are 500px pills. Combined with heavy shadows (`rgba(0,0,0,0.5) 0px 8px 24px`) on elevated elements and a unique inset border-shadow combo (`rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset`), the result is an interface that feels like a premium audio device — tactile, rounded, and built for touch.

**Key Characteristics:**

- Near-black immersive dark theme (`#121212`–`#1f1f1f`) — UI disappears behind content
- Spotify Green (`#1ed760`) as singular brand accent — never decorative, always functional
- SpotifyMixUI/CircularSp font family with global script support
- Pill buttons (500px–9999px) and circular controls (50%) — rounded, touch-optimized
- Uppercase button labels with wide letter-spacing (1.4px–2px)
- Heavy shadows on elevated elements (`rgba(0,0,0,0.5) 0px 8px 24px`)
- Semantic colors: negative red (`#f3727f`), warning orange (`#ffa42b`), announcement blue (`#539df5`)
- Album art as the primary color source — the UI is achromatic by design

## 2. Color Palette & Roles

### Primary Brand

- **Spotify Green** (`#1ed760`): Primary brand accent — play buttons, active states, CTAs
- **Near Black** (`#121212`): Deepest background surface
- **Dark Surface** (`#181818`): Cards, containers, elevated surfaces
- **Mid Dark** (`#1f1f1f`): Button backgrounds, interactive surfaces

### Text

- **White** (`#ffffff`): `--text-base`, primary text
- **Silver** (`#b3b3b3`): Secondary text, muted labels, inactive nav
- **Near White** (`#cbcbcb`): Slightly brighter secondary text
- **Light** (`#fdfdfd`): Near-pure white for maximum emphasis

### Semantic

- **Negative Red** (`#f3727f`): `--text-negative`, error states
- **Warning Orange** (`#ffa42b`): `--text-warning`, warning states
- **Announcement Blue** (`#539df5`): `--text-announcement`, info states

### Surface & Border

- **Dark Card** (`#252525`): Elevated card surface
- **Mid Card** (`#272727`): Alternate card surface
- **Border Gray** (`#4d4d4d`): Button borders on dark
- **Light Border** (`#7c7c7c`): Outlined button borders, muted links
- **Separator** (`#b3b3b3`): Divider lines
- **Light Surface** (`#eeeeee`): Light-mode buttons (rare)
- **Spotify Green Border** (`#1db954`): Green accent border variant

### Shadows

- **Heavy** (`rgba(0,0,0,0.5) 0px 8px 24px`): Dialogs, menus, elevated panels
- **Medium** (`rgba(0,0,0,0.3) 0px 8px 8px`): Cards, dropdowns
- **Inset Border** (`rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset`): Input border-shadow combo

## 3. Typography Rules

### Font Families

- **Title**: `SpotifyMixUITitle`, fallbacks: `CircularSp-Arab, CircularSp-Hebr, CircularSp-Cyrl, CircularSp-Grek, CircularSp-Deva, Helvetica Neue, helvetica, arial, Hiragino Sans, Hiragino Kaku Gothic ProN, Meiryo, MS Gothic`
- **UI / Body**: `SpotifyMixUI`, same fallback stack

### Hierarchy

| Role             | Font              | Size             | Weight  | Line Height  | Letter Spacing | Notes                        |
| ---------------- | ----------------- | ---------------- | ------- | ------------ | -------------- | ---------------------------- |
| Section Title    | SpotifyMixUITitle | 24px (1.50rem)   | 700     | normal       | normal         | Bold title weight            |
| Feature Heading  | SpotifyMixUI      | 18px (1.13rem)   | 600     | 1.30 (tight) | normal         | Semibold section heads       |
| Body Bold        | SpotifyMixUI      | 16px (1.00rem)   | 700     | normal       | normal         | Emphasized text              |
| Body             | SpotifyMixUI      | 16px (1.00rem)   | 400     | normal       | normal         | Standard body                |
| Button Uppercase | SpotifyMixUI      | 14px (0.88rem)   | 600–700 | 1.00 (tight) | 1.4px–2px      | `text-transform: uppercase`  |
| Button           | SpotifyMixUI      | 14px (0.88rem)   | 700     | normal       | 0.14px         | Standard button              |
| Nav Link Bold    | SpotifyMixUI      | 14px (0.88rem)   | 700     | normal       | normal         | Navigation                   |
| Nav Link         | SpotifyMixUI      | 14px (0.88rem)   | 400     | normal       | normal         | Inactive nav                 |
| Caption Bold     | SpotifyMixUI      | 14px (0.88rem)   | 700     | 1.50–1.54    | normal         | Bold metadata                |
| Caption          | SpotifyMixUI      | 14px (0.88rem)   | 400     | normal       | normal         | Metadata                     |
| Small Bold       | SpotifyMixUI      | 12px (0.75rem)   | 700     | 1.50         | normal         | Tags, counts                 |
| Small            | SpotifyMixUI      | 12px (0.75rem)   | 400     | normal       | normal         | Fine print                   |
| Badge            | SpotifyMixUI      | 10.5px (0.66rem) | 600     | 1.33         | normal         | `text-transform: capitalize` |
| Micro            | SpotifyMixUI      | 10px (0.63rem)   | 400     | normal       | normal         | Smallest text                |

### Principles

- **Bold/regular binary**: Most text is either 700 (bold) or 400 (regular), with 600 used sparingly. This creates a clear visual hierarchy through weight contrast rather than size variation.
- **Uppercase buttons as system**: Button labels use uppercase + wide letter-spacing (1.4px–2px), creating a systematic "label" voice distinct from content text.
- **Compact sizing**: The range is 10px–24px — narrower than most systems. Spotify's type is compact and functional, designed for scanning playlists, not reading articles.
- **Global script support**: The extensive fallback stack (Arabic, Hebrew, Cyrillic, Greek, Devanagari, CJK) reflects Spotify's 180+ market reach.

## 4. Component Stylings

### Buttons

- Style: Sharp & Precise -- minimal rounding, decisive geometric edges
- Radius: 4px across primary, secondary, and ghost variants
- Padding: 8px 16px (default), 6px 12px (compact), 12px 20px (comfortable)
- Primary: solid primary background, foreground contrast text, 1px solid primary border
- Secondary: transparent/neutral background, foreground text, 1px solid border color
- Ghost: transparent background, primary text, no border until hover
- Hover: primary darkens ~10%, secondary gains subtle border-color bump
- Font weight: 500-600 for CTA text clarity

### Cards & Containers

- Background: `#181818` or `#1f1f1f`
- Radius: 500px–8px
- No visible borders on most cards
- Hover: slight background lightening
- Shadow: `rgba(0,0,0,0.3) 0px 8px 8px` on elevated

### Inputs

- Search input: `#1f1f1f` background, `#ffffff` text
- Radius: 500px (pill)
- Padding: 12px 96px 12px 48px (icon-aware)
- Focus: border becomes `#000000`, outline `1px solid`

### Navigation

- Style: Solid & Bold -- solid dark background (foreground color), high contrast
- Light text on dark header surface, clear visual separation from content
- CTA button uses primary color or inverted colors
- Mobile: hamburger menu collapse

## 5. Layout Principles

### Spacing System

- Base unit: 8px
- Scale: 1px, 2px, 3px, 4px, 5px, 6px, 8px, 10px, 12px, 14px, 15px, 16px, 20px

### Grid & Container

- Sidebar (fixed) + main content area
- Grid-based album/playlist cards
- Full-width now-playing bar at bottom
- Responsive content area fills remaining space

### Whitespace Philosophy

- **Dark compression**: Spotify packs content densely — playlist grids, track lists, and navigation are all tightly spaced. The dark background provides visual rest between elements without needing large gaps.
- **Content density over breathing room**: This is an app, not a marketing site. Every pixel serves the listening experience.

### Border Radius Scale

- Minimal (2px): Badges, explicit tags
- Subtle (4px): Inputs, small elements
- Standard (6px): Album art containers, cards
- Comfortable (8px): Sections, dialogs
- Medium (10px–20px): Panels, overlay elements
- Large (100px): Large pill buttons
- Pill (500px): Primary buttons, search input
- Full Pill (9999px): Navigation pills, search
- Circle (50%): Play buttons, avatars, icons

## 6. Depth & Elevation

| Level              | Treatment                                                           | Use                            |
| ------------------ | ------------------------------------------------------------------- | ------------------------------ |
| Base (Level 0)     | `#121212` background                                                | Deepest layer, page background |
| Surface (Level 1)  | `#181818` or `#1f1f1f`                                              | Cards, sidebar, containers     |
| Elevated (Level 2) | `rgba(0,0,0,0.3) 0px 8px 8px`                                       | Dropdown menus, hover cards    |
| Dialog (Level 3)   | `rgba(0,0,0,0.5) 0px 8px 24px`                                      | Modals, overlays, menus        |
| Inset (Border)     | `rgb(18,18,18) 0px 1px 0px, rgb(124,124,124) 0px 0px 0px 1px inset` | Input borders                  |

**Shadow Philosophy**: Spotify uses notably heavy shadows for a dark-themed app. The 0.5 opacity shadow at 24px blur creates a dramatic "floating in darkness" effect for dialogs and menus, while the 0.3 opacity at 8px blur provides a more subtle card lift. The unique inset border-shadow combination on inputs creates a recessed, tactile quality.

## 7. Do's and Don'ts

### Do

- Use near-black backgrounds (`#121212`–`#1f1f1f`) — depth through shade variation
- Apply Spotify Green (`#1ed760`) only for play controls, active states, and primary CTAs
- Use pill shape (500px–9999px) for all buttons — circular (50%) for play controls
- Apply uppercase + wide letter-spacing (1.4px–2px) on button labels
- Keep typography compact (10px–24px range) — this is an app, not a magazine
- Use heavy shadows (`0.3–0.5 opacity`) for elevated elements on dark backgrounds
- Let album art provide color — the UI itself is achromatic

### Don't

- Don't use Spotify Green decoratively or on backgrounds — it's functional only
- Don't use light backgrounds for primary surfaces — the dark immersion is core
- Don't skip the pill/circle geometry on buttons — square buttons break the identity
- Don't use thin/subtle shadows — on dark backgrounds, shadows need to be heavy to be visible
- Don't add additional brand colors — green + achromatic grays is the complete palette
- Don't use relaxed line-heights — Spotify's typography is compact and dense
- Don't expose raw gray borders — use shadow-based or inset borders instead

## 8. Responsive Behavior

### Breakpoints

| Name          | Width       | Key Changes           |
| ------------- | ----------- | --------------------- |
| Mobile Small  | <425px      | Compact mobile layout |
| Mobile        | 425–576px   | Standard mobile       |
| Tablet        | 576–768px   | 2-column grid         |
| Tablet Large  | 768–896px   | Expanded layout       |
| Desktop Small | 896–1024px  | Sidebar visible       |
| Desktop       | 1024–1280px | Full desktop layout   |
| Large Desktop | >1280px     | Expanded grid         |

### Collapsing Strategy

- Sidebar: full → collapsed → hidden
- Album grid: 5 columns → 3 → 2 → 1
- Now-playing bar: maintained at all sizes
- Search: pill input maintained, width adjusts
- Navigation: sidebar → bottom bar on mobile

## 9. Agent Prompt Guide

### Quick Color Reference

- Background: Near Black (`#121212`)
- Surface: Dark Card (`#181818`)
- Text: White (`#ffffff`)
- Secondary text: Silver (`#b3b3b3`)
- Accent: Spotify Green (`#1ed760`)
- Border: `#4d4d4d`
- Error: Negative Red (`#f3727f`)

### Example Component Prompts

- "Create a dark card: #181818 background, 8px radius. Title at 16px SpotifyMixUI weight 700, white text. Subtitle at 14px weight 400, #b3b3b3. Shadow rgba(0,0,0,0.3) 0px 8px 8px on hover."
- "Design a pill button: #1f1f1f background, white text, 9999px radius, 8px 16px padding. 14px SpotifyMixUI weight 700, uppercase, letter-spacing 1.4px."
- "Build a circular play button: Spotify Green (#1ed760) background, #000000 icon, 50% radius, 12px padding."
- "Create search input: #1f1f1f background, white text, 500px radius, 12px 48px padding. Inset border: rgb(124,124,124) 0px 0px 0px 1px inset."
- "Design navigation sidebar: #121212 background. Active items: 14px weight 700, white. Inactive: 14px weight 400, #b3b3b3."

### Iteration Guide

1. Start with #121212 — everything lives in near-black darkness
2. Spotify Green for functional highlights only (play, active, CTA)
3. Pill everything — 500px for large, 9999px for small, 50% for circular
4. Uppercase + wide tracking on buttons — the systematic label voice
5. Heavy shadows (0.3–0.5 opacity) for elevation — light shadows are invisible on dark
6. Album art provides all the color — the UI stays achromatic

---

## Included Components

The following components are part of this design system:

- Button
- Input
- Table
- Card
- Badge
- Tabs
- Dialog

---

## Dark Mode Tokens

Dark mode is enabled for this design system. When the `.dark` class is present
on any ancestor (typically `<html>` or `<body>`), the following tokens replace
the light-mode values. Hue is derived from the primary color so shadows and
neutrals stay on-brand.

| Token      | Light              | Dark                                               |
| ---------- | ------------------ | -------------------------------------------------- |
| Background | page surface color | `#0f1511` (primary-tinted near-black)              |
| Foreground | text color         | `#fafafa`                                          |
| Border     | hairline divider   | `#29322d`                                          |
| Muted      | subdued surface    | `#222a25`                                          |
| Primary    | #1ed760            | #1ed760 (unchanged — brand anchor is theme-stable) |

### Implementation Guidance

- Use CSS custom properties for every color; never hard-code hex in components.
- Scope dark tokens under `.dark` (shadcn/Tailwind convention) or a media
  query (`prefers-color-scheme: dark`), not both — pick one source of truth.
- Run a contrast audit after applying dark tokens: body text and interactive
  elements must hit WCAG AA (4.5:1) against the dark background.
- Shadows: lighten and reduce opacity in dark mode. A shadow that reads clearly
  on white often disappears entirely on a near-black surface.
- Images and illustrations: supply a dark variant or apply a subtle overlay.
  Transparent PNGs with dark silhouettes will vanish on dark backgrounds.

---

## Iconography & SVG Guidelines

### Icon Library

Use a single, consistent icon library throughout the project. Recommended options:

- **Lucide React** (`lucide-react`): Default for shadcn/ui projects. 1,400+ icons, tree-shakeable, consistent 24x24 grid.
- **Radix Icons** (`@radix-ui/react-icons`): 300+ icons, 15x15 grid, minimal and geometric.
- **Heroicons** (`@heroicons/react`): 300+ icons by Tailwind team, outline and solid variants.

Pick ONE library and use it everywhere. Do not mix icon libraries within the same project.

### SVG Usage Rules

- All icons must be inline SVG components (not `<img>` tags) for color and size control.
- Icon size follows the type scale: 16px (inline), 20px (buttons), 24px (standalone).
- Icon color inherits from `currentColor` -- never hard-code fill/stroke colors.
- For custom/brand icons, export as SVG components with `currentColor` fills.
- Stroke width: 1.5px-2px for outline icons. Keep consistent across the project.

### Icon Sizing Scale

| Context     | Size            | Usage                       |
| ----------- | --------------- | --------------------------- |
| Inline text | 16px (1rem)     | Badges, labels, breadcrumbs |
| Button icon | 18px (1.125rem) | Icon buttons, CTA icons     |
| Standalone  | 24px (1.5rem)   | Navigation, card icons      |
| Feature     | 32-48px         | Hero sections, empty states |

### SVG Optimization

- Run all custom SVGs through SVGO before committing.
- Remove unnecessary attributes: `xmlns`, `xml:space`, editor metadata.
- Use `viewBox` instead of fixed `width`/`height` for scalability.

---

## Document Policies

### No Emojis

This design system must not use emojis in any UI element, component, label, status indicator, or documentation.
Use SVG icons from the chosen icon library instead. Emojis render inconsistently across platforms and break visual coherence.

- Status indicators: use colored dots or icon components, not emoji.
- Section markers: use text prefixes ("DO:" / "DON'T:") or icons, not checkmark/cross emojis.
- Navigation: use icon components, not emoji.

### Format Compliance

This document follows the Google Stitch DESIGN.md 9-section format:

1. Visual Theme & Atmosphere
2. Color Palette & Roles
3. Typography Rules
4. Component Stylings
5. Layout Principles
6. Depth & Elevation
7. Do's and Don'ts
8. Responsive Behavior
9. Agent Prompt Guide

Extended with:

- Iconography & SVG Guidelines
- Document Policies

Total target length: 250-400 lines. Keep sections concise and actionable.
