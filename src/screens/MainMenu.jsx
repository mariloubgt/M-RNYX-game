import { useGame } from "../game/GameContext.js";
import { MENU_ITEMS } from "./menuItems.js";

export default function MainMenu({ visible, selected, solvedCount, onSelect, onAct, onModal }) {
  const { team } = useGame();
  return (
    <div className={`menu-ui${visible ? " on" : ""}`} id="menuUI">
      <div className="hud-top">
        <div className="hud-logo">
          <span>ARENA</span>
          <small>THE MANSION</small>
        </div>
        <div className="hud-tabs">
          <span className="key">Q</span>
          <button className="tab active" data-modal="" onClick={() => onModal(null)}>Main Menu</button>
          <button className="tab" data-modal="howto" onClick={() => onModal("howto")}>How to Play</button>
          <button className="tab locked" data-modal="floors" onClick={() => onModal("floors")}>Floors <i>🔒</i></button>
          <span className="key">E</span>
        </div>
        <button className="hud-player" id="playerCard" title="Change team name" onClick={() => onModal("team")}>
          <span className="hp-text"><small>TEAM</small><b id="teamLabel">{team || "UNNAMED"}</b></span>
          <span className="hp-avatar">
            <svg viewBox="0 0 40 40">
              <circle cx="20" cy="15" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M7 36c2-8 8-11 13-11s11 3 13 11" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </span>
        </button>
      </div>

      <nav className="main-menu" id="mainMenu">
        {MENU_ITEMS.map((item, index) => (
          <button
            key={item.act}
            className={`mm-item${selected === index ? " sel" : ""}`}
            data-act={item.act}
            onMouseEnter={() => onSelect(index)}
            onClick={() => onAct(item.act)}
          >
            <span className="mm-arrow">▶</span>{item.label}
          </button>
        ))}
      </nav>

      <aside className="lore">
        <div className="lore-hd">⚠ ABOUT THE MANSION</div>
        <p>Nobody has crossed this gate since 1953. The mansion on the hill was once a hospital for the "incurable". The staff fled in one night and left everything behind, including one patient.</p>
        <p>Your team has one goal: get inside, ride the elevator, and find out what happened.</p>
      </aside>

      <div className="hud-bottom">
        <div className="progress">
          <div className="pg-label">FLOORS CLEARED <b id="pgCount">{solvedCount} / 3</b></div>
          <div className="pg-bar"><i id="pgFill" style={{ width: `${(solvedCount / 3) * 100}%` }}></i></div>
        </div>
        <div className="keys"><span className="key">↑↓</span> Navigate <span className="key">ENTER</span> Select <span className="key">M</span> Sound</div>
      </div>
      <div className="build">v0.9 · Arena build · Some content may disturb</div>
    </div>
  );
}
