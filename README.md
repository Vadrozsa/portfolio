# Róza Parlagi — portfolio

Plain HTML / CSS / JS. No build step, no dependencies.

```
index.html         homepage
locus.html         case-study pages (copy one to add more)
project-2.html
project-3.html
cv.pdf             <- add your CV here (not included)
css/style.css      all styling (colours + sizes are variables at the top)
js/main.js         scroll animations, drag-to-scroll, project arrows
assets/img/        images (swap project-2.jpg / project-3.jpg for your own)
assets/fonts/      Anton, Space Mono, Inter (self-hosted)
```

## To do before publishing
1. Add `cv.pdf` next to `index.html`.
2. Replace the LinkedIn URL in `index.html` (search `YOUR-PROFILE`).
3. Edit cards 2 and 3 in `index.html` (search `EDIT`) and the About text.
4. Add photos to the "Get to know me" frames.
5. Fill in the case-study pages.

## Preview locally
In VS Code install the **Live Server** extension, right-click `index.html` -> *Open with Live Server*.

## Publish (GitHub Pages)
Repo -> Settings -> Pages -> Deploy from branch -> `main` / `/ (root)`.
Custom domain: put it in Settings -> Pages -> Custom domain, then add DNS records at your registrar.
