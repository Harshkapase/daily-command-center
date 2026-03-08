# 🚀 Migration Guide — v1 → v2 (Vite + React)

## What Changed
- **Framework**: CDN React + in-browser Babel → proper **Vite + React** build
- **Theme**: Dark → **Light (white/gray), Bold & Modern**
- **New**: Professional homepage / landing page
- **New**: SVG logo (geometric dot-grid mark)
- **Security**: No more unpkg CDN scripts, proper npm packages
- **Performance**: Bundled & minified output, ~10× faster load

---

## Deploy in 5 Steps

### 1. Copy these files into your repo
Replace your existing `public/` folder contents with the new `public/` files (keep your existing `manifest.json`, `sw.js`, `icon-192.png`).

Add all the new files at the root:
```
daily-command-center/
├── index.html          ← NEW (root Vite entry)
├── package.json        ← NEW
├── vite.config.js      ← NEW
├── vercel.json         ← UPDATED
├── public/             ← keep existing sw.js, manifest.json, icons
└── src/                ← NEW folder
    ├── main.jsx
    ├── App.jsx
    ├── styles/
    │   └── globals.css
    ├── components/
    │   └── Logo.jsx
    └── pages/
        ├── Landing.jsx
        └── Dashboard.jsx
```

### 2. Install dependencies (run locally first)
```bash
npm install
npm run dev        # test at http://localhost:5173
```

### 3. Push to GitHub
```bash
git add .
git commit -m "v2: Vite + React, landing page, new design"
git push
```

### 4. Vercel auto-deploys
Vercel detects the `vercel.json` config and runs `npm run build` automatically.
Output goes to `dist/` folder.

### 5. Done ✅
Your app now has:
- A beautiful landing/home page
- Professional logo
- Light theme, bold & modern design
- Proper Vite build (faster, more secure)

---

## Why Vite over CDN?

| Feature | Old (CDN Babel) | New (Vite) |
|---|---|---|
| Build time | None (slow runtime) | ~1s bundle |
| Bundle size | ~1.4MB CDN scripts | ~150KB |
| Security | Loads from unpkg.com | Self-hosted |
| NPM packages | ❌ | ✅ |
| TypeScript | ❌ | ✅ (easy to add) |
| Hot Reload | ❌ | ✅ |
