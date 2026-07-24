export type FontCategory =
  | "All"
  | "Cute"
  | "Pixel"
  | "Bold"
  | "Retro"
  | "Handwriting"
  | "My Fonts";

export interface FontDef {
  id: string;
  name: string;
  category: FontCategory;
  cssFamily: string;
  /** Google Fonts CSS2 family param, only present for built-in fonts */
  googleParam?: string;
  /** Only present for user-uploaded fonts */
  familyName?: string;
  /** Base64-encoded font binary, only present for user-uploaded fonts */
  base64?: string;
}

export type BgMode = "transparent" | "white" | "black" | "custom" | "image";
export type Align = "left" | "center" | "right";
export type TextCase = "none" | "upper" | "lower";
export type ExportFormat = "png" | "svg";

export interface TextLayer {
  id: string;
  text: string;
  fontId: string;
  fontSize: number;
  fontColor: string;
  /** 0-100, percentage position within the canvas */
  x: number;
  /** 0-100, percentage position within the canvas */
  y: number;
  rotation: number; // degrees
  curve: number; // -100..100, 0 = straight
  align: Align;
  letterSpacing: number; // px
  lineHeightMult: number; // 0.8 - 3
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textCase: TextCase;
  outlineOn: boolean;
  outlineWidth: number;
  outlineColor: string;
  shadowOn: boolean;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowOpacity: number;
  shadowColor: string;
}

export interface StyleTemplate {
  id: string;
  name: string;
  fontId: string;
  fontColor: string;
  outlineOn?: boolean;
  outlineWidth?: number;
  outlineColor?: string;
  shadowOn?: boolean;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowOpacity?: number;
  shadowColor?: string;
}

export interface CanvasPreset {
  name: string;
  w: number;
  h: number;
}

export interface TextPreset {
  id: string;
  text: string;
}
