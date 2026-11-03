import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.jsx";
import { preloadMedia } from "./game/media.js";
import { preloadAudio } from "./game/audio.js";

preloadMedia();
preloadAudio();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
