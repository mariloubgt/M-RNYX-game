import { createScope } from "./scope.js";
import { play, noiseBurst } from "./audio.js";

/* ---------- the door monster: an original face, painted in code once at load ---------- */
function paintDoorFace(open){
  const W = 600, H = 760, c = document.createElement("canvas"); c.width = W; c.height = H;
  const fin = c.getContext("2d");
  const L = document.createElement("canvas"); L.width = W; L.height = H;
  let g = fin;
  // seeded random so both frames share the same face
  let seed = 1337; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const blur = px => g.filter = px ? `blur(${px}px)` : "none";

  // smoky darkness around the head, transparent at the very edge so it emerges from the dark
  let rg = g.createRadialGradient(W/2, H*.46, 60, W/2, H*.5, W*.62);
  rg.addColorStop(0, "rgba(28,28,30,.95)"); rg.addColorStop(.7, "rgba(14,14,16,.85)"); rg.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = rg; g.fillRect(0, 0, W, H);

  g = L.getContext("2d");
  g.save(); g.translate(W/2, H*.5); g.rotate(-.055);
  const head = new Path2D();
  head.moveTo(-8, -340);
  head.bezierCurveTo(90, -345, 150, -250, 158, -130);
  head.bezierCurveTo(166, -20, 148, 40, 172, 130);
  head.bezierCurveTo(196, 230, 140, 330, 20, 348);
  head.bezierCurveTo(-110, 350, -190, 250, -176, 140);
  head.bezierCurveTo(-160, 50, -172, -30, -160, -140);
  head.bezierCurveTo(-148, -270, -92, -338, -8, -340);
  // base skin with light falling from the upper left
  rg = g.createRadialGradient(-70, -150, 20, -20, 0, 380);
  rg.addColorStop(0, "#ecebe6"); rg.addColorStop(.4, "#c9c8c3"); rg.addColorStop(.75, "#878783"); rg.addColorStop(1, "#2c2c2e");
  g.fillStyle = rg; g.fill(head);

  g.save(); g.clip(head);
  // painterly smudges
  blur(4);
  for (let i = 0; i < 260; i++){
    const x = -180 + rnd() * 360, y = -340 + rnd() * 690, len = 20 + rnd() * 70, a = rnd() * Math.PI;
    const light = rnd() < .55;
    g.strokeStyle = light ? `rgba(240,238,232,${.04 + rnd() * .08})` : `rgba(40,40,44,${.04 + rnd() * .09})`;
    g.lineWidth = 8 + rnd() * 22; g.lineCap = "round";
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  // hollows: temples, cheeks, under the jaw
  const shade = (x, y, r, a) => { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(18,18,22,${a})`); q.addColorStop(1, "rgba(18,18,22,0)"); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); };
  const lightUp = (x, y, r, a) => { const q = g.createRadialGradient(x, y, 0, x, y, r); q.addColorStop(0, `rgba(250,249,244,${a})`); q.addColorStop(1, "rgba(250,249,244,0)"); g.fillStyle = q; g.fillRect(x - r, y - r, r * 2, r * 2); };
  blur(0);
  shade(-150, -150, 110, .55); shade(150, -140, 110, .6);
  shade(-125, 70, 90, .5); shade(130, 80, 95, .55);
  shade(0, 340, 160, .7);
  lightUp(-40, -240, 120, .35); lightUp(-70, 20, 70, .18);
  // grey-blue veins at the temples
  blur(1.2); g.strokeStyle = "rgba(70,80,105,.35)"; g.lineWidth = 2.2;
  for (let v = 0; v < 7; v++){
    let x = (v % 2 ? 1 : -1) * (120 + rnd() * 30), y = -230 + rnd() * 120;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < 6; k++){ x += (rnd() - .5) * 26 - Math.sign(x) * 6; y += 14 + rnd() * 16; g.lineTo(x, y); }
    g.stroke();
  }
  g.restore();

  // hollow eyes, uneven sizes
  const eye = (x, y, rx, ry) => {
    blur(14); g.fillStyle = "rgba(10,10,12,.85)"; g.beginPath(); g.ellipse(x, y + 6, rx * 1.7, ry * 1.6, 0, 0, Math.PI * 2); g.fill();
    blur(5);  g.fillStyle = "#050506"; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    blur(1.2); g.fillStyle = "rgba(235,235,230,.9)"; g.beginPath(); g.arc(x - rx * .22, y - ry * .28, 4.2, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(235,235,230,.35)"; g.beginPath(); g.arc(x + rx * .18, y + ry * .1, 1.8, 0, Math.PI * 2); g.fill();
  };
  eye(-74, -70, 44, 50); eye(72, -54, 36, 42);
  // a dark trail running from one eye
  blur(2.5); g.strokeStyle = "rgba(12,12,14,.55)"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(-82, -18); g.bezierCurveTo(-86, 20, -78, 50, -84, 90); g.stroke();
  // no real nose, only two slits
  blur(2.5); g.fillStyle = "rgba(15,15,18,.8)";
  g.beginPath(); g.ellipse(-13, 42, 5, 11, .25, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(13, 44, 5, 11, -.25, 0, Math.PI * 2); g.fill();

  // the grin: far too wide, with long uneven teeth
  const my = open ? 196 : 176, mh = open ? 190 : 120, mw = 250;
  const mouth = new Path2D();
  mouth.moveTo(-mw/2, my - mh * .32);
  mouth.bezierCurveTo(-mw * .3, my - mh * .55, mw * .3, my - mh * .58, mw/2, my - mh * .36);
  mouth.bezierCurveTo(mw * .56, my, mw * .4, my + mh * .5, 0, my + mh * .52);
  mouth.bezierCurveTo(-mw * .42, my + mh * .5, -mw * .58, my, -mw/2, my - mh * .32);
  // creases where the smile cuts up into the cheeks
  blur(3); g.strokeStyle = "rgba(14,14,16,.75)"; g.lineWidth = 7; g.lineCap = "round";
  g.beginPath(); g.moveTo(-mw/2 - 2, my - mh * .3); g.quadraticCurveTo(-mw/2 - 30, my - mh * .6, -mw/2 - 26, my - mh * .95); g.stroke();
  g.beginPath(); g.moveTo(mw/2 + 2, my - mh * .34); g.quadraticCurveTo(mw/2 + 34, my - mh * .62, mw/2 + 30, my - mh); g.stroke();
  blur(3); g.fillStyle = "#070606"; g.fill(mouth);
  g.save(); g.clip(mouth);
  blur(0); g.fillStyle = "rgba(60,30,32,.55)"; g.fillRect(-mw, my - mh * .62, mw * 2, mh * .16);   // gum
  const tooth = (x, top, w, len, tilt, up) => {
    const tg = g.createLinearGradient(0, top, 0, top + len * (up ? -1 : 1));
    tg.addColorStop(0, "#5d574d"); tg.addColorStop(.3, "#b4ad9c"); tg.addColorStop(.75, "#8a8272"); tg.addColorStop(1, "#3f3a33");
    g.fillStyle = tg; blur(1.9);
    g.beginPath();
    g.moveTo(x - w/2, top); g.lineTo(x + w/2, top);
    g.lineTo(x + w * .12 + tilt, top + len * (up ? -1 : 1));
    g.lineTo(x - w * .18 + tilt, top + len * (up ? -1 : 1) * .96);
    g.closePath(); g.fill();
  };
  const top = my - mh * .56, bot = my + mh * .52;
  for (let i = 0; i < 9; i++){
    const x = -mw/2 + 22 + i * (mw - 44) / 8 + (rnd() - .5) * 8;
    tooth(x, top, 13 + rnd() * 15, mh * (.45 + rnd() * .55), (rnd() - .5) * 18, false);
  }
  for (let i = 0; i < 8; i++){
    const x = -mw/2 + 38 + i * (mw - 76) / 7 + (rnd() - .5) * 8;
    tooth(x, bot, 12 + rnd() * 9, mh * (.25 + rnd() * .3), (rnd() - .5) * 8, true);
  }
  g.restore();
  blur(2); g.strokeStyle = "rgba(40,36,36,.7)"; g.lineWidth = 3; g.stroke(mouth);

  // darker, harsher light: the lower right side falls away into shadow
  blur(0); g.globalCompositeOperation = "multiply";
  rg = g.createRadialGradient(-70, -170, 40, 0, 40, 400);
  rg.addColorStop(0, "#ffffff"); rg.addColorStop(.55, "#a4a4a4"); rg.addColorStop(1, "#262626");
  g.save(); g.clip(head); g.fillStyle = rg; g.fillRect(-W, -H, W * 2, H * 2); g.restore();
  g.globalCompositeOperation = "source-over";
  g.restore();
  // dissolve the silhouette: keep the head only where a blurred copy of its shape is
  const M = document.createElement("canvas"); M.width = W; M.height = H;
  const m = M.getContext("2d"); m.translate(W/2, H*.5); m.rotate(-.055);
  m.filter = "blur(26px)"; m.fillStyle = "#000"; m.scale(.96, .97); m.fill(head);
  g.globalCompositeOperation = "destination-in"; g.drawImage(M, 0, 0); g.globalCompositeOperation = "source-over";
  g = fin; blur(0);
  g.drawImage(L, 0, 0);
  rg = g.createLinearGradient(0, H * .78, 0, H);
  rg.addColorStop(0, "rgba(0,0,0,0)"); rg.addColorStop(1, "rgba(0,0,0,.95)");
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // film grain
  const id = g.getImageData(0, 0, W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4){ const n = (Math.random() - .5) * 26; d[i] += n; d[i+1] += n; d[i+2] += n; }
  g.putImageData(id, 0, 0);
  return c;
}

// Drives the face that hides in the Ward and Séance Room, then glitches out at the player.
export function initScares() {
  const scope = createScope();
  const { setTimeout, clearTimeout, setInterval, requestAnimationFrame, on } = scope;

  const dsFrames = { closed: null, open: null };
  setTimeout(() => {                        // paint the faces once, after the page has loaded
    try { dsFrames.closed = paintDoorFace(false); dsFrames.open = paintDoorFace(true); } catch { /* canvas filters unsupported: the face simply never appears */ }
    const put = (id, cv) => { const c = document.createElement("canvas"); c.width = cv.width; c.height = cv.height; c.getContext("2d").drawImage(cv, 0, 0); document.getElementById(id).appendChild(c); return c; };
    if (dsFrames.closed){
      put("dsT2", dsFrames.closed); put("dsT1", dsFrames.closed);
      put("dsRig", dsFrames.closed); const o = put("dsRig", dsFrames.open); o.className = "ds-open";
    }
  }, 1200);
  const LURK = { firstDelay: [18, 40], gap: [45, 90], lurk: [5, 9], maxPerGame: 8 };   // seconds
  const LURK_ROOMS = {
    ward:   { host: () => document.getElementById("hwCam"), spots: [
              { x: 55.8, y: 50, h: 8 }, { x: 25.2, y: 48, h: 14 }, { x: 81.2, y: 44, h: 14 },
              { x: 37.6, y: 50, h: 7 }, { x: 30, y: 9, h: 14, flip: true }, { x: 98, y: 70, h: 26 } ] },
    seance: { host: () => document.getElementById("seance"), spots: [
              { x: 7, y: 18, h: 16 }, { x: 93, y: 22, h: 14 }, { x: 50, y: 8, h: 10 }, { x: 5, y: 72, h: 20 }, { x: 95, y: 70, h: 18 } ] }
  };
  const rr = ([a, b]) => (a + Math.random() * (b - a)) * 1000;
  let lurkNext = 0, lurkRoom = null, lurker = null, lurkTimer = null, lurkCount = 0, scaring = false;
  const activeRoom = () => {
    if (!document.getElementById("cinema").classList.contains("hidden")) return null;
    return ["ward", "seance", "store"].find(id => document.getElementById(id).classList.contains("active")) || null;
  };
  function clearLurker(){ if (lurker) { lurker.remove(); lurker = null; } clearTimeout(lurkTimer); }
  function spawnLurker(room){
    const cfg = LURK_ROOMS[room]; if (!cfg) return;   // the kitchen has poltergeist events instead of the face
    const host = cfg.host(); if (!host || !dsFrames.closed) return;
    const sp = cfg.spots[Math.floor(Math.random() * cfg.spots.length)];
    const c = document.createElement("canvas"); c.width = 600; c.height = 760; c.className = "lurker" + (sp.flip ? " flip" : "");
    c.getContext("2d").drawImage(dsFrames.closed, 0, 0);
    c.style.left = sp.x + "%"; c.style.top = sp.y + "%"; c.style.height = sp.h + "%";
    on(c, "click", e => { e.stopPropagation(); faceScare(c); });   // spotted it? it comes for you
    host.appendChild(c); lurker = c;
    requestAnimationFrame(() => c.classList.add("on"));
    lurkTimer = setTimeout(() => faceScare(c), rr(LURK.lurk));
  }
  setInterval(() => {
    const room = activeRoom(), now = Date.now();
    if (room !== lurkRoom){ clearLurker(); lurkRoom = room; if (room) lurkNext = now + rr(LURK.firstDelay); return; }
    if (!room || scaring || lurker || lurkCount >= LURK.maxPerGame) return;
    if (now >= lurkNext) spawnLurker(room);
  }, 1000);

  // generated static for the glitch
  (function(){
    const n = document.createElement("canvas"); n.width = n.height = 160; const g = n.getContext("2d"), id = g.createImageData(160, 160);
    for (let i = 0; i < id.data.length; i += 4){ const v = Math.random() * 255; id.data[i] = id.data[i+1] = id.data[i+2] = v; id.data[i+3] = 255; }
    g.putImageData(id, 0, 0); document.getElementById("gNoise").style.backgroundImage = `url(${n.toDataURL()})`;
  })();
  function glitchBurst(ms, strong){
    const fx = document.getElementById("glitchFx"), bars = document.getElementById("gBars");
    const room = document.querySelector(".screen.active");
    bars.innerHTML = Array.from({ length: strong ? 9 : 5 }, () => {
      const top = Math.random() * 100, h = 1 + Math.random() * (strong ? 9 : 4), sh = (Math.random() - .5) * (strong ? 60 : 30);
      return `<i style="top:${top}%;height:${h}%;--sh:${sh}px"></i>`;
    }).join("");
    fx.classList.toggle("strong", !!strong); fx.classList.add("on");
    if (room){ room.classList.remove("glitching"); void room.offsetWidth; room.classList.add("glitching"); }
    noiseBurst(ms / 1000 + .05, 3200, .5, strong ? 1.1 : .6);
    setTimeout(() => { fx.classList.remove("on", "strong"); if (room) room.classList.remove("glitching"); }, ms);
  }
  function faceScare(fromEl){
    if (scaring || !dsFrames.closed) return;
    scaring = true; lurkCount++; clearTimeout(lurkTimer);
    const r = fromEl.getBoundingClientRect();
    const ov = document.getElementById("doorScare"), rig = document.getElementById("dsRig"), t1 = document.getElementById("dsT1"), t2 = document.getElementById("dsT2");
    const open = rig.querySelector(".ds-open");
    // 1. the screen breaks up
    glitchBurst(190, false);
    setTimeout(() => {
      if (lurker === fromEl) { fromEl.remove(); lurker = null; }
      // 2. the face tears out of its hiding place, straight at you
      play("stinger", 1);
      document.querySelector(".screen.active")?.classList.add("ds-quake");
      ov.classList.add("on", "glitched");
      const c0 = { x: r.left + r.width / 2, y: r.top + r.height / 2, s: Math.max(.08, r.height / 760) };
      const c1 = { x: innerWidth / 2, y: innerHeight * .5, s: (innerHeight * 2.3) / 760 };
      const place = (el, k) => {
        k = Math.max(0, Math.min(1, k)); const e = 1 - Math.pow(1 - k, 3) * .15 - (1 - Math.pow(k, 2.2)) * .85;
        const x = c0.x + (c1.x - c0.x) * e, y = c0.y + (c1.y - c0.y) * e, sc = c0.s + (c1.s - c0.s) * e, rot = (Math.random() - .5) * 2 * (1 - k);
        el.style.transform = `translate(${x}px, ${y}px) scale(${sc}) rotate(${rot - 3 + 5 * e}deg) translate(-50%, -50%)`;
        return e;
      };
      const t0 = performance.now(), DUR = 230;
      (function frame(t){
        const k = (t - t0) / DUR;
        const e = place(rig, k); place(t1, k - .1); place(t2, k - .2);
        rig.style.opacity = Math.min(1, k * 4).toFixed(3);
        t1.style.opacity = (Math.min(1, k * 3) * .35).toFixed(3); t2.style.opacity = (Math.min(1, k * 3) * .18).toFixed(3);
        rig.style.filter = `blur(${(1.2 + 3.5 * e).toFixed(2)}px) brightness(${(.6 + .5 * e).toFixed(2)}) contrast(1.15)`;
        if (open) open.style.opacity = Math.max(0, Math.min(1, (k - .2) / .5)).toFixed(3);
        if (k < 1) requestAnimationFrame(frame);
        else setTimeout(() => {
          // 3. it breaks apart in the static and is gone
          glitchBurst(150, true);
          setTimeout(() => {
            ov.classList.remove("on", "glitched"); [rig, t1, t2].forEach(el => { el.style.opacity = 0; });
            document.querySelector(".ds-quake")?.classList.remove("ds-quake");
            scaring = false; lurkNext = Date.now() + rr(LURK.gap);
          }, 90);
        }, 80);
      })(performance.now());
    }, 150);
  }

  scope.add(() => {
    clearLurker();
    ["dsT2", "dsT1", "dsRig"].forEach(id => document.getElementById(id).replaceChildren());
  });

  return scope.dispose;
}
