import { memo, useEffect } from "react";
import { initScares } from "../game/scares.js";

// The glitch and face-scare layers shared by the Ward and the Séance Room.
export default memo(function ScareOverlays() {
  useEffect(() => initScares(), []);
  return (
    <>
      <div className="glitch-fx" id="glitchFx">
        <div className="g-noise" id="gNoise"></div>
        <div className="g-scan"></div>
        <div className="g-bars" id="gBars"></div>
      </div>
      <div className="door-scare" id="doorScare">
        <div className="ds-rig ds-t2" id="dsT2"></div>
        <div className="ds-rig ds-t1" id="dsT1"></div>
        <div className="ds-rig" id="dsRig"></div>
      </div>
    </>
  );
});
