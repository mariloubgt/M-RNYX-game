export default function TitleScreen({ visible, onOpen }) {
  return (
    <div className={`title-screen${visible ? "" : " off"}`} id="titleScreen" onClick={onOpen}>
      <div className="ts-kicker">NCS CLUB PRESENTS</div>
      <div className="ts-logo">ARENA</div>
      <div className="ts-sub">THE MANSION</div>
      <div className="ts-press">PRESS ANY KEY TO START</div>
    </div>
  );
}
