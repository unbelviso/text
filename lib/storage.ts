import localforage from "localforage";
import { FontDef, TextPreset } from "./types";

const store = localforage.createInstance({
  name: "textstamp",
  storeName: "textstamp_data",
});

const KEYS = {
  favorites: "favorites",
  recent: "recent",
  textPresets: "text-presets",
  customFonts: "custom-fonts",
} as const;

export interface StoredCustomFont {
  id: string;
  name: string;
  familyName: string;
  base64: string;
}

export async function loadFavorites(): Promise<string[]> {
  return (await store.getItem<string[]>(KEYS.favorites)) || [];
}
export async function saveFavorites(ids: string[]): Promise<void> {
  await store.setItem(KEYS.favorites, ids);
}

export async function loadRecent(): Promise<string[]> {
  return (await store.getItem<string[]>(KEYS.recent)) || [];
}
export async function saveRecent(ids: string[]): Promise<void> {
  await store.setItem(KEYS.recent, ids);
}

export async function loadTextPresets(): Promise<TextPreset[]> {
  return (await store.getItem<TextPreset[]>(KEYS.textPresets)) || [];
}
export async function saveTextPresets(presets: TextPreset[]): Promise<void> {
  await store.setItem(KEYS.textPresets, presets);
}

export async function loadCustomFonts(): Promise<StoredCustomFont[]> {
  return (await store.getItem<StoredCustomFont[]>(KEYS.customFonts)) || [];
}
export async function saveCustomFonts(fonts: FontDef[]): Promise<void> {
  const toSave: StoredCustomFont[] = fonts.map((f) => ({
    id: f.id,
    name: f.name,
    familyName: f.familyName || "",
    base64: f.base64 || "",
  }));
  await store.setItem(KEYS.customFonts, toSave);
}
