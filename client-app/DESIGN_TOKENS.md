# Design Tokens - Food Delivery App

This document provides a comprehensive reference for all design tokens used in the client app.

---

## 🎨 Colors

### Primary (Orange - Food Theme)
```
primary.50:  #FFF3E0  (Lightest - backgrounds, subtle accents)
primary.100: #FFE0B2
primary.200: #FFCC80
primary.300: #FFB74D
primary.400: #FFA726
primary.500: #FF9800  ⭐ Main brand color
primary.600: #FB8C00  (Buttons, CTAs)
primary.700: #F57C00  (Hover states)
primary.800: #EF6C00
primary.900: #E65100  (Darkest - text on light backgrounds)
```

### Secondary (Grey - Neutrals)
```
secondary.50:  #FAFAFA  (Page backgrounds)
secondary.100: #F5F5F5  (Card backgrounds)
secondary.200: #EEEEEE  (Dividers, borders)
secondary.300: #E0E0E0
secondary.400: #BDBDBD  (Disabled text)
secondary.500: #9E9E9E  (Hint text)
secondary.600: #757575  (Secondary text)
secondary.700: #616161
secondary.800: #424242  (Dark text)
secondary.900: #212121  (Primary text)
```

### Semantic Colors
```
success: #4CAF50  (Green - success states, confirmations)
warning: #FF9800  (Orange - warnings, alerts)
error:   #F44336  (Red - errors, destructive actions)
info:    #2196F3  (Blue - informational messages)
```

### Surface Colors
```
white:          #FFFFFF  (Cards, modals, surfaces)
black:          #000000  (Text, icons)
background:     #FAFAFA  (Page background)
surface:        #FFFFFF  (Card surface)
surfaceVariant: #F5F5F5  (Subtle backgrounds)
```

### Text Colors
```
text.primary:   #212121  (Main content)
text.secondary: #757575  (Supporting text)
text.disabled:  #BDBDBD  (Disabled state)
text.hint:      #9E9E9E  (Placeholder, hints)
```

---

## 📏 Spacing

```
xs:  4px   (Tight spacing, icon gaps)
sm:  8px   (Compact elements)
md:  12px  (Default spacing)
lg:  16px  (Comfortable spacing)
xl:  24px  (Section spacing)
2xl: 32px  (Major sections)
3xl: 48px  (Screen padding)
4xl: 64px  (Large gaps)
```

### Usage Examples
- **Component padding**: `md` (12px) or `lg` (16px)
- **Section spacing**: `xl` (24px) or `2xl` (32px)
- **Screen padding**: `lg` (16px) or `xl` (24px)
- **Icon gaps**: `xs` (4px) or `sm` (8px)

---

## 📝 Typography

### Font Sizes
```
xs:   12px  (Captions, labels, helper text)
sm:   14px  (Secondary content, small buttons)
base: 16px  (Body text, primary content)
lg:   18px  (Emphasized body text)
xl:   20px  (Subheadings)
2xl:  24px  (Section headers)
3xl:  30px  (Page titles)
4xl:  36px  (Display text)
5xl:  48px  (Hero text)
```

### Font Weights
```
normal:    400  (Body text)
medium:    500  (Emphasized text)
semibold:  600  (Subheadings, buttons)
bold:      700  (Headings, important text)
extrabold: 800  (Display text, hero)
```

### Typography Scale
```
Display:      4xl (36px) / 5xl (48px), Bold/Extrabold
Headline:     2xl (24px) / 3xl (30px), Semibold/Bold
Title:        xl (20px), Semibold
Body Large:   lg (18px), Normal/Medium
Body:         base (16px), Normal
Body Small:   sm (14px), Normal
Caption:      xs (12px), Normal/Medium
```

---

## 🔲 Border Radius

```
none: 0px     (Sharp corners)
sm:   4px     (Subtle rounding, chips)
md:   8px     (Buttons, inputs)
lg:   12px    (Cards, containers)
xl:   16px    (Prominent cards)
2xl:  24px    (Modals, sheets)
3xl:  32px    (Large containers)
full: 9999px  (Pills, badges, circular)
```

### Usage Examples
- **Buttons**: `md` (8px) or `lg` (12px)
- **Cards**: `lg` (12px) or `xl` (16px)
- **Inputs**: `md` (8px)
- **Modals**: `2xl` (24px)
- **Badges/Pills**: `full` (9999px)

---

## 🌑 Shadows

### none
```
shadowColor: transparent
shadowOffset: { width: 0, height: 0 }
shadowOpacity: 0
shadowRadius: 0
elevation: 0
```
**Usage**: Flat elements, no elevation

### sm
```
shadowColor: #000
shadowOffset: { width: 0, height: 1 }
shadowOpacity: 0.05
shadowRadius: 2
elevation: 1
```
**Usage**: Subtle card separation, minimal depth

### md
```
shadowColor: #000
shadowOffset: { width: 0, height: 2 }
shadowOpacity: 0.1
shadowRadius: 4
elevation: 3
```
**Usage**: Floating elements, buttons, chips

### lg
```
shadowColor: #000
shadowOffset: { width: 0, height: 4 }
shadowOpacity: 0.15
shadowRadius: 8
elevation: 6
```
**Usage**: Modals, dropdowns, prominent cards

### xl
```
shadowColor: #000
shadowOffset: { width: 0, height: 8 }
shadowOpacity: 0.2
shadowRadius: 16
elevation: 10
```
**Usage**: Prominent overlays, floating action buttons

---

## ⏱️ Animations

### Duration
```
fast:   150ms  (Quick transitions, hover states)
normal: 250ms  (Standard transitions, most animations)
slow:   350ms  (Deliberate transitions, complex animations)
```

### Easing
```
easeIn:    ease-in      (Accelerating from zero velocity)
easeOut:   ease-out     (Decelerating to zero velocity)
easeInOut: ease-in-out  (Accelerating then decelerating)
```

---

## 📱 Usage in Code

### Importing
```javascript
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows, animations } from '../styles/theme';
```

### Examples
```javascript
// Colors
backgroundColor: colors.primary[500]
color: colors.text.primary

// Spacing
padding: spacing.lg
marginBottom: spacing.xl

// Typography
fontSize: fontSize.xl
fontWeight: fontWeight.semibold

// Border Radius
borderRadius: borderRadius.lg

// Shadows
...shadows.md

// Animations
duration: animations.duration.normal
```

---

**Last Updated**: 2025-12-25  
**Version**: 1.0


