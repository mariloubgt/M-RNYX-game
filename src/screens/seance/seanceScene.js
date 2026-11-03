import { createScope } from "../../game/scope.js";
import { play, noiseBurst, whisper, slide } from "../../game/audio.js";

// Drives Room II: the spirit board, planchette and night-vision camera.
export function initSeanceScene() {
  const scope = createScope();
  const { setTimeout, setInterval, on } = scope;

  const board = document.getElementById("board");
  const plan = document.getElementById("planchette");
  const pos = {};
  function addGlyph(key, text, x, y, cls, rot = 0){
    const el = document.createElement("div");
    el.className = "ob-glyph " + cls; el.textContent = text;
    el.style.left = x + "%"; el.style.top = y + "%"; el.style.setProperty("--r", rot + "deg");
    board.appendChild(el);
    pos[key] = { x, y, el };
  }
  let built = false;
  function layoutBoard(){
    if (built) return; built = true;
    const arc = (letters, rx, ry, cy, a0, a1) => letters.split("").forEach((L, i) => {
      const t = a0 + (a1 - a0) * i / (letters.length - 1), rad = t * Math.PI / 180;
      addGlyph(L, L, 50 + rx * Math.cos(rad), cy - ry * Math.sin(rad), "letter", (90 - t) * .55);
    });
    arc("ABCDEFGHIJKLM", 42, 42, 71, 162, 18);
    arc("NOPQRSTUVWXYZ", 32, 25, 75, 160, 20);
    "1234567890".split("").forEach((d, i) => addGlyph(d, d, 23 + i * 6, 83, "digit"));
    addGlyph("YES", "YES", 21, 10, "word");
    addGlyph("NO", "NO", 80, 10, "word");
    addGlyph("BYE", "GOOD BYE", 50, 94, "word");
    pos.REST = { x: 50, y: 63 };
    moveTo("REST", true);
  }
  let pX = 50, pY = 60;
  function moveTo(key, instant){
    const p = pos[key];
    const dx = p.x - pX, rot = Math.max(-16, Math.min(16, dx * .7)) + (Math.random() - .5) * 4;
    plan.style.transition = instant ? "none" : "";
    plan.style.left = p.x + "%"; plan.style.top = p.y + "%";
    plan.style.setProperty("--rot", rot + "deg");
    if (!instant && Math.hypot(dx, p.y - pY) > 3) slide();
    pX = p.x; pY = p.y;
  }
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  // camera timestamp keeps running
  (function(){ let sec = 3 * 3600 + 12 * 60 + 40; const el = document.getElementById("hudTime");
    setInterval(() => { sec++; const h = Math.floor(sec / 3600) % 12 || 12, m = Math.floor(sec / 60) % 60, s2 = sec % 60;
      el.textContent = `NOV 02 1953 · ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s2).padStart(2,"0")} AM`; }, 1000); })();
  // camera grain
  (function(){ const n = document.createElement("canvas"); n.width = n.height = 180; const g = n.getContext("2d"), id = g.createImageData(180, 180);
    for (let i = 0; i < id.data.length; i += 4){ const v = Math.random() * 255; id.data[i] = id.data[i+1] = id.data[i+2] = v; id.data[i+3] = 255; }
    g.putImageData(id, 0, 0); const u = `url(${n.toDataURL()})`;
    document.getElementById("nvNoise").style.backgroundImage = u; document.getElementById("nvStatic").style.backgroundImage = u; })();
  const nvCam = document.getElementById("nvCam");
  function signalLoss(ms){
    nvCam.classList.remove("lost"); void nvCam.offsetWidth; nvCam.classList.add("lost");
    noiseBurst(ms / 1000, 2600, .4, .8);
    setTimeout(() => nvCam.classList.remove("lost"), ms);
  }
  // when nobody is asking, the planchette sometimes twitches on its own
  setInterval(() => {
    if (busy || !document.getElementById("seance").classList.contains("active") || Math.random() < .5) return;
    plan.classList.remove("twitch"); void plan.offsetWidth; plan.classList.add("twitch");
  }, 7000);

  const questions = [
    { q:"Is anyone there?",       seq:[["YES"]] },
    { q:"What happened to you?",  codes:[73,32,87,65,83,32,66,85,82,73,69,68] }
  ];
  const tbody = document.getElementById("tbody");
  tbody.innerHTML = `<span class="t-q">Nothing yet. Ask the spirit a question.</span>`;
  const askBtns = [...document.querySelectorAll(".ask")];
  const candles = [document.getElementById("c1"), document.getElementById("c2")];
  let busy = false, firstAsk = true;

  // Message timing: 24 digit stops and 11 returns to rest, about 30 seconds with GOOD BYE.
  // The .quick class in seance-nightvision.css must finish its move within these waits.
  const DIGIT_MOVE = 500, DIGIT_HOLD = 400, REST_MOVE = 500;

  async function land(key, moveMs = 1150, holdMs = 700){
    moveTo(key); await sleep(moveMs);
    if (pos[key].el){
      pos[key].el.classList.add("lit"); plan.classList.add("hold"); whisper();
      if (Math.random() < .18) signalLoss(140);
      await sleep(holdMs);
      pos[key].el.classList.remove("lit"); plan.classList.remove("hold");
    }
  }
  askBtns.forEach(btn => on(btn, "click", async () => {
    if (busy) return; busy = true;
    askBtns.forEach(b => b.disabled = true);
    const Q = questions[+btn.dataset.q];
    if (firstAsk){ tbody.innerHTML = ""; firstAsk = false; }
    const line = document.createElement("span"); line.className = "t-line";
    const ql = document.createElement("span"); ql.className = "t-q"; ql.textContent = "Asked: \u201C" + Q.q + "\u201D";
    tbody.appendChild(ql); tbody.appendChild(line);
    nvCam.classList.add("asking");
    await sleep(900);

    if (Q.seq){
      await land("YES"); line.textContent = "YES";
    } else {
      plan.classList.add("quick");
      for (let c = 0; c < Q.codes.length; c++){
        const digits = String(Q.codes[c]).split("");
        for (const d of digits){ await land(d, DIGIT_MOVE, DIGIT_HOLD); line.textContent += d; }
        if (c < Q.codes.length - 1){ line.textContent += " · "; moveTo("REST"); await sleep(REST_MOVE); }
      }
      plan.classList.remove("quick");
    }
    await land("BYE");
    // the candles die, something heavy moves in the dark, the feed breaks up
    candles.forEach(c => c.classList.add("out"));
    nvCam.classList.add("dark");
    setTimeout(() => play("monster_step", .7), 500);
    setTimeout(() => signalLoss(420), 1100);
    await sleep(2400);
    candles.forEach(c => c.classList.remove("out"));
    nvCam.classList.remove("dark", "asking");
    moveTo("REST");
    await sleep(1000);
    busy = false; askBtns.forEach(b => b.disabled = false);
  }));

  layoutBoard();

  scope.add(() => board.querySelectorAll(".ob-glyph").forEach(el => el.remove()));

  return scope.dispose;
}
