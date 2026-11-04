import { GameProvider } from "./game/GameProvider.jsx";
import { useGame } from "./game/GameContext.js";
import Cinema from "./screens/Cinema.jsx";
import Elevator from "./screens/Elevator.jsx";
import Ward from "./screens/ward/Ward.jsx";
import SeanceRoom from "./screens/seance/SeanceRoom.jsx";
import Kitchen from "./screens/kitchen/Kitchen.jsx";
import Basement from "./screens/basement/Basement.jsx";
import ScareOverlays from "./components/ScareOverlays.jsx";
import TopBar from "./components/TopBar.jsx";

// Every screen stays mounted and is only hidden by CSS, as in the original game:
// room progress (opened cupboards, notes, the séance transcript) must survive a
// trip back to the elevator. The element order here is also the stacking order.
function Game() {
  const { screen, blackout } = useGame();
  return (
    <>
      <div className="grain"></div>
      <div className="vignette"></div>
      <Cinema />
      <div className={`blackout${blackout ? " on" : ""}`} id="blackout"></div>
      <ScareOverlays />
      <TopBar />
      <Elevator active={screen === "intro"} />
      <Ward active={screen === "ward"} />
      <SeanceRoom active={screen === "seance"} />
      <Kitchen active={screen === "store"} />
      <Basement active={screen === "end"} />
    </>
  );
}

export default function App() {
  return (
    <GameProvider>
      <Game />
    </GameProvider>
  );
}
