import { sha256Hex } from "./sha256.js";

// Answers are stored hashed, so DevTools won't give them away.
const HASH = {
  ward: "b596491a3a9db17e84e966e94ea58de854e1a436b204ac121786b5e19429faa9",
  seance: "7df10f9e2a7262fe5a9777077fcdfc48ad37abcc7147253d4a6f78a613cfbe0e",
  store: "2a9810adc29b4d011635adf7ef481150da69481723c7608ca96c2b87dfc23618",
};

const sha = (word) => sha256Hex(`asylum:${word}`);

// Returns the normalized answer if it is correct, otherwise null. Input is reduced to
// A-Z; either the whole input or just its first word may match.
export async function checkAnswer(room, raw) {
  const upper = raw.toUpperCase();
  const full = upper.replace(/[^A-Z]/g, "");
  const first = (upper.trim().split(/\s+/)[0] || "").replace(/[^A-Z]/g, "");
  if (!full) return null;
  if ((await sha(full)) === HASH[room]) return full;
  if ((await sha(first)) === HASH[room]) return first;
  return null;
}
