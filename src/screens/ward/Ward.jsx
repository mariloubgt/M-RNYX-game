import { memo, useEffect } from "react";
import { WARD_IMAGES } from "../../game/media.js";
import AnswerBar from "../../components/AnswerBar.jsx";
import { initWardScene } from "./wardScene.js";

// Room I. React renders the static scene once; wardScene.js drives the corridor,
// the doors and the woman, which depend on frame-by-frame timing.
export default memo(function Ward({ active }) {
  useEffect(() => initWardScene(), []);
  return (
    <section className={`screen${active ? " active" : ""}`} id="ward">
      <div className="ward-head">
        <h2>I · The Ward</h2>
        <p>The power is out. Check every cell door. Walk deeper when you are done.</p>
      </div>
      <div className="ward-stage">
        <div className="scene hallway" id="scene">
          <div className="hw-cam" id="hwCam">
            <div className="hw-bg" style={{ backgroundImage: `url(${WARD_IMAGES.corridor})` }}></div>
            <div className="lampglow" style={{ left: "47.6%", top: "17%", width: "12%", height: "17%" }}></div>
            <div className="lampglow" style={{ left: "52%", top: "28.4%", width: "6.8%", height: "9%" }}></div>
            <div className="lampglow" style={{ left: "53.6%", top: "34.4%", width: "4.2%", height: "5.4%" }}></div>
            <div className="hw-scrawl s1" data-sec="0">THEY COUNT IN<br />ONES AND ZEROS</div>
            <div className="hw-scrawl s2" data-sec="2">he is not in his room</div>
            <div id="hwDoors"></div>
            <button className="hw-paper" id="nursePaper" data-sec="0" aria-label="Read the note on the wall"></button>
            <div className="monster" id="monster">
              <div className="m-shadow"></div>
              <img src={WARD_IMAGES.woman} className="m-reflect" alt="" draggable="false" />
              <img src={WARD_IMAGES.woman} className="m-body" alt="" draggable="false" />
              <img src={WARD_IMAGES.woman} className="m-head" id="mHead" alt="" draggable="false" />
            </div>
          </div>
          <div className="beam-tint"></div>
          <div className="darkness"></div>
          <div className="hw-veil" id="hwVeil"></div>
          <div id="hwMarks"></div>
        </div>
      </div>
      <div className="closeup" id="closeup">
        <div className="cu-box" id="cuBox"></div>
      </div>
      <AnswerBar room="ward" label="Which patient is not where he belongs?" placeholder="PATIENT NAME" submitLabel="ACCUSE" />
      <button className="hw-walk fwd" id="walkFwd"><span>▲</span>WALK</button>
      <button className="hw-walk back" id="walkBack"><span>▼</span>BACK</button>
      <div className="hw-section" id="hwSection">SECTION 1 / 3</div>
      <div className="ward-tip" id="wardTip">MOVE YOUR LIGHT · CLICK A DOOR · WALK FORWARD</div>
    </section>
  );
});
