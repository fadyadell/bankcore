---
name: Executive Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#4d556b'
  on-tertiary: '#ffffff'
  tertiary-container: '#656d84'
  on-tertiary-container: '#eef0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  slate-50: '#F8FAFC'
  slate-100: '#F1F5F9'
  slate-800: '#1E293B'
  slate-900: '#0F172A'
  success-emerald: '#10B981'
  warning-amber: '#F59E0B'
  error-rose: '#E11D48'
  chart-1: '#3B82F6'
  chart-2: '#8B5CF6'
  chart-3: '#EC4899'
  chart-4: '#F97316'
  chart-5: '#10B981'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for a high-stakes, Fortune 500 fintech environment. It balances **absolute security** with **operational efficiency**, evoking a sense of calm, calculated authority. The target audience includes high-net-worth customers, financial analysts, and system administrators who require clarity over decoration.

The visual style is **Corporate / Modern** with a focus on **High-Density Utility**. It utilizes a systematic "Indigo-Slate" palette to convey stability. Design decisions prioritize "Information at a Glance," utilizing a strict 8pt grid to maintain mathematical harmony across complex data structures. The interface feels like a precision instrument: sharp, responsive, and unfailingly reliable.

## Colors

The "Indigo-Slate" palette is optimized for long-duration professional use. 
- **Primary & Secondary**: Used for action intent and brand reinforcement.
- **Surface Strategy**: In **Light Mode**, we use `slate-50` for base backgrounds and white for card surfaces to create subtle separation. In **Dark Mode**, `slate-900` acts as the base with `slate-800` for elevated components.
- **Functional Tokens**: Success, Warning, and Error colors are desaturated slightly to prevent visual fatigue while remaining accessible.
- **Categorical Palette**: Five distinct hues are provided for financial charts to ensure data series are distinguishable even in complex multi-line graphs.
- **Portal Differentiation**: 
    - *Customer:* Uses more Indigo/Primary accents for a premium feel.
    - *Employee/Admin:* Uses more Slate/Neutral tones to focus on high-density data processing.

## Typography

This system uses **Geist** for headlines to provide a technical, modern edge, and **Inter** for all functional UI and body text for its world-class legibility.

- **Scale**: We employ a tight typographic scale. `body-sm` (13px) is the workhorse for data tables and transaction lists to maximize information density.
- **Monospace**: For account numbers, SWIFT codes, and transaction IDs, `mono-data` (JetBrains Mono) is used to ensure character clarity and alignment.
- **Alignment**: Numeric data in tables should always use tabular lining figures (tnum) to ensure columns of numbers align vertically for easy comparison.

## Layout & Spacing

The system follows a strict **8pt Grid** system. All components, padding, and margins must be multiples of 8 (with 4px used only for tight internal component spacing like checkbox-to-label).

- **Layout Model**: A **Fixed-Fluid Hybrid**.
    - *Customer/Public*: Centered fixed-width container (max 1280px) with generous 32px-48px margins.
    - *Admin/Dashboard*: Fluid 12-column grid that expands to fill the screen, using 24px gutters.
- **Responsive Behavior**: 
    - **Desktop (1280px+):** Sidebar navigation is persistent.
    - **Tablet (768px - 1279px):** Sidebar collapses to icons or a hamburger menu; data tables may introduce horizontal scrolling for specific columns.
    - **Mobile (<767px):** Single column stack. Complex charts transition to simplified "Sparkline" views.

## Elevation & Depth

We use **Tonal Layers** supplemented by **Precise Ambient Shadows** to define hierarchy without clutter.

- **Level 0 (Base):** `slate-50`. The background for the entire application.
- **Level 1 (Cards/Surface):** White (Light) or `slate-800` (Dark). Used for the main content areas, account widgets, and table containers. Shadow: 0 1px 3px rgba(0,0,0,0.1).
- **Level 2 (Active/Floating):** Used for hovered cards or navigation elements. Shadow: 0 4px 6px rgba(0,0,0,0.07).
- **Level 3 (Overlays):** Used for Modals and Drawers. These use a 40% opacity Slate-900 backdrop blur (8px) to maintain context while focusing the user.
- **Borders:** We use 1px solid `slate-200` (Light) or `slate-700` (Dark) borders for all form inputs and table rows to provide structure in high-density views.

## Shapes

The shape language is **Soft but Structured**. A `0.25rem` (4px) base radius is applied to maintain a professional, slightly "engineered" look.

- **Buttons & Inputs**: 4px (rounded-sm) for a sharp, precise appearance.
- **Cards & Modals**: 8px (rounded-lg) to provide a clear container definition.
- **Search Bars**: 24px (Pill-shaped) is the only exception, used to distinguish global search from standard data inputs.
- **Charts**: Bars in bar charts should have a 2px top-radius only to avoid looking too "bubbly."

## Components

### Data Tables (The Core)
- **Header:** Sticky header with `slate-100` background.
- **Rows:** 48px height for standard density; 40px for "Compact Mode" (Admin).
- **Actions:** Bulk actions appear in a floating bar at the bottom of the screen once items are selected.
- **Sorting:** Use chevron icons; active sort state highlights the column header in Primary Blue.

### Financial Charts
- **Palette:** Use the `chart-1` through `chart-5` tokens.
- **Interaction:** Tooltips must be "crosshair" style, showing values for all series at a specific X-axis point.
- **Grid:** Use dashed `slate-200` lines for horizontal Y-axis markers.

### Banking Widgets
- **Account Cards:** Use a subtle gradient (e.g., Primary to Secondary) for Virtual cards and a solid Slate for Physical cards.
- **Transaction List:** Status indicators use small 8px solid dots (Success/Warning/Error) next to the transaction name.

### Forms & Validation
- **States:** Error states must include both a red border and a trailing icon (Exclamation) for accessibility.
- **Density:** Inputs use a 14px font size with 8px vertical padding.
- **OTP:** Use four or six discrete boxes with a 2px border that turns Primary Blue on focus.

### Portal Specifics
- **Admin Portal:** Uses a "Condensed" version of the components where padding is reduced by 25% and font sizes stick strictly to `body-sm`.