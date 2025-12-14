# QueueSense Design Guidelines

## Platform Note
**IMPORTANT**: The requirements specify Flutter/Material 3, but the stack blueprint indicates Expo. These guidelines are optimized for **React Native/Expo** with Material Design principles adapted for iOS/Android cross-platform development.

---

## Architecture Decisions

### Authentication
**No Authentication Required**
- The app uses anonymous check-ins with device fingerprinting to prevent duplicates
- No login, signup, or account management screens needed
- Device ID is generated and stored locally on first launch
- **Include a Settings screen** with:
  - App preferences (notifications, location permissions)
  - Privacy policy link
  - Terms of service link
  - About section with app version

### Navigation Structure
**Tab Navigation (4 tabs + Floating Action Button)**

The app has 4 distinct feature areas plus a core check-in action:

1. **Home Tab** - Browse locations and view queue status
2. **Predictions Tab** - View best time recommendations and trends
3. **History Tab** - Recent check-ins and saved locations
4. **Settings Tab** - App preferences and information

**Floating Action Button (FAB)** - Check-in action (positioned bottom-right, above tab bar)

---

## Screen Specifications

### 1. Home Screen (Tab 1)
**Purpose**: Browse and select locations to view queue status

**Layout**:
- Header: Custom with app logo/title, search icon (right)
- Main content: Scrollable with category cards + location list
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- **Category Selector**: Horizontal scrollable chip group (Bank, Hospital, Government Office)
- **Location Cards**: Vertical list showing:
  - Location name and address
  - Current crowd indicator (color-coded dot: green/yellow/red)
  - Estimated wait time badge
  - Distance from user (optional)
- **Empty State**: "No locations nearby" with illustration

**Interactions**:
- Tap category chip to filter locations
- Tap location card to navigate to Queue Status Screen
- Pull-to-refresh to update queue data

---

### 2. Queue Status Screen (Stack Screen)
**Purpose**: View live queue data for selected location

**Layout**:
- Header: Default navigation with location name, back button (left), favorite icon (right)
- Main content: Scrollable with metric cards
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components**:
- **Wait Time Hero**: Large circular animated indicator showing estimated minutes
  - Color transitions based on wait time (green < 15min, yellow 15-30min, red > 30min)
  - Confidence percentage below (e.g., "85% confident")
- **Trend Indicator**: Arrow icon + text (↑ Increasing / → Stable / ↓ Decreasing)
- **Current Queue Info Card**:
  - People in queue (approximate count)
  - Last updated timestamp
  - Data freshness indicator
- **Line Graph**: 24-hour trend showing historical wait times
- **Check-in Prompt**: Banner encouraging user to contribute data

**Interactions**:
- Favorite icon toggles saved status
- Graph is horizontally scrollable for past days
- Tap check-in banner to open check-in modal

---

### 3. Predictions Screen (Tab 2)
**Purpose**: View best time recommendations and patterns

**Layout**:
- Header: Custom with "Best Times" title
- Main content: Scrollable list
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- **Today's Recommendation Card**:
  - "Best time to visit: 2:00 PM - 3:30 PM"
  - Reason explanation (e.g., "Historically low crowd")
  - Quick action button to set notification
- **Heatmap Grid**: 7-day × 24-hour grid showing crowd density
  - Color-coded cells (light = low wait, dark = high wait)
  - Tap cell to see specific time details
- **Pattern Insights**: Text summaries like:
  - "Tuesdays are busiest between 10-11 AM"
  - "Fridays after 4 PM have shortest waits"

---

### 4. History Screen (Tab 3)
**Purpose**: View recent check-ins and saved locations

**Layout**:
- Header: Custom with "Activity" title
- Main content: Scrollable list with sections
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- **Saved Locations Section**: Horizontal scrollable cards (swipe to remove)
- **Recent Check-ins Section**: Vertical list showing:
  - Location name
  - Check-in timestamp
  - Queue position at time of check-in
  - Accuracy indicator (if prediction was accurate)
- **Empty State**: "No check-ins yet" with illustration

---

### 5. Settings Screen (Tab 4)
**Purpose**: App configuration and information

**Layout**:
- Header: Custom with "Settings" title
- Main content: Scrollable list of grouped settings
- Safe area: top = headerHeight + Spacing.xl, bottom = tabBarHeight + Spacing.xl

**Components**:
- **Notifications Group**:
  - Toggle for low crowd alerts
  - Toggle for saved location updates
- **Privacy Group**:
  - Device ID display (truncated)
  - "How we protect your privacy" info link
- **About Group**:
  - App version
  - Privacy policy link
  - Terms of service link
  - Rate app button

---

### 6. Check-in Modal (Native Modal)
**Purpose**: Submit anonymous queue data

**Layout**:
- Presented as bottom sheet (75% screen height)
- Header: Location name, close button (right)
- Content: Form with submit button at bottom
- Safe area: bottom = insets.bottom + Spacing.xl

**Components**:
- **Location Confirmation**: Display selected location name
- **Queue Position Input**: Number stepper or text input
  - Label: "How many people are ahead of you?"
  - Validation: 0-200 range
- **Queue Stage Selector** (Optional): Segmented control
  - Waiting / In Service / Completing
- **Submit Button**: Full-width, disabled until valid input
- **Success Animation**: Checkmark animation on successful submission

**Interactions**:
- Close button shows confirmation alert if form is dirty
- Submit button triggers submission and closes modal
- Success state shows brief confirmation before closing

---

## Design System

### Color Palette
**Primary Colors** (trustworthy, professional):
- Primary: #1976D2 (blue - trust, reliability)
- Secondary: #388E3C (green - positive, available)
- Background: #FFFFFF (clean, minimal)
- Surface: #F5F5F5 (subtle cards)

**Status Colors**:
- Success (low wait): #4CAF50
- Warning (medium wait): #FF9800
- Error (high wait): #F44336
- Info: #2196F3

**Text Colors**:
- Primary text: #212121
- Secondary text: #757575
- Disabled: #BDBDBD
- Inverse (on dark): #FFFFFF

### Typography
- Headings: System font, semibold (600)
- Body: System font, regular (400)
- Caption: System font, regular (400), smaller size
- Numbers (wait times): System font, bold (700), tabular nums

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- xxl: 48px

### Visual Design Principles
- **Minimal Shadows**: Use subtle elevation for cards (shadowOpacity: 0.05, shadowRadius: 4)
- **FAB Shadow** (floating check-in button):
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2
- **Icons**: Use Feather icons from @expo/vector-icons for consistency
- **Animations**: Smooth transitions (300ms ease-in-out)
  - Wait time indicator: Animated circular progress
  - Crowd trend: Subtle icon pulse for "increasing" state
  - Check-in success: Scale + fade animation

### Interaction Feedback
- **Touchables**: Subtle scale (0.98) + opacity (0.7) on press
- **Buttons**: Background color darkens by 10% on press
- **Cards**: Scale (0.99) on press, no shadow change
- **FAB**: Scale (0.95) + slight elevation increase on press

---

## Critical Assets

**DO NOT OVERUSE CUSTOM ASSETS**. Use system icons for standard actions.

### Required Generated Assets:
1. **Empty State Illustrations** (3 unique):
   - "No locations nearby" (simple, minimal line art)
   - "No check-ins yet" (simple, minimal line art)
   - "No saved locations" (simple, minimal line art)
   - Style: Monochromatic blue line drawings, trustworthy aesthetic

2. **Category Icons** (3):
   - Bank icon (building with columns)
   - Hospital icon (cross symbol)
   - Government office icon (official building)
   - Style: Outlined, consistent stroke width, blue color

### Standard Icons (use Feather icons):
- Navigation: home, trending-up, clock, settings
- Actions: search, heart, plus, x, check
- Indicators: arrow-up, arrow-right, arrow-down, map-pin

---

## Accessibility Requirements
- Minimum touch target: 44×44 points
- Color contrast ratio: 4.5:1 for text, 3:1 for UI components
- Dynamic type support for text scaling
- VoiceOver/TalkBack labels for all interactive elements
- Status indicators include text, not just color
- Error states provide clear text descriptions