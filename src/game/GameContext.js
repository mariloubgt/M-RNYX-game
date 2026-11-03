import { createContext, useContext } from "react";

export const ROOMS = ["ward", "seance", "store"];
export const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);
