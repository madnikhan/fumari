# Fumari Restaurant Color Scheme

## Brand Colors

The system now uses the restaurant's interior design colors:

- **Maroon**: `#9B4E3F` - Primary brand color
- **Green**: `#1B4527` - Secondary accent color  
- **Gold**: `#FFE176` - Highlight and accent color
- **Black**: `#212226` - Background color
- **White**: `#ffffff` - Text color
- **Cloud Grey**: `#E5E5E5` - Secondary text color

## Color Variants

### Maroon
- Base: `#9B4E3F`
- Dark: `#7A3E32` (hover states)
- Light: `#B85E4F` (hover states)

### Green
- Base: `#1B4527`
- Dark: `#15341F` (hover states)
- Light: `#215632` (hover states)

### Gold
- Base: `#FFE176`
- Dark: `#E6C966` (hover states)
- Light: `#FFE88A` (hover states)

## Usage Guidelines

### Primary Actions
- Use **Gold** (`#FFE176`) for primary buttons and important highlights
- Use **Maroon** (`#9B4E3F`) for navigation bars and headers
- Use **Green** (`#1B4527`) for success states and positive actions

### Backgrounds
- Main background: **Black** (`#212226`)
- Secondary background: `#2A2B2F`
- Cards and containers: `#2A2B2F` with borders

### Text
- Primary text: **White** (`#ffffff`)
- Secondary text: **Cloud Grey** (`#E5E5E5`)
- Headings: **Gold** (`#FFE176`)

### Borders
- Primary borders: **Maroon** (`#9B4E3F`)
- Accent borders: **Gold** (`#FFE176`)

## Implementation

Colors are defined in `app/globals.css` as CSS variables and can be used throughout the application using Tailwind's arbitrary value syntax:

```tsx
// Backgrounds
bg-[#212226]        // Main background
bg-[#2A2B2F]        // Secondary background
bg-[#9B4E3F]        // Maroon background
bg-[#1B4527]        // Green background
bg-[#FFE176]        // Gold background

// Text
text-[#ffffff]      // White text
text-[#E5E5E5]      // Cloud grey text
text-[#FFE176]      // Gold text

// Borders
border-[#9B4E3F]    // Maroon border
border-[#FFE176]    // Gold border

// Hover states
hover:bg-[#7A3E32]  // Darker maroon
hover:bg-[#E6C966]  // Darker gold
```

## Updated Components

All major components have been updated to use the new color scheme:
- Login pages
- Dashboard layout
- Navigation bars
- Buttons and forms
- Cards and containers
- Toast notifications
- Logo component

