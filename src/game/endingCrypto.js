import { sha256Bytes } from "./sha256.js";

// Encrypts the ending with a key derived from the three correct answers, so the final
// phrase isn't readable in the bundle. Built only on sha256Bytes (HMAC-SHA256 in counter
// mode, with an authentication tag) because crypto.subtle doesn't exist over plain HTTP.
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const concat = (...parts) => {
  const out = new Uint8Array(parts.reduce((total, part) => total + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
};

const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
const fromHex = (hex) => Uint8Array.from(hex.match(/../g) ?? [], (pair) => parseInt(pair, 16));

// The key is always a 32-byte hash here, so it never needs shortening.
function hmac(key, message) {
  const inner = new Uint8Array(64).fill(0x36);
  const outer = new Uint8Array(64).fill(0x5c);
  key.forEach((byte, i) => {
    inner[i] ^= byte;
    outer[i] ^= byte;
  });
  return sha256Bytes(concat(outer, sha256Bytes(concat(inner, message))));
}

function deriveKeys(answers, salt) {
  const secret = sha256Bytes(encoder.encode(`${answers.ward}|${answers.seance}|${answers.store}`));
  return {
    cipherKey: hmac(secret, concat(salt, encoder.encode("cipher"))),
    tagKey: hmac(secret, concat(salt, encoder.encode("tag"))),
  };
}

function applyKeystream(key, data) {
  const out = new Uint8Array(data.length);
  for (let block = 0; block * 32 < data.length; block++) {
    const counter = new Uint8Array(4);
    new DataView(counter.buffer).setUint32(0, block);
    const stream = hmac(key, counter);
    for (let i = block * 32; i < Math.min(data.length, (block + 1) * 32); i++) {
      out[i] = data[i] ^ stream[i - block * 32];
    }
  }
  return out;
}

export function encryptEnding(answers, ending, salt) {
  const { cipherKey, tagKey } = deriveKeys(answers, salt);
  const data = applyKeystream(cipherKey, encoder.encode(JSON.stringify(ending)));
  return { salt: toHex(salt), data: toHex(data), tag: toHex(hmac(tagKey, data)) };
}

// Returns the ending, or null if these aren't the right answers.
export function decryptEnding(answers, cipher) {
  const salt = fromHex(cipher.salt);
  const data = fromHex(cipher.data);
  const { cipherKey, tagKey } = deriveKeys(answers, salt);
  if (toHex(hmac(tagKey, data)) !== cipher.tag) return null;
  return JSON.parse(decoder.decode(applyKeystream(cipherKey, data)));
}
