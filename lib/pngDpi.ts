/**
 * Injects a pHYs chunk into a PNG so that image editors (Photoshop,
 * Illustrator, print services) read back a real DPI value instead of
 * defaulting to 72/96. Canvas-generated PNGs have no DPI metadata at all —
 * this is the only way to make "300 DPI" etc. actually mean something to
 * downstream software, since <canvas> itself only ever produces pixels.
 */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

// Standard CRC32 implementation (PNG uses this for every chunk).
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u32(n: number): number[] {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff];
}

/** Builds a complete pHYs chunk (length + type + data + crc) for the given DPI. */
function buildPhysChunk(dpi: number): Uint8Array {
  const pixelsPerMeter = Math.round(dpi * 39.3701); // 1 inch = 0.0254m -> 1/0.0254 = 39.3701
  const type = [0x70, 0x48, 0x59, 0x73]; // "pHYs"
  const data = [...u32(pixelsPerMeter), ...u32(pixelsPerMeter), 0x01]; // x, y, unit=meter
  const crc = crc32(new Uint8Array([...type, ...data]));
  return new Uint8Array([...u32(data.length), ...type, ...data, ...u32(crc)]);
}

/**
 * Takes a PNG Blob (from canvas.toBlob) and returns a new Blob with a pHYs
 * chunk inserted right after IHDR, so the file carries real DPI metadata.
 */
export async function setPngDpi(pngBlob: Blob, dpi: number): Promise<Blob> {
  const buffer = new Uint8Array(await pngBlob.arrayBuffer());

  // Sanity-check the PNG signature; if it doesn't match, return the original.
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (buffer[i] !== PNG_SIGNATURE[i]) return pngBlob;
  }

  // IHDR is always the first chunk: 8 (sig) + 4 (length) + 4 (type) + 13 (data) + 4 (crc) = 33 bytes
  const ihdrEnd = 8 + 4 + 4 + 13 + 4;
  const physChunk = buildPhysChunk(dpi);

  const result = new Uint8Array(buffer.length + physChunk.length);
  result.set(buffer.subarray(0, ihdrEnd), 0);
  result.set(physChunk, ihdrEnd);
  result.set(buffer.subarray(ihdrEnd), ihdrEnd + physChunk.length);

  return new Blob([result], { type: "image/png" });
}
