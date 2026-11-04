// Every page load is a new game: nothing in the address bar or browser storage decides
// where it starts. Older versions of the game saved these keys.
const OLD_STORAGE_KEYS = ["arena:finished"];

export function startFresh() {
  try {
    // Only the dev server keeps the query, so a reload stays on the ?dev= room.
    history.replaceState(null, "", location.pathname + (import.meta.env.DEV ? location.search : ""));
  } catch {
    // some sandboxed previews forbid changing the address bar
  }
  for (const key of OLD_STORAGE_KEYS) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // storage blocked, so nothing can have been saved there
    }
  }
}

// Testing only: ?dev=ward, ?dev=seance, ?dev=store or ?dev=end on the dev server. The check
// is on import.meta.env.DEV, so this is always null on the deployed site.
const DEV_SCREENS = ["ward", "seance", "store", "end"];

export function devScreen() {
  if (!import.meta.env.DEV) return null;
  const id = new URLSearchParams(location.search).get("dev");
  return DEV_SCREENS.includes(id) ? id : null;
}

// The ending can only be decrypted with the answers, which the dev server can read from the
// gitignored secrets file. It's fetched rather than imported so it can't reach the bundle.
export async function devAnswers() {
  const response = await fetch("/secrets/ending.json");
  return (await response.json()).answers;
}
