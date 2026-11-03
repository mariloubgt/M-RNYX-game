// The corridor outside the elevator, reached after the START GAME video.
export default function ElevatorHall({ on, open, enter, indicator, callDisabled, onCall }) {
  const classes = ["hall", on && "on flicker", open && "open", enter && "enter"].filter(Boolean).join(" ");
  return (
    <div className={classes} id="hall">
      <div className="tubes">
        <i></i>
        <i></i>
        <i></i>
        <i></i>
      </div>
      <div className="lift">
        <div className="frame"></div>
        <div className="indicator" id="indicator">{indicator}</div>
        <div className="opening">
          <div className="shaft"></div>
          <div className="ldoor l">
            <div className="scrawl-big">WANNA<br />PLAY?</div>
          </div>
          <div className="ldoor r">
            <div className="scrawl-big">WANNA<br />PLAY?</div>
          </div>
        </div>
        <div className="callpanel">
          <button className="callbtn" id="callBtn" aria-label="Call the elevator" disabled={callDisabled} onClick={onCall}>▲</button>
        </div>
        <div className="callhint">PRESS THE BUTTON</div>
      </div>
    </div>
  );
}
