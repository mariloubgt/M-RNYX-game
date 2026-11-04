import { useEffect, useRef, useState } from "react";
import { useGame } from "../../game/GameContext.js";
import { BASEMENT_IMAGE } from "../../game/media.js";
import { prepareBasement, runBasementScene } from "./basementScene.js";

// The floor reached after all three rooms: a short scare, then the final screen.
export default function Basement({ active }) {
  const { allSolved, ending, team } = useGame();
  const [showFinal, setShowFinal] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (allSolved) prepareBasement();
  }, [allSolved]);

  useEffect(() => {
    if (!active) return undefined;
    return runBasementScene(rootRef.current, () => setShowFinal(true));
  }, [active]);

  return (
    <section ref={rootRef} className={`screen${active ? " active" : ""}`} id="end">
      {showFinal ? (
        <div key="final" className="bm-final">
          <h2>THE END</h2>
          <div className="bm-phrase">{ending?.phrase}</div>
          {team && <div className="bm-team" id="endTeam">TEAM {team}</div>}
          <p>Show this screen to the organizers.</p>
        </div>
      ) : (
        // The key stops React reusing this div, and its hard-cut styles, for the final screen.
        <div key="scene" className="bm-scene">
          <div className="bm-shake">
            <div className="bm-face"></div>
            <div className="bm-vignette"></div>
            <div className="bm-flash"></div>
          </div>
          <div className="bm-black"></div>
          <div className="bm-room">
            <div className="bm-stage">
              <img src={BASEMENT_IMAGE} alt="" />
              <div className="bm-dim"></div>
              <div className="bm-glow l1"></div>
              <div className="bm-glow l2"></div>
              <div className="bm-off l1"></div>
              <div className="bm-off l2"></div>
            </div>
          </div>
          <div className="bm-door left"></div>
          <div className="bm-door right"></div>
        </div>
      )}
    </section>
  );
}
