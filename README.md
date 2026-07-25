# Font Image Maker (header wordmark: "Font Studio")

Create beautiful text images with any font. Type a phrase, pick a font (or
upload your own `.ttf`/`.otf`), style it, and export as PNG (with real DPI
metadata) or SVG — no Photoshop/Canva required.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Canvas 2D API for PNG export, hand-built SVG serialization for SVG export
- `FontFace` API for loading user-uploaded fonts
- `localforage` (IndexedDB) for persisting favorites, recently-used fonts,
  uploaded fonts, and saved text presets across sessions

## Project structure

```
app/
  layout.tsx        Root layout, metadata
  page.tsx           Composes all panels using the useTextStamp hook
  globals.css         Tailwind + checkerboard background utility
components/
  Toolbar.tsx          Header
  LayerPanel.tsx        Add/duplicate/delete/reorder text layers
  TextEditor.tsx        Text input + saved phrase presets
  TemplatesPanel.tsx    One-click style bundles
  FontSelector.tsx      Search / categories / upload / favorites / recents
  SizeColorPanel.tsx    Font size + color
  TextStylePanel.tsx    Bold / Italic / Underline / Case
  TypographyPanel.tsx   Align / letter-spacing / line-height / curve / rotation
  OutlinePanel.tsx      Stroke outline
  ShadowPanel.tsx        Drop shadow
  CanvasSizePanel.tsx    Canvas dimensions + presets
  BackgroundPanel.tsx    Transparent / solid / image background
  ExportPanel.tsx        PNG/SVG, resolution, watermark
  Preview.tsx             Live, draggable, WYSIWYG preview (+ Compare mode)
  DownloadButton.tsx
  StatusOverlays.tsx      Toasts + drag-and-drop overlay
  ColorPicker.tsx / ui.tsx  Shared primitives
hooks/
  useTextStamp.ts     All app state + handlers (the "brain" of the app)
lib/
  types.ts             Shared TypeScript types
  fonts.ts              Built-in font catalog, categories, templates, canvas presets
  canvasRender.ts        Pure drawing/measurement functions (straight + curved text)
  exportImage.ts          PNG and SVG export
  storage.ts               IndexedDB persistence (via localforage)
```

## Notes & known limitations

- **Curved text in SVG** exports as straight text (curved rendering is
  currently canvas/PNG-only). A toast warns you when this happens.
- **Account/login features** are intentionally not included — they need a
  real backend (auth + database), which is outside this client-only app.
- **Curve direction** was implemented from first principles and hasn't been
  cross-browser tested exhaustively — if "positive curve" bends the wrong way
  for your taste, it's a one-line sign flip in `lib/canvasRender.ts`
  (`drawArcLine`).
- Google Fonts are loaded from `fonts.googleapis.com` at runtime; for a fully
  offline build, download the font files and self-host them instead.

## Customizing colors & design

- **Accent color** (buttons, highlights, selected states): change `ACCENT` in
  `lib/fonts.ts`. It's one constant used everywhere — no need to hunt through
  components.
- **Overall look** (backgrounds, card radius, spacing, fonts used in the UI
  itself): everything is plain Tailwind utility classes directly in each
  component's `className`. There's no separate theme file to fight — e.g. to
  make cards less rounded, search for `rounded-2xl` across `components/*` and
  change it; to change the base font, edit `app/globals.css` /
  `tailwind.config.ts`.
- **Logo icon**: replace `public/logo.svg` with your own file (same
  filename) — no code changes needed. It's referenced once, in
  `components/Toolbar.tsx`.
- **Wordmark / page title / description**: `components/Toolbar.tsx` (header
  text) and `app/layout.tsx` (`metadata.title` / `metadata.description`, used
  for the browser tab and link previews).
- **Footer / social link**: `components/Footer.tsx`.

## Changelog (latest round of fixes)

- Fixed a font-loading bug where two built-in fonts (Fredoka, Rubik) only
  requested a semi-bold weight from Google Fonts; normal (non-bold) text
  couldn't use that weight and silently fell back to a system font, making
  font switching look broken for those two. Now all built-in fonts load their
  default weight.
- Added a hex text field next to every color swatch (previously only the
  main text-color picker had one) as a reliable manual fallback.
- Watermark now renders live in the preview, not just in exports.
- PNG export now offers real DPI presets (72/144/300/350/600/1200) and embeds
  actual DPI metadata in the file (`lib/pngDpi.ts` — a pHYs chunk writer),
  so design/print software reports the correct resolution.
- Added "Copy image" to copy the rendered PNG straight to the clipboard.
- SVG export now offers **Text (Editable)** vs **Outline (Universal)**.
  Outline mode converts uploaded `.ttf`/`.otf` fonts to true vector paths via
  `opentype.js` (no font dependency at all in the file). Built-in Google
  Fonts still export as editable text in outline mode — converting those
  reliably would require fetching and parsing their WOFF2 files, which
  `opentype.js` doesn't support out of the box; a toast tells you when this
  fallback happens.
- Reordered the layout: **Text → Font → everything else → Layers**, and the
  preview now sits first/top on mobile and in a sticky left column on
  desktop, so it's visible while you scroll a long control panel.
- Rebranded: header wordmark "Font Studio", page title "Font Image Maker",
  swappable logo icon, Instagram credit in the footer.

## Extending

The architecture was built so the next round of features slot in cleanly:

- **More templates**: add entries to `TEMPLATES` in `lib/fonts.ts`.
- **More built-in fonts**: add entries to `BUILTIN_FONTS` in `lib/fonts.ts`
  (make sure the `googleParam` matches the Google Fonts CSS2 API).
- **New export format**: add a sibling function to `exportPNG`/`exportSVG` in
  `lib/exportImage.ts` and wire it into `ExportPanel.tsx` + `useTextStamp.ts`.
- **New layer property**: add the field to `TextLayer` in `lib/types.ts`,
  give it a default in `makeLayer()` (`lib/canvasRender.ts`), read it in
  `renderLayerOnCtx`/`exportSVG`, and add a control in the relevant panel.
