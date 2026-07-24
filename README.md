# TextStamp

Turn any font into a PNG (or SVG) in seconds. Type a phrase, pick a font (or
upload your own `.ttf`/`.otf`), style it, and export — no Photoshop/Canva
required.

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
