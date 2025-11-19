# App Icon Setup Instructions

To complete the PWA setup, you need to create PNG icon files. Here are the options:

## Option 1: Use Online Converter (Easiest)

1. Open `public/icon.svg` in your browser
2. Use an online SVG to PNG converter like:
   - https://convertio.co/svg-png/
   - https://cloudconvert.com/svg-to-png
3. Convert to:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
4. Save both files to the `public/` folder

## Option 2: Use ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
cd public
convert -background none -resize 192x192 icon.svg icon-192.png
convert -background none -resize 512x512 icon.svg icon-512.png
```

## Option 3: Use Design Tool

1. Open `public/icon.svg` in Figma, Adobe Illustrator, or similar
2. Export as PNG at:
   - 192x192 pixels → `icon-192.png`
   - 512x512 pixels → `icon-512.png`
3. Save to `public/` folder

## Temporary Solution

The app will work without PNG icons, but they won't display properly. The install prompt will still function.

## Testing

After adding the icons:
1. Restart your dev server
2. Open the app in Chrome/Edge
3. The install prompt should appear
4. Check browser console for any icon-related errors

