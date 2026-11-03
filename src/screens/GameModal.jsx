import { useEffect, useRef } from "react";
import { useGame } from "../game/GameContext.js";
import { toggleMute, useAudioState } from "../game/audio.js";

function HowTo() {
  return (
    <>
      <h3>How to Play</h3>
      <ol>
        <li>Ride the elevator. Each of the <b>3 floors</b> hides one puzzle.</li>
        <li>Look, move, click and listen. Everything on screen can be a clue.</li>
        <li>Each floor asks for <b>one answer</b>. Wrong answers cost nothing.</li>
        <li>Clear all three floors to open the <b>Basement</b> and get the final phrase.</li>
        <li>Give the final phrase to the Arena organizers.</li>
      </ol>
    </>
  );
}

function Settings({ onSoundToggle, onEditTeam }) {
  const { team } = useGame();
  const { muted } = useAudioState();
  return (
    <>
      <h3>Settings</h3>
      <div className="gm-row">SOUND <button className={`toggle${muted ? "" : " on"}`} id="setSound" onClick={onSoundToggle}>{muted ? "OFF" : "ON"}</button></div>
      <div className="gm-row">TEAM NAME <button className="toggle" id="setTeam" onClick={onEditTeam}>{team || "SET"}</button></div>
    </>
  );
}

function Credits() {
  return (
    <>
      <h3>Credits</h3>
      <p>Made by the <b>NCS Club</b> for <b>Arena</b>.</p>
      <p style={{ marginTop: "10px", color: "#9d9585" }}>Puzzle design, story and interface: the Arena organizing team.</p>
    </>
  );
}

function Floors() {
  return (
    <>
      <h3>Floors 🔒</h3>
      <p>The floors are only reachable from inside the elevator. Start the game first.</p>
    </>
  );
}

function TeamForm({ onDone }) {
  const { team, setTeam } = useGame();
  const inputRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, []);

  const done = (keep) => {
    if (keep) setTeam(inputRef.current.value.trim().toUpperCase().slice(0, 24));
    onDone();
  };

  return (
    <>
      <h3>Name your team</h3>
      <p style={{ color: "#9d9585" }}>This name appears at the end, next to your final phrase.</p>
      <input
        ref={inputRef}
        className="gm-input"
        id="teamInput"
        maxLength={24}
        placeholder="TEAM NAME"
        defaultValue={team}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            done(true);
          }
        }}
      />
      <div className="gm-actions">
        <button className="ghost" id="teamSkip" onClick={() => done(false)}>SKIP</button>
        <button className="btn" id="teamOk" onClick={() => done(true)}>CONTINUE</button>
      </div>
    </>
  );
}

export default function GameModal({ name, open, onOpen, onClose, onTeamDone }) {
  return (
    <div
      className={`gmodal${open ? " on" : ""}`}
      id="gmodal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gm-box">
        <button className="gm-close" id="gmClose" onClick={onClose}>✕</button>
        <div id="gmBody">
          {name === "howto" && <HowTo />}
          {name === "settings" && (
            <Settings
              onSoundToggle={() => {
                toggleMute();
                onOpen("settings");
              }}
              onEditTeam={() => onOpen("team", () => onOpen("settings"))}
            />
          )}
          {name === "credits" && <Credits />}
          {name === "floors" && <Floors />}
          {name === "team" && open && <TeamForm onDone={onTeamDone} />}
        </div>
      </div>
    </div>
  );
}
