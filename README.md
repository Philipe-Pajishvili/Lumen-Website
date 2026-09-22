# Lumen website

- `index.html`, `site.css`, `site.js` — the landing page (new)
- `app.html`, `style.css`, `sketch.js` — the browser app (the old index.html, unchanged except a "Back to the Lumen website" link that is hidden inside the desktop app; `sketch.js` and `style.css` are untouched)
- `IMAGES/` — logo, favicon, star, and `og-image.png` (social preview, made from the logo)

## Fill in later (top of `site.js`)

```js
const LUMEN_LINKS = {
    windowsDownload: "",  // public URL of Lumen Setup 2.0.0.exe
    github: "",           // repository URL
    feedback: ""          // form, issues page, or mailto: link
};
```

Empty values keep a plain "not added yet" note (or hide the link). Nothing is made up.

## Electron

The landing page is now `index.html`, so the desktop app must load `app.html` instead
(for example `win.loadFile("app.html")` in Electron.js) before the next installer build.
Also make sure `app.html` is included in the files packaged by the build.

## Social preview

`og:image` is a relative path. Most platforms want a full URL, so once the site address is known,
change it in `index.html` to e.g. `https://<your-site>/IMAGES/og-image.png`.
