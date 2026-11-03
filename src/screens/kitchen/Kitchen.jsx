import { memo, useEffect } from "react";
import AnswerBar from "../../components/AnswerBar.jsx";
import Notebook from "./Notebook.jsx";
import { initKitchenScene } from "./kitchenScene.js";

// Room III. React renders the static scene once; kitchenScene.js drives the
// cupboards, draggable objects, notes and poltergeist events.
export default memo(function Kitchen({ active }) {
  useEffect(() => initKitchenScene(), []);
  return (
    <>
      <section className={`screen${active ? " active" : ""}`} id="store">
        <div className="store-head">
          <h2>III · The Kitchen</h2>
          <p>The Warden left his mark at every stop of his night rounds. Open things. Move things.</p>
        </div>
        <div className="k-scene" id="kScene">
          <div className="k-base" id="kBase"></div>
          <div className="k-slamwrap" id="kSlamWrap">
            <div className="k-eyes" id="kEyes">
              <i></i>
              <i></i>
            </div>
            <div className="k-slam" id="kSlam"></div>
          </div>
          <div className="k-winshadow" id="kWinShadow">
            <div></div>
          </div>
          <div className="k-write" id="kWrite">HE IS STILL<br />HERE</div>
          <div id="kItems"></div>
          <div className="k-candles" id="kCandles"></div>
          <div className="k-seal" id="kSeal"></div>
          <div className="k-vignette"></div>
          <div className="k-flicker" id="kFlicker"></div>
        </div>
        <AnswerBar room="store" label="Who buried Silas?" placeholder="ONE WORD" submitLabel="NAME HIM" />
        <button className="nb-icon" id="nbIcon" title="Your notes" aria-label="Open your notes">
          <svg viewBox="0 0 64 72">
            <defs>
              <linearGradient id="nbLeather" x1="0" x2="1">
                <stop offset="0" stopColor="#3b2416" />
                <stop offset=".5" stopColor="#5a3823" />
                <stop offset="1" stopColor="#2e1b10" />
              </linearGradient>
            </defs>
            <rect x="10" y="4" width="48" height="64" rx="4" fill="url(#nbLeather)" stroke="#1a0f08" strokeWidth="2" />
            <rect x="14" y="8" width="40" height="56" rx="2" fill="none" stroke="#8a6a46" strokeWidth="1" strokeDasharray="2 2" />
            <rect x="6" y="12" width="9" height="4" rx="2" fill="#c9c2b4" />
            <rect x="6" y="24" width="9" height="4" rx="2" fill="#c9c2b4" />
            <rect x="6" y="36" width="9" height="4" rx="2" fill="#c9c2b4" />
            <rect x="6" y="48" width="9" height="4" rx="2" fill="#c9c2b4" />
            <rect x="6" y="60" width="9" height="4" rx="2" fill="#c9c2b4" />
            <rect x="24" y="24" width="24" height="12" fill="#e8dfc8" opacity=".85" />
            <path d="M27 29h18M27 32h12" stroke="#5a3823" strokeWidth="1.2" />
          </svg>
          {" "}
          <b className="nb-count" id="nbCount">0</b>
        </button>
        <div className="r3-tip" id="r3tip">CLICK DOORS AND DRAWERS TO OPEN THEM · DRAG THINGS ASIDE · CLICK PAPERS TO READ</div>
      </section>
      <Notebook />
    </>
  );
});
