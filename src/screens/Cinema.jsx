import { memo, useCallback, useEffect, useRef, useState } from "react";
import { ROOMS, useGame } from "../game/GameContext.js";
import { devScreen } from "../game/startup.js";
import { createScope } from "../game/scope.js";
import { VIDEO } from "../game/media.js";
import { ding, isMuted, scrape, setDroneLevel, thud, thunder, tick, toggleMute, unlockAudio, useAudioState } from "../game/audio.js";
import { MENU_ITEMS } from "./menuItems.js";
import TitleScreen from "./TitleScreen.jsx";
import MainMenu from "./MainMenu.jsx";
import ElevatorHall from "./ElevatorHall.jsx";
import GameModal from "./GameModal.jsx";

// The opening sequence: title → main menu → entry video → elevator hall.
export default memo(function Cinema() {
  const { solved, team } = useGame();
  const { muted } = useAudioState();
  const [stage, setStage] = useState("title"); // title | menu | going | game
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState({ name: null, open: false, required: false });
  const [menuVideoIdle, setMenuVideoIdle] = useState(false);
  const [entryOn, setEntryOn] = useState(false);
  const [hall, setHall] = useState({ on: false, open: false, enter: false });
  const [indicator, setIndicator] = useState("- -");
  const [callDisabled, setCallDisabled] = useState(false);
  const [subtitle, setSubtitle] = useState({ on: false, text: "" });
  const [cinema, setCinema] = useState(() => ({ gone: false, hidden: Boolean(devScreen()) }));

  const cinemaRef = useRef(null);
  const menuVideoRef = useRef(null);
  const entryVideoRef = useRef(null);
  const flashRef = useRef(null);
  const leaveEntryRef = useRef(null);
  const afterTeamRef = useRef(null);
  const teamRequiredRef = useRef(false);
  const selectedRef = useRef(null);
  const startedRef = useRef(false);

  const say = useCallback((text) => {
    setSubtitle((s) => ({ ...s, on: false }));
    setTimeout(() => setSubtitle({ on: Boolean(text), text }), 600);
  }, []);

  const finishTeamModal = useCallback(() => {
    teamRequiredRef.current = false;
    setModal((m) => ({ ...m, open: false, required: false }));
    const next = afterTeamRef.current;
    afterTeamRef.current = null;
    if (next) next();
  }, []);

  // Every way of opening or closing the window comes through here, including menu buttons
  // reached with Tab behind it, so this is what keeps the START GAME name prompt locked.
  const openModal = useCallback((name, afterTeam) => {
    if (teamRequiredRef.current) return;
    if (!name) {
      finishTeamModal();
      return;
    }
    tick();
    afterTeamRef.current = afterTeam ?? null;
    setModal({ name, open: true, required: false });
  }, [finishTeamModal]);

  const select = useCallback((index) => {
    const next = (index + MENU_ITEMS.length) % MENU_ITEMS.length;
    const changed = selectedRef.current !== next;
    selectedRef.current = next;
    setSelected(next);
    return changed;
  }, []);

  const openMenu = useCallback(() => {
    setStage("menu");
    unlockAudio();
    const video = menuVideoRef.current;
    if (video?.paused) video.play().catch(() => {});
    select(0);
  }, [select]);

  const startGame = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    setStage("going");
    ding();
    const video = entryVideoRef.current;
    let done = false;
    const leaveEntry = () => {
      if (done) return;
      done = true;
      setEntryOn(false);
      setDroneLevel(0.7, 0.8);
      setTimeout(() => video.pause(), 900);
      setHall((h) => ({ ...h, on: true }));
      thud();
      say("Something is waiting for you inside.");
      setTimeout(() => say(""), 3800);
    };
    leaveEntryRef.current = leaveEntry;
    video.muted = isMuted();
    video.currentTime = 0;
    setDroneLevel(0.15, 0.5); // the video has its own sound
    setTimeout(() => {
      setEntryOn(true);
      video.play().catch(leaveEntry);
    }, 500);
  }, [say]);

  const act = useCallback(
    (action) => {
      if (action !== "start") {
        openModal(action);
      } else if (team) {
        startGame();
      } else {
        tick();
        teamRequiredRef.current = true;
        afterTeamRef.current = startGame;
        setModal({ name: "team", open: true, required: true });
      }
    },
    [openModal, startGame, team],
  );

  const callElevator = () => {
    setCallDisabled(true);
    ["3", "2", "1", "G"].forEach((floor, i) =>
      setTimeout(() => {
        setIndicator(floor);
        scrape();
      }, i * 650),
    );
    setTimeout(() => {
      ding();
      setHall((h) => ({ ...h, open: true }));
    }, 2700);
    setTimeout(() => scrape(), 2800);
    setTimeout(() => setHall((h) => ({ ...h, enter: true })), 4300);
    setTimeout(() => setCinema((c) => ({ ...c, gone: true })), 5400);
    setTimeout(() => {
      setCinema((c) => ({ ...c, hidden: true }));
      setStage("game");
    }, 6700);
  };

  // Global keys, kept in a ref so the listener always sees the latest state.
  const keyHandler = useRef(null);
  useEffect(() => {
    keyHandler.current = (e) => {
      const typing = e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA");
      if (stage === "title" && !cinema.hidden) {
        openMenu();
        e.preventDefault();
        return;
      }
      if (typing) return;
      if (e.key === "m" || e.key === "M") {
        toggleMute();
        return;
      }
      if (stage !== "menu") return;
      if (modal.open) {
        if (e.key === "Escape") openModal(null);
        return;
      }
      if (e.key === "ArrowDown") {
        select(selectedRef.current + 1);
        tick();
        e.preventDefault();
      } else if (e.key === "ArrowUp") {
        select(selectedRef.current - 1);
        tick();
        e.preventDefault();
      } else if (e.key === "Enter") {
        act(MENU_ITEMS[selectedRef.current].act);
        e.preventDefault();
      } else if (e.key === "q" || e.key === "Q") {
        openModal(null);
      } else if (e.key === "e" || e.key === "E") {
        openModal("howto");
      }
    };
  });

  useEffect(() => {
    const onKeyDown = (e) => keyHandler.current(e);
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // React doesn't reliably apply `muted` as an attribute, and autoplay depends on it.
  useEffect(() => {
    const video = menuVideoRef.current;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  // The entry video follows the sound setting.
  useEffect(() => {
    entryVideoRef.current.muted = muted;
  }, [muted]);

  // Lightning while the menu is visible.
  useEffect(() => {
    const scope = createScope();
    const storm = () => {
      scope.setTimeout(() => {
        const el = cinemaRef.current;
        const hallOn = el.querySelector("#hall").classList.contains("on");
        if (!el.classList.contains("hidden") && !hallOn) {
          const flash = flashRef.current;
          flash.classList.remove("on");
          void flash.offsetWidth; // restarts the CSS animation
          flash.classList.add("on");
          scope.setTimeout(thunder, 250 + Math.random() * 500);
        }
        storm();
      }, 7000 + Math.random() * 8000);
    };
    storm();
    return scope.dispose;
  }, []);

  const solvedCount = ROOMS.filter((room) => solved[room]).length;
  const cinemaClasses = ["cinema", cinema.gone && "gone", cinema.hidden && "hidden"].filter(Boolean).join(" ");

  return (
    <div ref={cinemaRef} className={cinemaClasses} id="cinema">
      <video
        ref={menuVideoRef}
        id="bgv"
        className={menuVideoIdle ? "idle" : undefined}
        muted
        playsInline
        autoPlay
        preload="auto"
        src={VIDEO.menu}
        onEnded={() => setMenuVideoIdle(true)}
      ></video>
      <div className="vshade"></div>
      <video
        ref={entryVideoRef}
        id="entryVid"
        className={`entry-vid${entryOn ? " on" : ""}`}
        playsInline
        preload="auto"
        src={VIDEO.entry}
        onEnded={() => leaveEntryRef.current?.()}
      ></video>
      <button className={`entry-skip${entryOn ? " on" : ""}`} id="entrySkip" onClick={() => leaveEntryRef.current?.()}>SKIP ›</button>
      <div ref={flashRef} className="flash" id="flash"></div>
      <div className="fog"></div><div className="fog f2"></div>

      <TitleScreen visible={stage === "title"} onOpen={() => stage === "title" && openMenu()} />
      <MainMenu
        visible={stage === "menu"}
        selected={selected}
        solvedCount={solvedCount}
        onSelect={(index) => {
          if (select(index)) tick();
        }}
        onAct={act}
        onModal={openModal}
      />
      <GameModal
        name={modal.name}
        open={modal.open}
        required={modal.required}
        onOpen={openModal}
        onClose={() => openModal(null)}
        onTeamDone={finishTeamModal}
      />
      <ElevatorHall
        on={hall.on}
        open={hall.open}
        enter={hall.enter}
        indicator={indicator}
        callDisabled={callDisabled}
        onCall={callElevator}
      />
      <div className={`sub${subtitle.on ? " on" : ""}`} id="sub">{subtitle.text}</div>
    </div>
  );
});
