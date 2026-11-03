import { createScope } from "../../game/scope.js";
import { play, noiseBurst, whisper } from "../../game/audio.js";
import { KITCHEN_IMAGES } from "../../game/media.js";

// Drives Room III: cupboards, draggable objects, the notes book and the poltergeist events.
export function initKitchenScene() {
  const scope = createScope();
  const { setTimeout, setInterval, requestAnimationFrame, on } = scope;

  // The Warden's own alphabet. Every symbol is drawn in a 40x40 box.
  const S = 'fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const F = 'fill="currentColor"';
  const GLYPHS = {
    W: `<circle cx="20" cy="20" r="11" ${S}/><path d="M20 4V36" ${S}/>`,
    A: `<path d="M26 7A13 13 0 1 0 26 33A16 16 0 0 1 26 7Z" ${F}/><circle cx="29" cy="20" r="2.6" ${F}/>`,
    R: `<circle cx="20" cy="12" r="6" ${S}/><path d="M8 26H32M8 33H32" ${S}/>`,
    D: `<path d="M20 5L35 20L20 35L5 20Z" ${S}/><circle cx="20" cy="20" r="3.2" ${F}/>`,
    E: `<circle cx="20" cy="9" r="3.6" ${F}/><circle cx="10" cy="25" r="3.6" ${F}/><circle cx="30" cy="25" r="3.6" ${F}/><path d="M8 35H32" ${S}/>`,
    N: `<path d="M4 20Q20 5 36 20Q20 35 4 20Z" ${S}/><path d="M20 13V27" ${S}/>`,
    S: `<path d="M7 29A13 13 0 0 1 33 29" ${S}/><path d="M14 29A6 6 0 0 1 26 29" ${S}/><path d="M20 6V12" ${S}/>`,
    T: `<circle cx="20" cy="20" r="12" ${S}/><path d="M20 8V32M8 20H32" ${S}/>`,
    O: `<circle cx="20" cy="20" r="13" ${S}/><circle cx="20" cy="20" r="5" ${S}/>`,
    L: `<path d="M20 5V33M10 23L20 33L30 23" ${S}/>`,
    I: `<path d="M5 12L13 28L20 12L27 28L35 12" ${S}/>`,
    H: `<path d="M8 9H32L20 31Z" ${S}/><path d="M20 31V37" ${S}/>`
  };
  const glyph = (k, extra = "") => `<svg viewBox="0 0 40 40" ${extra}>${GLYPHS[k]}</svg>`;
  const KEY_ORDER = ["T","N","O","A","H","W","S","D","I","R","L","E"]; // shuffled on the key page

  const KA = KITCHEN_IMAGES;
  const KW = 1920, KH = 1080;
  const pct = (x, y, w, h) => `left:${x / KW * 100}%;top:${y / KH * 100}%;width:${w / KW * 100}%;height:${h / KH * 100}%`;
  document.getElementById("kBase").style.backgroundImage = `url(${KA.base})`;

  const HALVES = [KEY_ORDER.slice(0,6), KEY_ORDER.slice(6)];
  const keyHTML = h => `<div class="k-hd">THE WARDEN'S MARKS · ${h ? "II" : "I"}</div><div class="keygrid">${HALVES[h].map(k => `<div>${glyph(k)}<span>${k}</span></div>`).join("")}</div>`;
  // things that open (doors, cupboards, oven, drawer): x, y, w, h in pixels of the 1920x1080 picture
  const KOPEN = {
    ulL:   { r: [630, 235, 100, 220],   hinge: "left",   kind: "cab",  holds: { key: 0 } },
    ulR:   { r: [733, 235, 97, 220],   hinge: "right",  kind: "cab",  holds: { web: 1 } },
    umL:   { r: [847, 342, 110, 115],   hinge: "left",   kind: "cab",  holds: { mark: "R" } },
    umR:   { r: [962, 342, 110, 115],   hinge: "right",  kind: "cab",  holds: { web: 1 } },
    ovL:   { r: [852, 690, 103, 110],   hinge: "bottom", kind: "oven", holds: { mark: "W" } },
    ovR:   { r: [960, 690, 108, 110],   hinge: "bottom", kind: "oven", holds: {} },
    drawer:{ r: [1210, 660, 92, 32],hinge: "drawer", kind: "drawer", holds: { mark: "E" } },
    lcab:  { r: [736, 668, 98, 165],  hinge: "right",  kind: "cab",  holds: { note: 1 } },
    rcab:  { r: [1087, 655, 115, 175],  hinge: "left",   kind: "cab",  holds: { key: 1 } },
    door:  { r: [433, 433, 140, 272],  hinge: "left",   kind: "door", holds: { mark: "N" } }
  };
  // things you drag aside
  const KDRAG = {
    kettle: { r: [1080, 522, 72, 100], mark: "A" },
    micro:  { r: [1480, 565, 122, 80],  mark: "S" },
    plates: { r: [1715, 632, 130, 62], mark: "D" }
  };
  const kItems = document.getElementById("kItems");
  function contentHTML(h){
    if (h.key !== undefined) return `<div class="keypage torn${h.key} k-paper" data-key="${h.key}">${keyHTML(h.key)}</div>`;
    if (h.note) return `<div class="k-paper k-notepaper" data-note="1"><div class="k-hd">ROUNDS</div><i></i><i></i><i></i><i></i></div>`;
    if (h.mark) return `<div class="k-mark">${glyph(h.mark)}</div>`;
    if (h.web) return `<svg class="k-web" viewBox="0 0 100 100"><path d="M0 0L60 45M0 0L30 70M0 0L75 15M8 6Q20 18 6 30M18 14Q38 26 14 46M30 22Q52 34 22 60" stroke="#cfd6d2" stroke-width=".8" fill="none" opacity=".35"/></svg>`;
    return "";
  }
  Object.entries(KOPEN).forEach(([id, o]) => {
    const [x, y, w, h] = o.r;
    const el = document.createElement("div");
    el.className = `k-open k-${o.kind} hinge-${o.hinge}`; el.style.cssText = pct(x, y, w, h);
    el.innerHTML = `<div class="k-in">${contentHTML(o.holds)}</div><div class="k-panel" style="background-image:url(${KA["p_" + id]})"></div>`;
    on(el.querySelector(".k-panel"), "click", () => {
      const open = el.classList.toggle("open");
      document.getElementById("r3tip").style.opacity = 0;
      if (o.kind === "drawer") noiseBurst(.35, 700, 1.2, .5);
      else if (open) play("door_open", o.kind === "door" ? 1 : .6);
      else play("door_lock", .55);
    });
    kItems.appendChild(el);
  });
  /* ---------- the notes book: papers you find are kept here ---------- */
  const NOTE_PAGES = {
    rounds: { title: "The Warden's Rounds", where: "Low cabinet, left of the stove.",
              photo: () => `<div class="nb-photo-paper"><div class="k-hd">THE WARDEN'S ROUNDS</div><i></i><i></i><i></i><i></i><i></i><i></i></div>`,
              dense: true,
              lines: ["Every night, always in this order.", "At every stop he leaves his mark.",
                      "I. He warms his hands where the bread is baked.", "II. He boils water for his tea.", "III. He takes a cup from above the fire.",
                      "IV. He counts the plates. One is always missing.", "V. He checks where the knives sleep.", "VI. He leaves by the back door and locks it."] },
    key0:   { title: "Torn page · I", where: "Top-left cupboard.",
              photo: () => `<div class="keypage torn0 nb-photo-key">${keyHTML(0)}</div>`,
              lines: ["Half of a torn page.", "Strange marks, each one", "with a letter beside it.", "", "The other half must be", "somewhere in this kitchen..."] },
    key1:   { title: "Torn page · II", where: "Cabinet under the counter.",
              photo: () => `<div class="keypage torn1 nb-photo-key">${keyHTML(1)}</div>`,
              lines: ["The other half.", "Six more of his marks.", "", "With both halves", "I can read everything", "he scratched in here."] }
  };
  const notes = [];               // ids, in the order they were found
  let nbAt = 0;
  const nb = document.getElementById("nb"), nbIcon = document.getElementById("nbIcon");
  const rustle = () => noiseBurst(.28, 5200, .7, .55);
  function renderNotebook(){
    const id = notes[nbAt], n = NOTE_PAGES[id];
    document.getElementById("nbL").innerHTML = `
      <div class="nb-name">${n.title}</div>
      <div class="nb-photo"><span class="tape t1"></span><span class="tape t2"></span>${n.photo()}</div>
      <div class="nb-where">found: ${n.where}</div>`;
    document.getElementById("nbR").innerHTML = `
      <div class="nb-num">${nbAt + 1}/${notes.length}</div>
      <div class="nb-text${n.dense ? " dense" : ""}">${n.lines.map(l => `<div>${l || "&nbsp;"}</div>`).join("")}</div>`;
    document.getElementById("nbPrev").disabled = nbAt === 0;
    document.getElementById("nbNext").disabled = nbAt === notes.length - 1;
  }
  function openNotebook(at){
    if (!notes.length) return;
    nbAt = Math.max(0, Math.min(notes.length - 1, at ?? nbAt));
    renderNotebook(); nb.classList.add("on"); rustle();
  }
  const closeNotebook = () => { nb.classList.remove("on"); rustle(); };
  function turn(d){
    const n = nbAt + d; if (n < 0 || n >= notes.length) return;
    const book = nb.querySelector(".nb-book");
    book.classList.remove("flipL", "flipR"); void book.offsetWidth; book.classList.add(d > 0 ? "flipR" : "flipL");
    nbAt = n; rustle(); setTimeout(renderNotebook, 120);
  }
  nbIcon.onclick = () => openNotebook();
  document.getElementById("nbPrev").onclick = () => turn(-1);
  document.getElementById("nbNext").onclick = () => turn(1);
  document.getElementById("nbClose").onclick = closeNotebook;
  on(nb, "click", e => { if (e.target === nb) closeNotebook(); });
  on(document, "keydown", e => {
    if (!nb.classList.contains("on")) return;
    if (e.key === "ArrowRight") { turn(1); e.preventDefault(); }
    else if (e.key === "ArrowLeft") { turn(-1); e.preventDefault(); }
    else if (e.key === "Escape") closeNotebook();
  });
  function collect(pap, id){
    if (notes.includes(id)) return;
    notes.push(id);
    // the paper flies into the little book
    const a = pap.getBoundingClientRect(), b = nbIcon.getBoundingClientRect();
    const fly = pap.cloneNode(true); fly.classList.add("nb-fly");
    Object.assign(fly.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
    document.body.appendChild(fly);
    pap.style.visibility = "hidden";
    rustle();
    requestAnimationFrame(() => {
      fly.style.transform = `translate(${b.left + b.width / 2 - (a.left + a.width / 2)}px, ${b.top + b.height / 2 - (a.top + a.height / 2)}px) scale(.15) rotate(-25deg)`;
      fly.style.opacity = ".2";
    });
    setTimeout(() => {
      fly.remove();
      nbIcon.classList.add("has"); nbIcon.classList.remove("got"); void nbIcon.offsetWidth; nbIcon.classList.add("got");
      document.getElementById("nbCount").textContent = notes.length;
      openNotebook(notes.length - 1);           // the first look happens right away
    }, 760);
  }
  on(kItems, "click", e => {
    const pap = e.target.closest(".k-paper"); if (!pap) return;
    collect(pap, pap.dataset.note ? "rounds" : "key" + pap.dataset.key);
  });
  // a dark mass behind the lower half of the back door, behind the chair, once it is open
  const doorShade = document.createElement("div"); doorShade.className = "k-doorshade"; doorShade.style.cssText = pct(433, 700, 140, 95);
  kItems.appendChild(doorShade);
  const kDoor = kItems.querySelector(".k-door");
  const doorObserver = new MutationObserver(() => doorShade.classList.toggle("on", kDoor.classList.contains("open")));
  doorObserver.observe(kDoor, { attributes: true });
  scope.add(() => doorObserver.disconnect());

  Object.entries(KDRAG).forEach(([id, o]) => {
    const [x, y, w, h] = o.r;
    const mk = document.createElement("div"); mk.className = "k-mark k-wallmark"; mk.style.cssText = pct(x, y, w, h); mk.innerHTML = glyph(o.mark); mk.style.opacity = 0;
    kItems.appendChild(mk);
    const el = document.createElement("img"); el.src = KA["d_" + id]; el.className = "k-drag"; el.style.cssText = pct(x, y, w, h); el.draggable = false;
    kItems.appendChild(el);
    let sx, sy, dx = 0, dy = 0, bx, by, shown = false;
    on(el, "pointerdown", e => { e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add("dragging"); sx = e.clientX; sy = e.clientY; bx = dx; by = dy; noiseBurst(.3, 380, 1.2, .5); document.getElementById("r3tip").style.opacity = 0; });
    on(el, "pointermove", e => {
      if (!el.classList.contains("dragging")) return;
      dx = bx + e.clientX - sx; dy = by + e.clientY - sy;
      el.style.transform = `translate(${dx}px,${dy}px)`;
      if (!shown && Math.hypot(dx, dy) > Math.min(el.offsetWidth, el.offsetHeight) * .7){ shown = true; mk.style.opacity = 1; whisper(); }
    });
    const end = () => el.classList.remove("dragging");
    on(el, "pointerup", end); on(el, "pointercancel", end);
  });

  /* ---------- the kitchen is haunted: poltergeist events instead of a face ---------- */
  const kScene = document.getElementById("kScene");
  document.getElementById("kSlam").style.backgroundImage = `url(${KA.slam})`;
  const kStoreActive = () => document.getElementById("store").classList.contains("active") && document.getElementById("cinema").classList.contains("hidden");
  const kShake = () => { kScene.classList.remove("shake"); void kScene.offsetWidth; kScene.classList.add("shake"); };
  const KEVENTS = {
    // something watches from the open cupboard, then slams it shut on you
    slam(){
      const eyes = document.getElementById("kEyes"), door = document.getElementById("kSlam");
      eyes.classList.add("on");
      setTimeout(() => { eyes.classList.add("blink"); }, 900);
      setTimeout(() => { eyes.classList.remove("on", "blink"); door.classList.add("shut"); play("door_lock", 1); kShake(); }, 1500);
      setTimeout(() => { door.classList.add("creep"); door.classList.remove("shut"); play("door_open", .35); }, 5200);
      setTimeout(() => door.classList.remove("creep"), 8800);
      return 8800;
    },
    // every candle dies at once, the seal burns brighter
    candles(){
      const c = document.getElementById("kCandles"), seal = document.getElementById("kSeal");
      noiseBurst(.7, 260, .6, 1.4);
      c.classList.add("out"); seal.classList.add("hot");
      setTimeout(() => play("monster_step", .45), 1400);
      setTimeout(() => { c.classList.remove("out"); seal.classList.remove("hot"); }, 5200);
      return 7500;
    },
    // writing seeps through the wallpaper
    writing(){
      const w = document.getElementById("kWrite");
      w.classList.add("on"); whisper(); setTimeout(whisper, 900);
      setTimeout(() => w.classList.remove("on"), 6500);
      return 8500;
    },
    // a tall shape passes behind the curtains
    window(){
      const ws = document.getElementById("kWinShadow");
      ws.classList.remove("pass"); void ws.offsetWidth; ws.classList.add("pass");
      setTimeout(() => play("monster_step", .3), 600);
      return 4000;
    },
    // the power fails for a moment
    lights(){
      const f = document.getElementById("kFlicker");
      f.classList.remove("on"); void f.offsetWidth; f.classList.add("on");
      noiseBurst(1.1, 120, 3, .35);
      return 2500;
    }
  };
  const KEV_ORDER = ["window", "slam", "candles", "writing", "lights", "slam", "writing", "candles"];
  let kEvIdx = 0, kEvBusy = false, kNext = 0;
  setInterval(() => {
    if (!kStoreActive()) { kNext = Date.now() + 8000 + Math.random() * 6000; return; }
    if (kEvBusy || Date.now() < kNext) return;
    const name = KEV_ORDER[kEvIdx++ % KEV_ORDER.length];
    kEvBusy = true;
    const dur = KEVENTS[name]();
    if (name === "writing" && Math.random() < .5) setTimeout(KEVENTS.lights, 1200);
    setTimeout(() => { kEvBusy = false; kNext = Date.now() + 14000 + Math.random() * 16000; }, dur);
  }, 500);

  scope.add(() => kItems.replaceChildren());

  return scope.dispose;
}
