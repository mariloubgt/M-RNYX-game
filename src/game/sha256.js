// Plain-JavaScript SHA-256. Browsers only offer crypto.subtle on HTTPS and localhost,
// so this keeps the game working over plain HTTP on the event's local network.
const K = new Uint32Array(64);
{
  const isPrime = (n) => {
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  };
  for (let n = 2, i = 0; i < 64; n++) {
    if (isPrime(n)) {
      const root = Math.cbrt(n);
      K[i++] = ((root - Math.floor(root)) * 2 ** 32) >>> 0;
    }
  }
}

const rotr = (x, n) => (x >>> n) | (x << (32 - n));

export function sha256Bytes(bytes) {
  const h = new Uint32Array([
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ]);
  const paddedLength = (((bytes.length + 8) >> 6) + 1) * 64;
  const data = new Uint8Array(paddedLength);
  data.set(bytes);
  data[bytes.length] = 0x80;
  const view = new DataView(data.buffer);
  view.setUint32(paddedLength - 8, Math.floor((bytes.length * 8) / 2 ** 32));
  view.setUint32(paddedLength - 4, (bytes.length * 8) >>> 0);

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(offset + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, i] = h;
    for (let t = 0; t < 64; t++) {
      const t1 = (i + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) | 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      i = g;
      g = f;
      f = e;
      e = (d + t1) | 0;
      d = c;
      c = b;
      b = a;
      a = (t1 + t2) | 0;
    }
    [a, b, c, d, e, f, g, i].forEach((value, index) => {
      h[index] = (h[index] + value) | 0;
    });
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  h.forEach((value, index) => outView.setUint32(index * 4, value));
  return out;
}

const toHex = (bytes) => [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  if (globalThis.crypto?.subtle) {
    return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)));
  }
  return toHex(sha256Bytes(bytes));
}
