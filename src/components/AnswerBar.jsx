import { useRef, useState } from "react";
import { useGame } from "../game/GameContext.js";
import { checkAnswer } from "../game/answers.js";
import { hiss, thud } from "../game/audio.js";

const SOLVED_MESSAGE = { ward: "The file was wrong. Something scratches behind the wall…", seance: "The candles flare up once. The spirit has been heard.", store: "Somewhere upstairs, a door slams shut." };
const WRONG_MESSAGES = ["Wrong. The lights shudder.", "No. Something laughs in the dark.", "That is not it."];

export default function AnswerBar({ room, label, placeholder, submitLabel }) {
  const { markSolved, show } = useGame();
  const inputRef = useRef(null);
  // `attempt` remounts the feedback line, which restarts its CSS animation.
  const [feedback, setFeedback] = useState({ attempt: 0, kind: "", text: "" });

  const onSubmit = async (event) => {
    event.preventDefault();
    const raw = inputRef.current.value;
    if (!raw.toUpperCase().replace(/[^A-Z]/g, "")) return;
    const answer = await checkAnswer(room, raw);
    if (answer) {
      setFeedback((f) => ({ attempt: f.attempt + 1, kind: "good", text: SOLVED_MESSAGE[room] }));
      markSolved(room, answer);
      thud();
      setTimeout(() => show("intro"), 2200);
    } else {
      const text = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
      setFeedback((f) => ({ attempt: f.attempt + 1, kind: "bad", text }));
      hiss();
    }
  };

  return (
    <div className="answer-bar">
      <form className="answer-inner" data-room={room} onSubmit={onSubmit}>
        <label>{label}</label>
        <input ref={inputRef} type="text" placeholder={placeholder} autoComplete="off" spellCheck="false" />
        <button className="btn" type="submit">
          {submitLabel}
        </button>
        <div key={feedback.attempt} className={`feedback${feedback.kind ? ` ${feedback.kind}` : ""}`}>
          {feedback.text}
        </div>
      </form>
    </div>
  );
}
