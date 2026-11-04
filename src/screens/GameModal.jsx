import { useEffect, useRef, useState } from "react";
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

// 2 to 24 characters after trimming, with at least one letter or digit in any alphabet.
function isValidTeamName(name) {
  const length = [...name].length;
  return length >= 2 && length <= 24 && /[\p{L}\p{N}]/u.test(name);
}

function TeamForm({ onDone, onCancel }) {
  const { team, setTeam } = useGame();
  const inputRef = useRef(null);
  const [value, setValue] = useState(team);
  const [triedInvalid, setTriedInvalid] = useState(false);
  const name = value.trim().toUpperCase();
  const valid = isValidTeamName(name);

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, []);

  const submit = () => {
    if (!valid) {
      setTriedInvalid(true);
      inputRef.current.focus();
      return;
    }
    setTeam(name);
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
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.stopPropagation();
            // Holding Enter on START GAME must not count as a submit once the input has focus.
            if (!e.repeat) submit();
          } else if (e.key === "Escape") {
            onCancel();
          }
        }}
      />
      {triedInvalid && !valid && (
        <div className="gm-error" id="teamError" role="alert">Please enter your team name (2-24 characters).</div>
      )}
      <div className="gm-actions">
        {/* aria-disabled, not disabled: a disabled button ignores clicks, and a click here has to show the error. */}
        <button className="btn" id="teamOk" aria-disabled={!valid} onClick={submit}>CONTINUE</button>
      </div>
    </>
  );
}

export default function GameModal({ name, open, required, onOpen, onClose, onTeamDone }) {
  return (
    <div
      className={`gmodal${open ? " on" : ""}`}
      id="gmodal"
      onMouseDown={(e) => {
        // Clicks around the team form leave the cursor in the input, so Enter keeps working.
        if (name === "team" && e.target.id !== "teamInput") e.preventDefault();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="gm-box">
        {!required && <button className="gm-close" id="gmClose" onClick={onClose}>✕</button>}
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
          {name === "team" && open && <TeamForm onDone={onTeamDone} onCancel={onClose} />}
        </div>
      </div>
    </div>
  );
}
