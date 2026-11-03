import { useGame } from "../game/GameContext.js";

export default function Ending({ active }) {
  const { team, ending } = useGame();
  return (
    <section className={`screen${active ? " active" : ""}`} id="end">
      <div>
        <div className="kicker">All three rooms solved</div>
        {ending && (
          <>
            <h2>{ending.headline.before}<span>{ending.headline.highlight}</span>{ending.headline.after}</h2>
            <p>{ending.story}</p>
            <div className="code">{ending.phrase}</div>
          </>
        )}
        <div className="kicker" id="endTeam" style={{ marginTop: "22px" }}>{team ? `TEAM ${team}` : ""}</div>
        <p style={{ fontSize: "14px", marginTop: "18px" }}>Give this phrase to the Arena organizers.</p>
      </div>
    </section>
  );
}
