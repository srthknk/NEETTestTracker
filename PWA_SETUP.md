# PWA Setup Guide for RankForge

Your RankForge application has been successfully configured as a Progressive Web App (PWA)! Here's what's been set up and how to complete the installation.

## ✅ What's Already Configured

### 1. **Service Worker** (`public/sw.js`)
- Handles offline functionality
- Caches essential resources for fast loading
- Implements network-first strategy for API calls
- Supports background sync for test data

### 2. **Manifest** (`public/manifest.json`)
- Defines app metadata (name, description, theme colors)
- Specifies app icons and display modes
- Sets the app theme to RankForge blue (#1976d2)
- Enables "Add to Home Screen" on Android and iOS

### 3. **Metadata** (Updated in `src/app/layout.tsx`)
- PWA meta tags for all platforms (Android, iOS, Windows)
- Apple Web App configuration
- Mobile Web App capabilities
- Theme color and status bar styling

### 4. **Icons** (SVG icons created in `public/icons/`)
- `icon-192.svg` - 192x192 icon
- `icon-512.svg` - 512x512 icon
- `icon-maskable-192.svg` - Maskable 192x192 (for adaptive icons)
- `icon-maskable-512.svg` - Maskable 512x512 (for adaptive icons)
- `apple-touch-icon.svg` - iOS home screen icon

### 5. **PWA Registration** (`src/lib/pwa.ts` & `src/components/layout/PWASetup.tsx`)
- Automatic service worker registration
- Install prompt detection
- Background sync integration
- Update notification handling

## 🔄 Next Steps: Generate PNG Icons

The PWA requires PNG versions of the icons for maximum compatibility. You can generate these in several ways:

### Option 1: Online Conversion Tool (Easiest)
1. Go to [CloudConvert](https://cloudconvert.com/svg-to-png) or [IcoConvert](https://icoconvert.com/)
2. Convert each SVG file from `public/icons/` to PNG
3. Save with the same filename but `.png` extension

### Option 2: Using Sharp (Node.js)
```bash
npm install sharp
node scripts/generate-pwa-icons.js
```

### Option 3: Using ImageMagick (CLI)
```bash
convert -background none public/icons/icon-192.svg public/icons/icon-192.png
convert -background none public/icons/icon-512.svg public/icons/icon-512.png
convert -background none public/icons/icon-maskable-192.svg public/icons/icon-maskable-192.png
convert -background none public/icons/icon-maskable-512.svg public/icons/icon-maskable-512.png
convert -background none public/icons/apple-touch-icon.svg public/icons/apple-touch-icon.png
```

### Option 4: Custom Script with Puppeteer
Create a script using Puppeteer for programmatic conversion.

## 📱 How to Install as PWA

### On Android Chrome:
1. Open the app in Chrome
2. Tap the three-dot menu → "Install app" or look for the install banner
3. Tap "Install" to add to home screen
4. The app will install with the RankForge icon and branding

### On iOS Safari:
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add" to install the app

### On Windows (Edge or Chrome):
1. Click the three-dot menu
2. Look for "Install RankForge" or similar option
3. Click to install the app

## 🌐 Features Enabled

- **Offline Support**: App works offline with cached data
- **Add to Home Screen**: Install as a native app
- **Push Notifications**: Ready for implementation
- **Background Sync**: Syncs test data when connection returns
- **Responsive**: Works on all device sizes
- **Fast Loading**: Service worker caches assets

## 🔧 Service Worker Details

The service worker (`public/sw.js`) implements:

- **Install**: Prepares the cache for the app
- **Activate**: Cleans up old cache versions
- **Fetch**: 
  - API calls use network-first (real-time data)
  - Static assets use cache-first (fast loading)
  - Offline fallback for unavailable resources
- **Background Sync**: Auto-syncs tests when online

## 🚀 Testing the PWA

```bash
npm run dev
# or
npm run build && npm start
```

Visit `http://localhost:3000` and:
1. Check the browser console for PWA registration logs
2. Open DevTools → Application → Manifest to verify manifest
3. Check Service Workers tab to confirm registration
4. Try going offline (DevTools → Network → Offline) to test cache
5. Look for install prompts in the UI

## 📝 Environment Check

The PWA requires:
- ✅ HTTPS in production (HTTP localhost is OK for development)
- ✅ Valid manifest.json
- ✅ Service worker registration
- ✅ App icon (PNG format recommended)
- ✅ Proper meta tags

## 🎨 Customization

### Change App Colors
Edit `public/manifest.json`:
```json
"theme_color": "#1976d2",
"background_color": "#ffffff"
```

Edit `src/app/layout.tsx`:
```typescript
<meta name="theme-color" content="#1976d2" />
```

### Change App Name
Edit `public/manifest.json`:
```json
"name": "Your App Name",
"short_name": "Short Name"
```

## 🐛 Troubleshooting

### Service Worker not registering?
- Check console for errors
- Ensure `public/sw.js` exists
- Service workers require HTTPS (except localhost)

### Icons not showing?
- Convert SVG to PNG: `public/icons/*.png` files are missing
- Use option 2 or 3 from "Generate PNG Icons" section

### PWA not installable?
- Check manifest.json for valid JSON
- Ensure icons are 192x192 and 512x512 (or larger)
- Verify theme-color meta tag is present

## 📚 Resources

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

---

Your RankForge app is now PWA-ready! Just convert the SVG icons to PNG and you're all set. 🚀
