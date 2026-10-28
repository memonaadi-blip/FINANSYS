# FINANSYS

Where Financial Strategy Meets Systemic Automation.

Static landing page (HTML, CSS, vanilla JS, GSAP ScrollTrigger). No build step: open `index.html` through any static server, or view it on GitHub Pages.

- `content.js` holds all text, services, chart data and settings.
- `styles.css` holds the colour tokens and layout.
- `app.js` / `services.js` render the page and the scroll scenes.
- `erp/` is the standalone client-login page, to be served at https://erp.finansys.com.co (form posts to `/login` on that host; change `action` in `erp/index.html` to match your ERP).
- `assets/hero-hd/` holds the remastered scroll-film frames (1920px and 1024px sets).
