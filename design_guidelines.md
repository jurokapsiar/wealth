# Design Guidelines: Financial Projection Calculator

## Design Approach

**Selected Approach:** Design System - Material Design 3 (adapted)

**Justification:** This mobile-first financial calculator requires clear information hierarchy, efficient data input, and readable tabular displays. Material Design's principles of clarity, emphasis on structure, and mobile-first thinking align perfectly with a utility-focused financial tool.

**Key Design Principles:**
- Mobile-first with progressive enhancement
- Clear visual hierarchy separating inputs from calculations
- Maximum data density without compromising readability
- Immediate visual feedback for calculations
- Touch-friendly interface elements

---

## Core Design Elements

### A. Typography

**Font Family:** Inter (via Google Fonts CDN)
- Primary: Clean, highly legible, excellent for numbers and data
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale:**
- Page Title: text-2xl font-bold (mobile), text-3xl (desktop)
- Section Headers: text-lg font-semibold
- Input Labels: text-sm font-medium
- Input Values: text-base font-normal
- Table Headers: text-xs font-semibold uppercase tracking-wide
- Table Data: text-sm font-normal
- Currency/Numbers: text-base font-semibold (results), tabular-nums for alignment
- Helper Text: text-xs

---

### B. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 as core spacing
- Component gaps: gap-4
- Section padding: p-4 (mobile), p-6 (tablet+)
- Input spacing: space-y-4
- Card padding: p-6
- Table cell padding: px-4 py-3

**Container Strategy:**
- Mobile: Full-width with px-4 padding
- Tablet+: max-w-2xl mx-auto px-6
- No fixed viewport heights - natural content flow

**Grid Patterns:**
- Form inputs: Single column (mobile), 2-column grid for related pairs (tablet+)
- Cost configuration: Stacked cards on mobile, side-by-side on desktop
- Results table: Full-width scrollable container

---

### C. Component Library

#### Navigation & Structure
- **App Header:** 
  - Sticky top bar with app title
  - Height: h-14 (mobile), h-16 (desktop)
  - Shadow for elevation separation

#### Form Components

**Input Fields:**
- Text/Number inputs: Full-width, h-12 touch target
- Border radius: rounded-lg
- Focus states with ring utility
- Label above input (not floating)
- Persistent helper text below when needed

**Input Groups:**
- Currency prefix displayed inline (visual, not input part)
- Percentage suffix for rate inputs
- Year inputs with number steppers

**Buttons:**
- Primary CTA: h-12 with px-6, rounded-lg, font-medium
- Secondary actions: h-10 with px-4, rounded-md
- Icon buttons: w-10 h-10 square with rounded-md
- Touch targets minimum 44x44px

**Cards:**
- Elevated containers for logical groupings
- Border radius: rounded-xl
- Shadow: Subtle elevation (shadow-sm to shadow-md)
- Padding: p-6 (mobile), p-8 (desktop)

#### Data Display

**Configuration Section:**
- Card-based layout for initial settings
- Clear visual separation between wealth settings and cost entries
- Add Cost button prominent and accessible

**Cost Entry Cards:**
- Individual cards for each cost item
- Radio buttons for cost type selection (Fixed Amount vs. % of Wealth)
- Conditional fields appearing smoothly based on selection
- Remove button (icon only) top-right corner
- Divider between multiple cost entries

**Results Table:**
- Horizontally scrollable on mobile (overflow-x-auto)
- Sticky header row
- Alternating row treatment for readability
- Responsive column widths (wider for important data)
- Right-aligned numbers for easier comparison

**Table Structure:**
```
Columns:
1. Year # (narrow, 60px)
2. Year (80px)
3. Starting Wealth (flexible)
4. Interest Gained (flexible)
5. Total Costs (flexible)
6. Ending Wealth (flexible, emphasized)

Mobile: Hide less critical columns, keep Year #, Year, Ending Wealth
Tablet: Show all columns with reduced padding
Desktop: Full display with comfortable spacing
```

**Cost Breakdown (per year):**
- Expandable/collapsible section per year row
- Nested list showing each cost deduction
- Indented with subtle connecting lines
- Running total displayed

#### Icons
**Library:** Heroicons (via CDN)
- Plus icon: Add cost button
- Trash icon: Remove cost
- ChevronDown/Up: Expand/collapse year details
- InformationCircle: Helper tooltips
- Calculator: App header icon

---

### D. Responsive Behavior

**Mobile (< 640px):**
- Single column layout throughout
- Full-width form fields
- Simplified table showing critical columns only
- Tap to expand year details
- Bottom sheet style for cost entry forms

**Tablet (640px - 1024px):**
- 2-column grid for paired inputs (interest %, inflation %)
- Show more table columns
- Side-by-side cost type selection

**Desktop (1024px+):**
- Contained width (max-w-2xl) for comfortable reading
- Full table display
- Inline year detail expansion
- Hover states for interactive elements

---

### E. Visual Hierarchy

**Priority Levels:**
1. **Highest:** Ending wealth values, Primary CTA (Calculate/Add Cost)
2. **High:** Section headers, Input labels, Year column
3. **Medium:** Helper text, Cost breakdown items
4. **Low:** Table borders, Dividers

**Emphasis Techniques:**
- Font weight variation (medium to bold)
- Size contrast (text-sm to text-xl)
- Spacing isolation (generous padding around important elements)
- Card elevation for groupings

---

### F. Interaction Patterns

**Form Validation:**
- Inline validation on blur
- Clear error messages below fields
- Error state styling on inputs

**Calculations:**
- Auto-calculate on input change (debounced)
- Loading state during calculation
- Smooth transition when results update

**Cost Management:**
- Smooth addition of new cost cards
- Confirm before removing costs (if > 1)
- Clear empty state when no costs added

**Table Interactions:**
- Tap/click year row to expand cost breakdown
- Horizontal swipe on mobile for table scroll
- Sticky table header when scrolling vertically

---

### G. Accessibility

- All inputs with associated labels (label element, not placeholder-only)
- Form fields with aria-describedby for helper text
- Keyboard navigation support for all interactive elements
- Focus indicators clearly visible
- Sufficient contrast ratios throughout
- Touch targets meet 44x44px minimum
- Table markup with proper thead/tbody structure
- ARIA labels for icon-only buttons

---

### H. Content Structure

**Page Layout (Top to Bottom):**

1. **App Header** - Title and optional reset/info
2. **Initial Settings Card**
   - Initial Wealth input
   - Yearly Interest % input
   - Inflation % input  
   - Start Year input
3. **Costs Section**
   - Section header "Projected Costs"
   - Cost entry cards (repeatable)
   - Add Cost button
4. **Results Section** (appears after calculation)
   - Section header "Wealth Projection"
   - Year-over-year table
   - Year detail expansions inline

**Empty States:**
- No costs: Friendly prompt to add first cost
- No results yet: Placeholder encouraging user to review inputs