# Southern Downs 4x4 — static site (IIS deploy)

Upload the CONTENTS of this folder to the site root (wwwroot).

## Files
- index.html, about.html, what-we-do.html, builds.html, book.html, 404.html
- css/site.css — all styling (no inline styles)
- js/site.js — all behaviour (nav, motion, builds, reviews, quote form). js/hero.js — picks the alternating home hero before first paint
- img/ — 41 optimised images (WebP, SEO-named). Total ≈ 5.4 MB (was ≈ 140 MB)
- reviews.json — Google reviews feed. Fill in: { "rating": 4.9, "count": 18, "reviewUrl": "…", "reviews": [ { "name": "…", "date": "…", "stars": 5, "text": "…" } ] }
- web.config — HTTPS + non-www redirects, clean URLs (/about, /what-we-do, /builds, /book), custom 404, MIME types, compression, caching, security headers
- sitemap.xml, robots.txt, llms.txt

## IIS requirements
1. IIS URL Rewrite module installed (free, Microsoft Web Platform).
2. HTTPS certificate bound (reCAPTCHA and Google Maps require https).
3. Static compression enabled (web.config turns it on; the feature must be installed).

## After go-live
- Google reCAPTCHA admin: confirm sd4x4.com.au is in the allowed domains for the site key.
- Google Search Console: add property, submit https://sd4x4.com.au/sitemap.xml.
- Google Business Profile: match address/phone exactly (90 Ogilvie Road, Warwick QLD 4370 / 07 4548 9580).
- Optional: add a 512×512 square icon as /favicon.ico + /apple-touch-icon.png and reference in each <head>.
- Once reviews.json has real reviews, add AggregateRating to the LocalBusiness schema (ask us).
