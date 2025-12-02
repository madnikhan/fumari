# Fumari Logo Setup

## Adding the Logo File

To add the Fumari brand logo to the system, please follow these steps:

1. **Save your logo file** to the `public` folder with one of these names:
   - `fumari-logo.png` (recommended - PNG format)
   - `fumari-logo.svg` (SVG format - scalable)

2. **Recommended specifications:**
   - PNG: Transparent background, minimum 512x512 pixels
   - SVG: Vector format for best quality at all sizes

3. **File location:**
   ```
   /public/fumari-logo.png
   or
   /public/fumari-logo.svg
   ```

## Where the Logo Appears

The Fumari logo is now integrated into the following pages:

1. **Main Login Page** (`/login`)
   - Large logo display above the login form

2. **Accounting Login Page** (`/accounting/login`)
   - Large logo display above the accounting login form

3. **Dashboard Navigation** (`/dashboard`)
   - Small logo in the top navigation bar

4. **Accounting Dashboard** (`/dashboard/accounting`)
   - Small logo in the accounting header

## Logo Component

The logo is implemented using the `FumariLogo` component located at:
```
/components/FumariLogo.tsx
```

### Usage Example:
```tsx
import FumariLogo from '@/components/FumariLogo';

// Small logo (40x40px) - for navigation bars
<FumariLogo size="small" />

// Medium logo (80x80px) - default
<FumariLogo size="medium" />

// Large logo (120x120px) - for login pages
<FumariLogo size="large" />

// Extra large logo (160x160px) - for hero sections
<FumariLogo size="xlarge" />

// With text below
<FumariLogo size="large" showText={true} />
```

## Fallback Behavior

If the logo file is not found:
- The system will try both PNG and SVG formats
- If neither exists, a simple fallback icon with "F" will be displayed
- This ensures the system continues to work even without the logo file

## Notes

- The logo component uses Next.js Image optimization for better performance
- The logo automatically adapts to different screen sizes
- All logos maintain aspect ratio and are centered

