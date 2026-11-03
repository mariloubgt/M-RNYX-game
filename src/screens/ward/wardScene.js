import { createScope } from "../../game/scope.js";
import { play } from "../../game/audio.js";

// Drives Room I: the walkable corridor, cell doors, flashlight and the woman.
export function initWardScene() {
  const scope = createScope();
  const { setTimeout, setInterval, requestAnimationFrame, on } = scope;

  const patients = [
    { name:"AGNES",  no:"0412", door:3,  bin:"0011", year:1949 },
    { name:"MORRIS", no:"0377", door:5,  bin:"0101", year:1947 },
    { name:"EDITH",  no:"0519", door:6,  bin:"0110", year:1950 },
    { name:"CLARA",  no:"0603", door:9,  bin:"1001", year:1951 },
    { name:"SILAS",  no:"0666", door:11, bin:"0111", year:1952 },
    { name:"OTTO",   no:"0288", door:12, bin:"1100", year:1946 }
  ];
  // the corridor is walked in 3 sections; each section shows its two cell doors up close
  const NEAR = [ { x:20.5, y:20.3, w:9.5, h:78.2, side:"L" }, { x:77.0, y:14.4, w:8.4, h:84, side:"R" } ];
  const SECTIONS = [ [0,1], [2,3], [4,5] ];   // patient index on the left door, right door
  const fileHTML = p => `
      <div class="hd">ST. MORROW · FILE Nº ${p.no}</div>
      <div class="name">${p.name}</div>
      ADMITTED ${p.year}<br>
      CELL ▸ <span class="bin">${p.bin}</span>`;
  const hwDoors = document.getElementById("hwDoors"), hwMarks = document.getElementById("hwMarks");
  const hwCam = document.getElementById("hwCam"), hwVeil = document.getElementById("hwVeil");
  const scene = document.getElementById("scene");
  const tip = document.getElementById("wardTip");
  const closeup = document.getElementById("closeup"), cuBox = document.getElementById("cuBox");
  let sec = 0, wBusy = false;
  const seen = new Set();

  function renderSection(){
    const pair = SECTIONS[sec];
    hwDoors.innerHTML = NEAR.map((d, k) => `
      <button class="hw-door" data-p="${pair[k]}" data-side="${d.side}" style="left:${d.x}%;top:${d.y}%;width:${d.w}%;height:${d.h}%;--w:14">
        <span class="hw-plate">CELL ${patients[pair[k]].door}</span>
        <span class="hw-file"></span>
        <span class="hw-inspect">INSPECT</span>
      </button>`).join("");
    hwMarks.innerHTML = NEAR.map((d, k) => `
      <button class="hw-mark ${seen.has(pair[k]) ? "done" : ""}" data-p="${pair[k]}" style="left:${d.x + d.w/2}%;top:${d.y + d.h*.12}%">${seen.has(pair[k]) ? "✓" : "?"}</button>`).join("")
      + (sec === 0 ? `<button class="hw-mark ${seen.has("note") ? "done" : ""}" data-note="1" style="left:9.2%;top:27%">${seen.has("note") ? "✓" : "?"}</button>` : "");
    document.querySelectorAll("#hwCam [data-sec]").forEach(el => el.style.display = (+el.dataset.sec === sec) ? "" : "none");
    document.getElementById("hwSection").textContent = `SECTION ${sec + 1} / ${SECTIONS.length}`;
    document.getElementById("walkFwd").disabled = sec === SECTIONS.length - 1;
    document.getElementById("walkBack").disabled = sec === 0;
  }
  renderSection();

  // ward sounds: real recordings
  const footsteps = () => play("walk", 1);
  function doorSound(){ play("door_open", 1); }
  function doorClose(){ play("door_lock", .9); }
  // smooth walk: the camera glides forward with a light head-bob, and the next
  // section cross-fades in while the old view keeps moving past you
  const ease = "cubic-bezier(.45,.05,.55,.95)";
  function walk(dir){
    const next = sec + dir;
    if (wBusy || next < 0 || next >= SECTIONS.length) return;
    wBusy = true; footsteps();
    if (tip) tip.style.opacity = 0;
    const fwd = dir > 0;
    hwCam.style.transformOrigin = "55.8% 49.5%";
    hwCam.classList.add("bob");
    hwCam.style.transition = `transform 1s ${ease}`;
    hwCam.style.transform = fwd ? "scale(1.35)" : "scale(.82)";
    hwVeil.classList.add("dim");

    setTimeout(() => {
      // freeze a copy of the current view, it keeps gliding while it fades away
      const ghostView = hwCam.cloneNode(true);
      ghostView.removeAttribute("id");
      ghostView.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
      ghostView.style.transition = "none";
      ghostView.style.transform = getComputedStyle(hwCam).transform;
      ghostView.style.pointerEvents = "none";
      ghostView.classList.add("hw-ghostview");
      hwCam.after(ghostView);

      // the real view jumps to the next section and glides into place underneath
      sec = next; renderSection(); monsterAdvance();
      hwCam.style.transition = "none";
      hwCam.style.transform = fwd ? "scale(.86)" : "scale(1.25)";
      void hwCam.offsetWidth;
      hwCam.style.transition = "transform 1.1s cubic-bezier(.15,.55,.3,1)";
      hwCam.style.transform = "";

      void ghostView.offsetWidth;
      ghostView.style.transition = "transform 1s cubic-bezier(.3,0,.6,1), opacity .9s ease";
      ghostView.style.transform = fwd ? "scale(2)" : "scale(.62)";
      ghostView.style.opacity = "0";
      setTimeout(() => ghostView.remove(), 1000);
      hwVeil.classList.remove("dim");
    }, 700);

    setTimeout(() => { hwCam.classList.remove("bob"); wBusy = false; }, 1850);
  }
  /* ---------- the woman: smooth, lit and placed in the corridor's perspective ---------- */
  const monster = document.getElementById("monster");
  const mHead = document.getElementById("mHead");
  const VP = { x: 55.8, y: 49.5 };    // vanishing point of the corridor photo (%)
  const Z_FAR = 1, Z_NEAR = .16;      // depth: 1 = far end, small = right in front of you
  let z = Z_FAR, zTarget = Z_FAR, lunging = false, litMs = 0, lastStep = 0, lastFilterZ = -1, prevT = performance.now();
  let camW = 1, camH = 1;
  const measure = () => { camW = hwCam.clientWidth || 1; camH = hwCam.clientHeight || 1; };
  measure(); on(window, "resize", measure);
  const BASE_H = .70;                 // the rig is laid out at 70% of the scene height, then scaled
  function layoutMonster(){
    const footOff = 9.6 / z, hPct = 10.4 / z;              // perspective: size and floor position follow 1/depth
    const footY = VP.y + footOff, x = VP.x - 3.2 * (1 - z) / (1 - Z_NEAR) * 1.0;
    if (hwCam.clientWidth) { camW = hwCam.clientWidth; camH = hwCam.clientHeight; }
    const sc = (hPct / 100) / BASE_H;
    const px = x / 100 * camW, py = footY / 100 * camH;
    monster.style.transform = `translate(${px}px, ${py}px) scale(${sc}) translate(-50%, -100%)`;
    monster.style.zIndex = z < .45 ? 8 : 6;
    // atmospheric depth: far away she sinks into the haze, close up she is sharp and dark
    if (Math.abs(z - lastFilterZ) > .025){
      lastFilterZ = z;
      const haze = Math.min(1, (z - Z_NEAR) / (Z_FAR - Z_NEAR));
      monster.style.filter = `brightness(${(.78 + .22 * haze).toFixed(3)}) contrast(${(1.12 - .3 * haze).toFixed(3)}) blur(${(haze * .9).toFixed(2)}px)`;
      monster.style.opacity = (.82 + .18 * (1 - haze)).toFixed(3);
    }
  }
  function lightOnHer(){
    const r = monster.getBoundingClientRect(), sr = scene.getBoundingClientRect();
    const lx = mx + sr.left, ly = my + sr.top, pad = Math.max(30, r.width * .35);
    return lx > r.left - pad && lx < r.right + pad && ly > r.top - pad && ly < r.bottom + pad * .5;
  }
  function mTick(t){
    const dt = Math.min(64, t - prevT); prevT = t;
    const active = document.getElementById("ward").classList.contains("active");
    if (active && !lunging){
      const lit = lightOnHer();
      litMs = lit ? litMs + dt : 0;
      // she only moves when you are not looking at her (faster while you read a door)
      if (!lit){
        const speed = closeup.classList.contains("on") ? .034 : .016;
        zTarget = Math.max(Z_NEAR * .98, zTarget * (1 - speed * dt / 1000));
        if (z < .55 && t - lastStep > 4200){ lastStep = t; play("monster_step", .15 + .5 * (1 - z)); }
      }
      // stare at her long enough and her head slowly bends to the side
      mHead.classList.toggle("tilt", litMs > 1400);
      // glide smoothly toward the target depth
      z += (zTarget - z) * (1 - Math.exp(-dt / 650));
      if (z <= Z_NEAR * 1.01 && !closeup.classList.contains("on")) lunge();
    }
    layoutMonster();
    requestAnimationFrame(mTick);
  }
  requestAnimationFrame(mTick);
  function monsterAdvance(){
    // every walk brings her a big step closer, glided over the next couple of seconds
    if (lunging) return;
    if (zTarget <= Z_NEAR * 1.3){ setTimeout(lunge, 900); return; }
    zTarget = Math.max(Z_NEAR, zTarget * .58);
    setTimeout(() => play("monster_step", .25 + .55 * (1 - zTarget)), 500);
  }
  function lunge(){
    if (lunging) return; lunging = true;
    const lamps = document.querySelectorAll("#hwCam .lampglow");
    lamps.forEach(l => l.style.opacity = 0);                     // the lights die first
    setTimeout(() => {
      play("jumpscare", 1);
      const t0 = performance.now(), z0 = z;
      (function rush(t){                                         // she rushes the camera
        const k = Math.min(1, (t - t0) / 380), e = k * k * k;
        z = z0 + (.045 - z0) * e; layoutMonster();
        if (k < 1) requestAnimationFrame(rush);
        else {
          hwVeil.style.transition = "none"; hwVeil.classList.add("on");  // hard cut to black
          setTimeout(() => {
            z = zTarget = Z_FAR; lastFilterZ = -1; layoutMonster();
            hwVeil.style.transition = "opacity 1.4s ease"; hwVeil.classList.remove("on");
            lamps.forEach(l => l.style.opacity = "");
            setTimeout(() => { hwVeil.style.transition = ""; lunging = false; }, 1400);
          }, 900);
        }
      })(performance.now());
    }, 650);
  }
  document.getElementById("walkFwd").onclick = () => walk(1);
  document.getElementById("walkBack").onclick = () => walk(-1);
  on(document, "keydown", e => {
    if (!document.getElementById("ward").classList.contains("active")) return;
    if (e.target && e.target.tagName === "INPUT") return;
    if (closeup.classList.contains("on")) return;
    if (e.key === "ArrowUp") { walk(1); e.preventDefault(); }
    if (e.key === "ArrowDown") { walk(-1); e.preventDefault(); }
  });

  // clicking a door: the camera moves onto it, then the door is shown up close
  function zoomTo(xPct, yPct, then){
    if (wBusy) return; wBusy = true;
    hwCam.style.transition = "transform .6s cubic-bezier(.4,0,.2,1)";
    hwCam.style.transformOrigin = `${xPct}% ${yPct}%`;
    hwCam.style.transform = "scale(1.7)";
    doorSound();
    setTimeout(() => { then(); wBusy = false; }, 520);
  }
  function zoomOut(){
    if (closeup.classList.contains("on")) doorClose();
    closeup.classList.remove("on");
    hwCam.style.transition = "transform .55s ease-out";
    hwCam.style.transform = "";
  }
  function openClose(html){
    cuBox.innerHTML = `<button class="cu-x" aria-label="Close">✕</button>` + html;
    cuBox.querySelector(".cu-x").onclick = zoomOut;
    closeup.classList.add("on");
  }
  on(closeup, "click", e => { if (e.target === closeup) zoomOut(); });
  on(document, "keydown", e => { if (e.key === "Escape" && closeup.classList.contains("on")) zoomOut(); });
  function inspectDoor(pi){
    const k = SECTIONS[sec].indexOf(pi), d = NEAR[k], p = patients[pi];
    zoomTo(d.x + d.w/2, d.y + d.h/2, () => {
      seen.add(pi); renderSection();
      openClose(`<div class="cu-door">
          <div class="cu-window"><div class="bars"></div></div>
          <div class="cu-bar"></div>
          <div class="plate">CELL ${p.door}</div>
          <div class="file cu-file">${fileHTML(p)}</div>
        </div>`);
    });
  }
  function readNote(){
    zoomTo(9.2, 36, () => {
      seen.add("note"); renderSection();
      openClose(`<div class="note cu-note">
        <b>NIGHT SHIFT LOG</b>
        Every cell number is copied onto the patient's file. The files have never been wrong.<br><br>
        Tonight one of the patients is not in the cell his file gives him.<br>— Nurse R.</div>`);
    });
  }
  on(hwDoors, "click", e => { const b = e.target.closest(".hw-door"); if (b) inspectDoor(+b.dataset.p); });
  on(hwMarks, "click", e => {
    const b = e.target.closest(".hw-mark"); if (!b) return;
    if (b.dataset.note) readNote(); else inspectDoor(+b.dataset.p);
  });
  document.getElementById("nursePaper").onclick = readNote;

  let mx = -999, my = -999;
  function moveLight(e){
    const r = scene.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    scene.style.setProperty("--x", mx + "px");
    scene.style.setProperty("--y", my + "px");
    if (tip) tip.style.opacity = 0;
  }
  on(scene, "pointermove", moveLight);
  on(scene, "pointerdown", moveLight);

  function flickerLoop(){
    const wait = 7000 + Math.random()*9000;
    setTimeout(() => {
      if (document.getElementById("ward").classList.contains("active")){
        let n = 0;
        const f = setInterval(() => {
          scene.classList.toggle("flicker");
          if (++n > 5){ clearInterval(f); scene.classList.remove("flicker"); }
        }, 70);
      }
      flickerLoop();
    }, wait);
  }
  flickerLoop();


  return scope.dispose;
}
