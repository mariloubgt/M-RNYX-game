import { memo, useEffect } from "react";
import AnswerBar from "../../components/AnswerBar.jsx";
import { initSeanceScene } from "./seanceScene.js";

// Room II. React renders the static scene once; seanceScene.js drives the board and camera.
export default memo(function SeanceRoom({ active }) {
  useEffect(() => initSeanceScene(), []);
  return (
    <section className={`screen${active ? " active" : ""}`} id="seance">
      <div className="seance-head">
        <h2>II · The Séance Room</h2>
        <p>Camera 2 · basement. Ask the spirit, then watch the planchette.</p>
      </div>
      <div className="nv-cam" id="nvCam">
        <div className="nv-world" id="nvWorld">
          <div className="nv-table"></div>
          <div className="candle nv-c1" id="c1">
            <div className="glow"></div>
            <div className="wick"></div>
            <div className="flame"></div>
            <div className="smoke"></div>
            <div className="wax"></div>
          </div>
          <div className="candle nv-c2" id="c2">
            <div className="glow"></div>
            <div className="wick"></div>
            <div className="flame"></div>
            <div className="smoke"></div>
            <div className="wax"></div>
          </div>
          <div className="ob-stage">
            <div className="ob-board" id="board">
              <div className="ob-grain"></div>
              <svg className="ob-art ob-sun" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="17" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="5" strokeLinecap="round">
                  <line x1="50" y1="6" x2="50" y2="22" />
                  <line x1="50" y1="78" x2="50" y2="94" />
                  <line x1="6" y1="50" x2="22" y2="50" />
                  <line x1="78" y1="50" x2="94" y2="50" />
                  <line x1="19" y1="19" x2="30" y2="30" />
                  <line x1="70" y1="70" x2="81" y2="81" />
                  <line x1="81" y1="19" x2="70" y2="30" />
                  <line x1="19" y1="81" x2="30" y2="70" />
                </g>
                <circle cx="44" cy="46" r="2.4" fill="#d9ceb4" />
                <circle cx="56" cy="46" r="2.4" fill="#d9ceb4" />
                <path d="M42 56Q50 61 58 56" stroke="#d9ceb4" strokeWidth="2.2" fill="none" />
              </svg>
              {" "}
              <svg className="ob-art ob-moon" viewBox="0 0 100 100">
                <path d="M64 8a43 43 0 1 0 28 70A35 35 0 0 1 64 8z" fill="currentColor" />
                <path d="M30 30l3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z" fill="currentColor" />
              </svg>
              <div className="ob-title">SPIRIT · BOARD</div>
              <div className="ob-sub">— the dead will answer —</div>
              <div className="ob-plan" id="planchette">
                <svg viewBox="0 0 100 124">
                  <defs>
                    <radialGradient id="pBody" cx="45%" cy="35%" r="75%">
                      <stop offset="0" stopColor="#f4ecd8" />
                      <stop offset=".7" stopColor="#d5c8a8" />
                      <stop offset="1" stopColor="#a8987a" />
                    </radialGradient>
                    <radialGradient id="pLens" cx="38%" cy="32%" r="70%">
                      <stop offset="0" stopColor="#fff" stopOpacity=".35" />
                      <stop offset=".45" stopColor="#fff" stopOpacity=".03" />
                      <stop offset="1" stopColor="#000" stopOpacity=".12" />
                    </radialGradient>
                  </defs>
                  <path fillRule="evenodd" d="M50 3C84 3 99 34 94 63C88 95 64 116 50 121C36 116 12 95 6 63C1 34 16 3 50 3Z M50 31a17 17 0 1 0 0.01 0Z" fill="url(#pBody)" stroke="#6b5c43" strokeWidth="2" />
                  <path d="M50 11C78 11 90 37 86 62C81 89 62 106 50 110C38 106 19 89 14 62C10 37 22 11 50 11Z" fill="none" stroke="#8d7c5e" strokeWidth="1" opacity=".7" />
                  <circle cx="50" cy="48" r="17" fill="url(#pLens)" stroke="#7b7b78" strokeWidth="3.2" />
                  <circle cx="50" cy="48" r="17" fill="none" stroke="#d8d8d4" strokeWidth="1" opacity=".7" />
                  <path d="M40 40a13 13 0 0 1 10-6" stroke="#fff" strokeWidth="2.2" opacity=".7" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="nv-tint"></div>
          <div className="nv-dim"></div>
          <div className="nv-ir"></div>
          <div className="nv-noise" id="nvNoise"></div>
          <div className="nv-scan"></div>
          <div className="nv-static" id="nvStatic"></div>
        </div>
      </div>
      <div className="controls">
        <div className="asks">
          <button className="ask" data-q="0">"Is anyone there?"</button>
          {" "}
          <button className="ask" data-q="1">"What happened to you?"</button>
        </div>
        <div className="transcript">
          <div className="t-hd">THE MEDIUM'S NOTES</div>
          <div className="t-body" id="tbody"></div>
        </div>
      </div>
      <AnswerBar room="seance" label="What did the spirit tell you?" placeholder="THE SPIRIT'S MESSAGE" submitLabel="ANSWER" />
      <div className="nv-hud">
        <span className="hud-rec"><i></i>REC</span>
        {" "}
        <span className="hud-mode">IR · NIGHT SHOT</span>
        {" "}
        <span className="hud-time" id="hudTime">NOV 02 1953 · 03:12:40 AM</span>
        {" "}
        <span className="hud-bat"><b></b>LOW</span>
        {" "}
        <i className="hud-c tl"></i>
        <i className="hud-c tr"></i>
        <i className="hud-c bl"></i>
        <i className="hud-c br"></i>
        {" "}
        <span className="hud-cross"></span>
      </div>
    </section>
  );
});
