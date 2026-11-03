# dcl-bugtest-customFont

Minimal Decentraland SDK7 scene for debugging Font Awesome Free via `fontSrc`.
No UI component kit — only a bare `FontAwesome` component and icon lookup.

## Layout

- `assets/fonts/duck-font-awesome-*.ttf` — converted FA Free faces (+ OFL)
- `src/fonts/` — icon name → unicode / style map + resolve helpers
- `src/components/fontAwesome.tsx` — `icon` / `fontSize` / `fontColor` only
- `src/ui.tsx` — side-by-side component vs raw `UiEntity` probe

## Preview

Unity Desktop only loads custom fonts from asset bundles:

```bash
npm install
npm run start:bundles
```

Plain `npm start` will show tofu for PUA icon glyphs — that is expected.
