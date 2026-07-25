"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BUILTIN_FONTS, googleFontsHref } from "@/lib/fonts";
import { base64ToBuffer, bufferToBase64, clamp, makeLayer } from "@/lib/canvasRender";
import { copyPngToClipboard, exportPNG, exportSVG, SvgMode } from "@/lib/exportImage";
import {
  loadCustomFonts,
  loadFavorites,
  loadRecent,
  loadTextPresets,
  saveCustomFonts,
  saveFavorites,
  saveRecent,
  saveTextPresets,
} from "@/lib/storage";
import { BgMode, ExportFormat, FontDef, StyleTemplate, TextLayer, TextPreset } from "@/lib/types";

export function useTextStamp() {
  const [layers, setLayers] = useState<TextLayer[]>(() => [makeLayer()]);
  const [activeLayerId, setActiveLayerId] = useState<string>(() => layers[0]!.id);
  const [draggingLayerId, setDraggingLayerId] = useState<string | null>(null);

  const [canvasWidth, setCanvasWidth] = useState(1000);
  const [canvasHeight, setCanvasHeight] = useState(1000);
  const [bgMode, setBgMode] = useState<BgMode>("transparent");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [bgImage, setBgImage] = useState<string | null>(null);

  const [dpi, setDpi] = useState(300);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("png");
  const [svgMode, setSvgMode] = useState<SvgMode>("editable");
  const [isCopying, setIsCopying] = useState(false);
  const [watermarkOn, setWatermarkOn] = useState(false);
  const [watermarkText, setWatermarkText] = useState("yourshopname");
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.6);

  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [customFonts, setCustomFonts] = useState<FontDef[]>([]);
  const [fontsReady, setFontsReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState("");
  const [compareMode, setCompareMode] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [textPresets, setTextPresets] = useState<TextPreset[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragCounterRef = useRef(0);

  const allFonts = useMemo(() => [...BUILTIN_FONTS, ...customFonts], [customFonts]);
  const activeLayer = layers.find((l) => l.id === activeLayerId) || layers[0];

  const updateActiveLayer = useCallback(
    (patch: Partial<TextLayer>) => {
      setLayers((prev) => prev.map((l) => (l.id === activeLayerId ? { ...l, ...patch } : l)));
    },
    [activeLayerId]
  );

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  // ---------- Load Google Fonts stylesheet once ----------
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = googleFontsHref();
    document.head.appendChild(link);
    document.fonts.ready.then(() => setFontsReady(true));
    const t = setTimeout(() => setFontsReady(true), 1500);
    return () => {
      clearTimeout(t);
      document.head.removeChild(link);
    };
  }, []);

  // ---------- Hydrate persisted state (IndexedDB via localforage) ----------
  useEffect(() => {
    (async () => {
      try {
        setFavoriteIds(await loadFavorites());
      } catch {}
      try {
        setRecentIds(await loadRecent());
      } catch {}
      try {
        setTextPresets(await loadTextPresets());
      } catch {}
      try {
        const saved = await loadCustomFonts();
        const restored: FontDef[] = [];
        for (const item of saved) {
          try {
            const buffer = base64ToBuffer(item.base64);
            const fontFace = new FontFace(item.familyName, buffer);
            await fontFace.load();
            document.fonts.add(fontFace);
            restored.push({
              id: item.id,
              name: item.name,
              category: "My Fonts",
              cssFamily: `'${item.familyName}'`,
              base64: item.base64,
              familyName: item.familyName,
            });
          } catch {}
        }
        if (restored.length) setCustomFonts(restored);
      } catch {}
      setIsHydrated(true);
    })();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    saveFavorites(favoriteIds).catch(() => {});
  }, [favoriteIds, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    saveRecent(recentIds).catch(() => {});
  }, [recentIds, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    saveTextPresets(textPresets).catch(() => {});
  }, [textPresets, isHydrated]);
  useEffect(() => {
    if (!isHydrated) return;
    saveCustomFonts(customFonts).catch(() => {});
  }, [customFonts, isHydrated]);

  // ---------- Custom font upload ----------
  const selectFont = useCallback(
    (id: string) => {
      setLayers((prev) => prev.map((l) => (l.id === activeLayerId ? { ...l, fontId: id } : l)));
      setRecentIds((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 10));
    },
    [activeLayerId]
  );

  const handleFiles = useCallback(
    async (fileList: FileList) => {
      const files = Array.from(fileList).filter((f) => /\.(ttf|otf)$/i.test(f.name));
      if (files.length === 0) {
        showToast("Please select a .ttf or .otf file");
        return;
      }
      for (const file of files) {
        try {
          const buffer = await file.arrayBuffer();
          const rawName = file.name.replace(/\.(ttf|otf)$/i, "");
          const familyName = `custom-${rawName.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}`;
          const fontFace = new FontFace(familyName, buffer);
          await fontFace.load();
          document.fonts.add(fontFace);
          const id = `custom-${familyName}`;
          const base64 = bufferToBase64(buffer);
          setCustomFonts((prev) => [
            ...prev,
            { id, name: rawName, category: "My Fonts", cssFamily: `'${familyName}'`, familyName, base64 },
          ]);
          selectFont(id);
          setCategory("My Fonts");
          showToast(`Added "${rawName}"`);
        } catch {
          showToast(`Couldn't load "${file.name}"`);
        }
      }
    },
    [showToast, selectFont]
  );

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeCustomFont = (id: string) => {
    setCustomFonts((prev) => prev.filter((f) => f.id !== id));
    setFavoriteIds((prev) => prev.filter((fid) => fid !== id));
    setRecentIds((prev) => prev.filter((fid) => fid !== id));
    setLayers((prev) => prev.map((l) => (l.fontId === id ? { ...l, fontId: BUILTIN_FONTS[0].id } : l)));
  };

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev]));
  }, []);

  // ---------- Whole-window drag & drop for font files ----------
  useEffect(() => {
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types || []).includes("Files");
    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      setIsDragging(true);
    };
    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
    };
    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setIsDragging(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragging(false);
      if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files);
    };
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
    };
  }, [handleFiles]);

  // ---------- Layer management ----------
  const addLayer = () => {
    const base = activeLayer || layers[0];
    const nl = makeLayer({
      x: clamp((base?.x ?? 50) + 6, 8, 92),
      y: clamp((base?.y ?? 50) + 6, 8, 92),
      text: "New Text",
    });
    setLayers((prev) => [...prev, nl]);
    setActiveLayerId(nl.id);
  };
  const duplicateLayer = (id: string) => {
    const src = layers.find((l) => l.id === id);
    if (!src) return;
    const idx = layers.findIndex((l) => l.id === id);
    const copy: TextLayer = { ...src, id: makeLayer().id, x: clamp(src.x + 4, 4, 96), y: clamp(src.y + 4, 4, 96) };
    setLayers((prev) => [...prev.slice(0, idx + 1), copy, ...prev.slice(idx + 1)]);
    setActiveLayerId(copy.id);
  };
  const deleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    const idx = layers.findIndex((l) => l.id === id);
    const next = layers.filter((l) => l.id !== id);
    setLayers(next);
    if (activeLayerId === id) setActiveLayerId(next[Math.max(0, idx - 1)].id);
  };
  const moveLayer = (id: string, dir: 1 | -1) => {
    const idx = layers.findIndex((l) => l.id === id);
    const swapWith = idx + dir;
    if (swapWith < 0 || swapWith >= layers.length) return;
    const next = [...layers];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setLayers(next);
  };

  // ---------- Templates & presets ----------
  const applyTemplate = (t: StyleTemplate) => {
    updateActiveLayer({
      fontId: t.fontId,
      fontColor: t.fontColor,
      outlineOn: !!t.outlineOn,
      outlineWidth: t.outlineWidth ?? 4,
      outlineColor: t.outlineColor ?? "#000000",
      shadowOn: !!t.shadowOn,
      shadowX: t.shadowX ?? 4,
      shadowY: t.shadowY ?? 4,
      shadowBlur: t.shadowBlur ?? 6,
      shadowOpacity: t.shadowOpacity ?? 0.5,
      shadowColor: t.shadowColor ?? "#000000",
    });
    setRecentIds((prev) => [t.fontId, ...prev.filter((x) => x !== t.fontId)].slice(0, 10));
    showToast(`Applied "${t.name}"`);
  };
  const savePreset = () => {
    if (!activeLayer?.text.trim()) return;
    const id = `preset-${Date.now()}`;
    setTextPresets((prev) => [{ id, text: activeLayer.text }, ...prev].slice(0, 30));
    showToast("Phrase saved");
  };
  const deletePreset = (id: string) => setTextPresets((prev) => prev.filter((p) => p.id !== id));

  // ---------- Background image upload ----------
  const onBgImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgImage(reader.result as string);
      setBgMode("image");
      showToast("Background image added");
    };
    reader.readAsDataURL(file);
  };

  // ---------- Filtered font list (favorites pinned to top) ----------
  const filteredFonts = allFonts
    .filter((f) => {
      const matchesCategory = category === "All" || f.category === category;
      const matchesQuery = f.name.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => (favoriteIds.includes(b.id) ? 1 : 0) - (favoriteIds.includes(a.id) ? 1 : 0));

  const recentFonts = recentIds.map((id) => allFonts.find((f) => f.id === id)).filter(Boolean) as FontDef[];

  // ---------- Preview drag-to-reposition ----------
  useEffect(() => {
    if (!draggingLayerId) return;
    const onMove = (e: PointerEvent | TouchEvent) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as PointerEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as PointerEvent).clientY;
      const fx = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
      const fy = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
      setLayers((prev) => prev.map((l) => (l.id === draggingLayerId ? { ...l, x: fx, y: fy } : l)));
    };
    const onUp = () => setDraggingLayerId(null);
    window.addEventListener("pointermove", onMove as EventListener);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("touchmove", onMove as EventListener, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove as EventListener);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("touchmove", onMove as EventListener);
      window.removeEventListener("touchend", onUp);
    };
  }, [draggingLayerId]);

  // ---------- Curved-layer overlay canvas (live preview) ----------
  const curvedLayers = layers.filter((l) => l.curve !== 0);
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const overlayScale = Math.min(1, 1200 / Math.max(canvasWidth, canvasHeight));
    canvas.width = Math.max(1, Math.round(canvasWidth * overlayScale));
    canvas.height = Math.max(1, Math.round(canvasHeight * overlayScale));
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(overlayScale, overlayScale);
    curvedLayers.forEach(async (layer) => {
      const font = allFonts.find((f) => f.id === layer.fontId) || BUILTIN_FONTS[0];
      const px = (layer.x / 100) * canvasWidth;
      const py = (layer.y / 100) * canvasHeight;
      const { renderLayerOnCtx } = await import("@/lib/canvasRender");
      renderLayerOnCtx(ctx, layer, font.cssFamily, px, py);
    });
    ctx.restore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(curvedLayers), canvasWidth, canvasHeight, allFonts, fontsReady]);

  const onOverlayPointerDown = (e: React.PointerEvent) => {
    if (compareMode || !previewRef.current || curvedLayers.length === 0) return;
    const rect = previewRef.current.getBoundingClientRect();
    const fx = ((e.clientX - rect.left) / rect.width) * 100;
    const fy = ((e.clientY - rect.top) / rect.height) * 100;
    let closest: TextLayer | null = null;
    let closestDist = Infinity;
    curvedLayers.forEach((l) => {
      const d = Math.hypot(l.x - fx, l.y - fy);
      if (d < closestDist) {
        closestDist = d;
        closest = l;
      }
    });
    if (closest && closestDist < 18) {
      setActiveLayerId((closest as TextLayer).id);
      setDraggingLayerId((closest as TextLayer).id);
    }
  };

  // ---------- Export ----------
  const buildSettings = useCallback(
    () => ({
      canvasWidth,
      canvasHeight,
      bgMode,
      bgColor,
      bgImage,
      dpi,
      watermarkOn,
      watermarkText,
      watermarkOpacity,
    }),
    [canvasWidth, canvasHeight, bgMode, bgColor, bgImage, dpi, watermarkOn, watermarkText, watermarkOpacity]
  );

  const ensureFontsLoaded = useCallback(async () => {
    for (const layer of layers) {
      const font = allFonts.find((f) => f.id === layer.fontId) || BUILTIN_FONTS[0];
      await document.fonts.load(`${layer.fontSize}px ${font.cssFamily}`);
    }
  }, [layers, allFonts]);

  const handleDownload = useCallback(async () => {
    if (!layers.some((l) => l.text.trim())) {
      showToast("Type some text first");
      return;
    }
    setIsExporting(true);
    try {
      await ensureFontsLoaded();
      const settings = buildSettings();
      if (exportFormat === "svg") {
        const { hasCurved, hasBuiltinFallback } = await exportSVG(layers, allFonts, settings, svgMode);
        if (hasCurved) showToast("Note: curved layers export as straight text in SVG");
        else if (hasBuiltinFallback) showToast("Note: built-in fonts export as editable text, not outlines");
        else showToast("SVG saved");
      } else {
        await exportPNG(layers, allFonts, settings);
        showToast(`PNG saved (${dpi} DPI)`);
      }
    } catch {
      showToast("Export failed — try again");
    } finally {
      setIsExporting(false);
    }
  }, [layers, allFonts, exportFormat, svgMode, dpi, buildSettings, ensureFontsLoaded, showToast]);

  const handleCopyImage = useCallback(async () => {
    if (!layers.some((l) => l.text.trim())) {
      showToast("Type some text first");
      return;
    }
    setIsCopying(true);
    try {
      await ensureFontsLoaded();
      await copyPngToClipboard(layers, allFonts, buildSettings());
      showToast("Image copied to clipboard");
    } catch {
      showToast("Couldn't copy — your browser may not support this");
    } finally {
      setIsCopying(false);
    }
  }, [layers, allFonts, buildSettings, ensureFontsLoaded, showToast]);

  // ---------- Keyboard shortcuts ----------
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "s") {
        e.preventDefault();
        handleDownload();
      } else if (key === "o") {
        e.preventDefault();
        fileInputRef.current?.click();
      } else if (e.key === "Enter") {
        e.preventDefault();
        showToast("Preview refreshed");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleDownload, showToast]);

  return {
    // state
    layers,
    activeLayer: activeLayer!,
    activeLayerId,
    draggingLayerId,
    canvasWidth,
    canvasHeight,
    bgMode,
    bgColor,
    bgImage,
    dpi,
    exportFormat,
    svgMode,
    watermarkOn,
    watermarkText,
    watermarkOpacity,
    category,
    query,
    allFonts,
    fontsReady,
    isDragging,
    isExporting,
    isCopying,
    toast,
    compareMode,
    previewZoom,
    favoriteIds,
    recentIds,
    textPresets,
    filteredFonts,
    recentFonts,
    curvedLayers,
    // refs
    fileInputRef,
    bgImageInputRef,
    previewRef,
    overlayCanvasRef,
    // setters
    setActiveLayerId,
    setDraggingLayerId,
    setCanvasWidth,
    setCanvasHeight,
    setBgMode,
    setBgColor,
    setBgImage,
    setDpi,
    setExportFormat,
    setSvgMode,
    setWatermarkOn,
    setWatermarkText,
    setWatermarkOpacity,
    setCategory,
    setQuery,
    setCompareMode,
    setPreviewZoom,
    // actions
    updateActiveLayer,
    selectFont,
    onFileInputChange,
    removeCustomFont,
    toggleFavorite,
    addLayer,
    duplicateLayer,
    deleteLayer,
    moveLayer,
    applyTemplate,
    savePreset,
    deletePreset,
    onBgImageChange,
    onOverlayPointerDown,
    handleDownload,
    handleCopyImage,
    showToast,
  };
}

export type TextStampState = ReturnType<typeof useTextStamp>;
