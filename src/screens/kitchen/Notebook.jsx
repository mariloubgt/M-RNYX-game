// The notes book. kitchenScene.js fills in the pages as papers are found.
export default function Notebook() {
  return (
    <div className="nb" id="nb">
      <div className="nb-top">
        <div className="nb-title">Notes</div>
        <div className="nb-keys"><span className="key">◀</span><span className="key">▶</span> Turn page <span className="key">ESC</span> Return</div>
      </div>
      <div className="nb-book">
        <div className="nb-page nb-left" id="nbL"></div>
        <div className="nb-rings"></div>
        <div className="nb-page nb-right" id="nbR"></div>
        <button className="nb-arrow nb-prev" id="nbPrev" aria-label="Previous page">‹</button>
        {" "}
        <button className="nb-arrow nb-next" id="nbNext" aria-label="Next page">›</button>
      </div>
      <button className="nb-close" id="nbClose">RETURN</button>
    </div>
  );
}
