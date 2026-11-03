import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameContext, ROOMS } from "./GameContext.js";
import { thud } from "./audio.js";
import { decryptEnding } from "./endingCrypto.js";
import { ENDING_CIPHER } from "./endingCipher.js";

const SCREENS = ["intro", ...ROOMS, "end"];

const initialScreen = () => {
  const id = location.hash.slice(1);
  return ROOMS.includes(id) ? id : "intro";
};

export function GameProvider({ children }) {
  const [screen, setScreen] = useState(initialScreen);
  const [solved, setSolved] = useState({ ward: false, seance: false, store: false });
  const [team, setTeam] = useState("");
  const [blackout, setBlackout] = useState(false);
  const [ending, setEnding] = useState(null);

  // Read by show() and the hash listener, which must see the latest values immediately.
  const solvedRef = useRef(solved);
  const currentRef = useRef(screen);
  const answersRef = useRef({});

  const show = useCallback((requested) => {
    let id = SCREENS.includes(requested) ? requested : "intro";
    if (id === "end" && !ROOMS.every((room) => solvedRef.current[room])) id = "intro";
    currentRef.current = id;
    setScreen(id);
    window.scrollTo(0, 0);
    if (id === "end") thud();
    try {
      if (location.hash.slice(1) !== id && id !== "intro") location.hash = id;
    } catch {
      // some sandboxed previews forbid changing the address bar
    }
  }, []);

  const goBack = useCallback(() => {
    show("intro");
    try {
      if (location.hash) location.hash = "";
    } catch {
      // see show()
    }
  }, [show]);

  const markSolved = useCallback((room, answer) => {
    solvedRef.current = { ...solvedRef.current, [room]: true };
    setSolved(solvedRef.current);
    answersRef.current[room] = answer;
    // The three correct answers are the key to the ending.
    if (ROOMS.every((id) => answersRef.current[id])) {
      setEnding(decryptEnding(answersRef.current, ENDING_CIPHER));
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const id = location.hash.slice(1) || "intro";
      if (id !== currentRef.current) show(id);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [show]);

  const value = useMemo(
    () => ({
      screen,
      solved,
      allSolved: ROOMS.every((room) => solved[room]),
      ending,
      team,
      setTeam,
      blackout,
      setBlackout,
      show,
      goBack,
      markSolved,
    }),
    [screen, solved, ending, team, blackout, show, goBack, markSolved],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
