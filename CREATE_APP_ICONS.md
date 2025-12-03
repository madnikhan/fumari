# Create App Icons from Brand Logo

## Current Status

The manifest now uses `fumari-logo.png` as the app icon. However, for best results, you should create properly sized icons (192x192 and 512x512 pixels).

---

## Option 1: Use Online Tool (Easiest)

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload `fumari-logo.png`
3. Download the generated icons
4. Save as:
   - `public/icon-192.png` (192x192 pixels)
   - `public/icon-512.png` (512x512 pixels)

---

## Option 2: Use Image Editor

1. Open `fumari-logo.png` in any image editor (Photoshop, GIMP, Canva, etc.)
2. Resize to 192x192 pixels → Save as `public/icon-192.png`
3. Resize to 512x512 pixels → Save as `public/icon-512.png`
4. Make sure to maintain aspect ratio and center the logo

---

## Option 3: Use Command Line (macOS)

If you have ImageMagick installed:

```bash
# Install ImageMagick (if not installed)
brew install imagemagick

# Create icons from logo
convert public/fumari-logo.png -resize 192x192 public/icon-192.png
convert public/fumari-logo.png -resize 512x512 public/icon-512.png
```

---

## After Creating Icons

Once you have `icon-192.png` and `icon-512.png`:

1. Place them in the `public/` folder
2. The manifest will automatically use them (currently using logo as fallback)
3. Redeploy to Vercel

---

## Current Setup

Right now, the manifest uses `fumari-logo.png` for all icon sizes. This works but may not be optimized. Creating proper sized icons will:
- ✅ Look better on different devices
- ✅ Load faster
- ✅ Follow PWA best practices

---

**The app will work with the current logo, but creating proper sized icons is recommended for best results!** 🎨

