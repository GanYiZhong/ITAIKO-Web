import type { PS4AuthBackupData } from "@/types";

export interface Ps4AuthInputData {
  keyPemText: string;
  serialText: string;
  signatureBytes: Uint8Array;
}

export interface Ps4AuthGeneratedData {
  serialBytes: Uint8Array;
  signatureBytes: Uint8Array;
  keyPemText: string;
}

function hexByte(value: number): string {
  return `0x${value.toString(16).toUpperCase().padStart(2, "0")}`;
}

function parseHexLikePython(value: string): Uint8Array {
  const compact = value.replace(/\s+/g, "");

  if (compact.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(compact)) {
    throw new Error("'serial.txt' invalid, must be valid hex.");
  }

  const bytes = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) {
    bytes[i / 2] = parseInt(compact.slice(i, i + 2), 16);
  }

  return bytes;
}

function hexToBytes(hex: string, fieldName: string): Uint8Array {
  const compact = hex.replace(/\s+/g, "");
  if (compact.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(compact)) {
    throw new Error(`'${fieldName}' invalid, must be valid hex.`);
  }

  const out = new Uint8Array(compact.length / 2);
  for (let i = 0; i < compact.length; i += 2) {
    out[i / 2] = parseInt(compact.slice(i, i + 2), 16);
  }
  return out;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      const mask = (crc & 1) !== 0 ? 0xedb88320 : 0;
      crc = (crc >>> 1) ^ mask;
    }
  }

  return (~crc) >>> 0;
}

function decodeBase64(base64: string): Uint8Array {
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    out[i] = raw.charCodeAt(i);
  }
  return out;
}

function wrapHexTokens(tokens: string[], lineWidth: number): string[] {
  const lines: string[] = [];
  let currentLine = "";

  for (const token of tokens) {
    const candidate = currentLine ? `${currentLine}, ${token}` : token;

    if (currentLine && candidate.length > lineWidth) {
      lines.push(currentLine);
      currentLine = token;
      continue;
    }

    currentLine = candidate;
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

export function generatePs4AuthData(input: Ps4AuthInputData): Ps4AuthGeneratedData {
  const { keyPemText, serialText, signatureBytes } = input;

  if (!keyPemText) {
    throw new Error("'key.pem' invalid, cannot be empty.");
  }

  if (serialText.length > 32) {
    throw new Error("'serial.txt' invalid, must be shorter than 32.");
  }

  if (signatureBytes.length !== 256) {
    throw new Error("'sig.bin' invalid, size must be 256 bytes.");
  }

  // Mirrors generateAuthConfig.py: bytes.fromhex(serial.rjust(32, "0"))
  const serialBytes = parseHexLikePython(serialText.padStart(32, "0"));
  if (serialBytes.length !== 16) {
    throw new Error("'serial.txt' invalid, decoded size must be 16 bytes.");
  }

  return {
    serialBytes,
    signatureBytes,
    keyPemText,
  };
}

export function formatCArray(bytes: Uint8Array): string {
  return Array.from(bytes, hexByte).join(", ");
}

export function formatCArrayWrapped(bytes: Uint8Array, lineWidth: number = 115): string {
  const tokens = Array.from(bytes, hexByte);
  return wrapHexTokens(tokens, lineWidth).join("\n");
}

export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (value) => value.toString(16).toUpperCase().padStart(2, "0")).join("");
}

export function toBackupData(data: Ps4AuthGeneratedData): PS4AuthBackupData {
  return {
    serialHex: bytesToHex(data.serialBytes),
    signatureHex: bytesToHex(data.signatureBytes),
    keyPem: data.keyPemText,
  };
}

export function fromBackupData(data: PS4AuthBackupData): Ps4AuthGeneratedData {
  if (!data.keyPem) {
    throw new Error("'keyPem' invalid, cannot be empty.");
  }

  const serialBytes = hexToBytes(data.serialHex, "serialHex");
  const signatureBytes = hexToBytes(data.signatureHex, "signatureHex");

  if (serialBytes.length !== 16) {
    throw new Error("'serialHex' invalid, decoded size must be 16 bytes.");
  }

  if (signatureBytes.length !== 256) {
    throw new Error("'signatureHex' invalid, decoded size must be 256 bytes.");
  }

  return {
    serialBytes,
    signatureBytes,
    keyPemText: data.keyPem,
  };
}

export function buildPs4AuthUploadBundle(data: Ps4AuthGeneratedData): Uint8Array {
  const keyBytes = new TextEncoder().encode(data.keyPemText);
  const keyLen = keyBytes.length;

  if (keyLen === 0) {
    throw new Error("'key.pem' invalid, cannot be empty.");
  }

  const totalLen = 8 + 16 + 256 + keyLen + 4;
  const out = new Uint8Array(totalLen);
  const view = new DataView(out.buffer);

  out[0] = 0x50; // P
  out[1] = 0x41; // A
  out[2] = 0x4b; // K
  out[3] = 0x31; // 1
  view.setUint16(4, keyLen, true);
  view.setUint16(6, 1, true);

  out.set(data.serialBytes, 8);
  out.set(data.signatureBytes, 24);
  out.set(keyBytes, 280);

  const payload = out.subarray(0, totalLen - 4);
  view.setUint32(totalLen - 4, crc32(payload), true);

  return out;
}

export function parsePs4AuthExportResponse(response: string): PS4AuthBackupData | null {
  let status = 0;
  let serialHex = "";
  let signatureHex = "";
  let keyPemBase64 = "";

  const lines = response.split("\n");
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith("PS4_AUTH_STATUS:")) {
      status = parseInt(line.slice("PS4_AUTH_STATUS:".length), 10) || 0;
    } else if (line.startsWith("PS4_AUTH_SERIAL_HEX:")) {
      serialHex = line.slice("PS4_AUTH_SERIAL_HEX:".length).trim();
    } else if (line.startsWith("PS4_AUTH_SIGNATURE_HEX:")) {
      signatureHex = line.slice("PS4_AUTH_SIGNATURE_HEX:".length).trim();
    } else if (line.startsWith("PS4_AUTH_KEY_PEM_BASE64:")) {
      keyPemBase64 = line.slice("PS4_AUTH_KEY_PEM_BASE64:".length).trim();
    }
  }

  if (status !== 1) {
    return null;
  }

  if (!serialHex || !signatureHex || !keyPemBase64) {
    throw new Error("PS4 auth export response is incomplete.");
  }

  const keyPem = new TextDecoder().decode(decodeBase64(keyPemBase64));
  return { serialHex, signatureHex, keyPem };
}

export function buildPs4AuthDebugPreview(data: Ps4AuthGeneratedData): string {
  const serialHex = bytesToHex(data.serialBytes);
  const signatureHex = bytesToHex(data.signatureBytes);
  const signatureArrayWrapped = formatCArrayWrapped(data.signatureBytes);

  return [
    "// ITAIKO-Web PS4 Auth Debug Output",
    "",
    `serial_bytes_len=${data.serialBytes.length}`,
    `signature_bytes_len=${data.signatureBytes.length}`,
    `key_pem_chars_len=${data.keyPemText.length}`,
    "",
    `serial_hex=${serialHex}`,
    `signature_hex=${signatureHex}`,
    "",
    "serial_c_array={",
    `  ${formatCArray(data.serialBytes)}`,
    "}",
    "",
    "signature_c_array={",
    signatureArrayWrapped
      .split("\n")
      .map((line) => `  ${line}`)
      .join("\n"),
    "}",
    "",
    "key_pem=",
    data.keyPemText,
  ].join("\n");
}
