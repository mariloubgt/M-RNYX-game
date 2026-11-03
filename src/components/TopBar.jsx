import { useGame } from "../game/GameContext.js";
import { toggleMute, useAudioState } from "../game/audio.js";

export default function TopBar() {
  const { screen, goBack } = useGame();
  const { muted, unavailable } = useAudioState();
  const label = unavailable ? "NO AUDIO" : muted ? "SOUND: OFF" : "SOUND: ON";
  return (
    <div className="topbar">
      <button className={`back${screen === "intro" ? " hidden" : ""}`} id="backBtn" onClick={goBack}>
        ← ELEVATOR
      </button>
      <button className="mute" id="muteBtn" onClick={toggleMute}>
        {label}
      </button>
    </div>
  );
}
