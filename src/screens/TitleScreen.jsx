import GameTitle from "../components/GameTitle.jsx";

export default function TitleScreen({ visible, onOpen }) {
  return (
    <div className={`title-screen${visible ? "" : " off"}`} id="titleScreen" onClick={onOpen}>
      <div className="ts-kicker">NCS CLUB PRESENTS</div>
      <div className="ts-logo"><GameTitle /></div>
      <div className="ts-sub">some patients never left</div>
      <div className="ts-press">PRESS ANY KEY TO START</div>
    </div>
  );
}
