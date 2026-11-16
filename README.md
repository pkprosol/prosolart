# prosolart.com

Wladyslaw Prosol's portfolio. Rebuilt off Squarespace (Nov 2026).

- **Edit:** https://app.pagescms.org → this repo. Galleries, captions, About text, contact details.
- **Build:** Eleventy (`npm start` for local preview on :8080). Content in `content/*.yml`, originals in `src/images/`.
  Every image is resized + converted to WebP at build; uploads can be raw camera photos.
- **Host:** GitHub Pages via `.github/workflows/deploy.yml`, on every push to `main`. $0.
- **Custom domain:** set repo variable `CUSTOM_DOMAIN=www.prosolart.com`, add it under Settings → Pages,
  then point DNS: `www` CNAME → `pkprosol.github.io`; apex A records → 185.199.108.153 / .109 / .110 / .111.
- **Contact form:** FormSubmit (free, no account) posts to the email in Settings. The FIRST submission sends
  an activation email to that address — click it once or messages won't arrive. Failures show the visitor
  an error with a direct email link, never a fake "sent".
