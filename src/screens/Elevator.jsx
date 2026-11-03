import { useState } from "react";
import { useGame } from "../game/GameContext.js";
import { ding, hiss } from "../game/audio.js";

const FLOORS = [
  { id: "ward", number: "1", name: "The Ward" },
  { id: "seance", number: "2", name: "The Séance Room" },
  { id: "store", number: "3", name: "The Kitchen" },
];

// Inside the elevator: the floor panel that leads to each room and the basement.
export default function Elevator({ active }) {
  const { solved, allSolved, show, setBlackout } = useGame();
  const [riding, setRiding] = useState(false);
  const [pressed, setPressed] = useState(null);
  const [led, setLed] = useState("FLOOR · G");

  const ride = (id, number) => {
    if (riding) return;
    if (id === "end" && !allSolved) {
      hiss();
      return;
    }
    setRiding(true);
    setPressed(id);
    ding();
    setLed(`${id === "end" ? "▼ " : "▲ "}${number}`);
    setTimeout(() => setLed(`FLOOR · ${number}`), 900);
    setTimeout(() => setBlackout(true), 1300);
    setTimeout(() => {
      show(id);
      setPressed(null);
      setLed("FLOOR · G");
      setBlackout(false);
      setRiding(false);
    }, 2000);
  };

  const classes = ["screen", active && "active", riding && "ride"].filter(Boolean).join(" ");
  return (
    <section className={classes} id="intro">
      <div className="ceiling">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </div>
      <div className="rail"></div>
      <div className="tread"></div>
      <div className="blood"></div>
      <div className="lift-wrap">
        <div className="wall-note">
          <div className="wanna">WANNA<br />PLAY?</div>
          <div className="paper">St. Morrow's Asylum closed in 1953. The night staff left in a hurry, and one patient never left at all.<br /><br />Three floors are still open. Find out who is still here, what happened to him, and who did it.<br /><br />Choose a floor.</div>
        </div>
        <div className="panel">
          <span className="screw" style={{ left: "10px", top: "10px" }}></span><span className="screw" style={{ right: "10px", top: "10px" }}></span>
          <span className="screw" style={{ left: "10px", bottom: "10px" }}></span><span className="screw" style={{ right: "10px", bottom: "10px" }}></span>
          <div className="screen-led" id="led">{led}</div>
          {FLOORS.map(({ id, number, name }) => (
            <button
              key={id}
              className={["floor", solved[id] && "solved", pressed === id && "pressed"].filter(Boolean).join(" ")}
              data-floor={id}
              id={`card-${id}`}
              onClick={() => ride(id, number)}
            >
              <span className="fbtn">{number}</span>
              <span className="flabel">{name}<small id={`st-${id}`}>{solved[id] ? "◆ SOLVED" : "◇ UNSOLVED"}</small></span>
            </button>
          ))}
          <button
            className={["floor basement", allSolved && "show", pressed === "end" && "pressed"].filter(Boolean).join(" ")}
            data-floor="end"
            id="finalLink"
            onClick={() => ride("end", "B")}
          >
            <span className="fbtn">B</span>
            <span className="flabel">Basement<small>LOCKED · SOLVE ALL THREE</small></span>
          </button>
        </div>
      </div>
    </section>
  );
}
