import { createScope } from "../../game/scope.js";
import { noiseBurst, play, setDroneLevel, soundsReady } from "../../game/audio.js";
import { basementFaceImage, basementImagesReady } from "../../game/media.js";

// Milliseconds from the moment the elevator opens.
const LAMPS_OUT = 2000;
const FACE = 2800;
const CUT = 3500;
const DOORS_OPEN = 600;
const BUZZ_LENGTH = 0.22; // seconds

// The laugh comes first and the scream is held under it so the laugh stays clear. At full
// volume the scream is louder than the laugh for most of its length.
const SCREAM_DELAY = 0.15; // seconds
const SCREAM_VOLUME = 0.5;

// Where the face sits in basement_face.png: halfway between her eyes and her mouth. Her hair
// streams off to the left, so the middle of the picture is not the middle of the face.
const FACE_X = 74.5; // %
const FACE_Y = 43.2; // %
const FACE_LOOK = "brightness(0.8) contrast(1.2) saturate(0.85)";

const random = (min, max) => min + Math.random() * (max - min);

// Graded once ahead of time, because filtering a picture this size every frame would stutter.
let gradedFace = null;
function gradeFace() {
  const img = basementFaceImage();
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const context = canvas.getContext("2d");
  context.filter = FACE_LOOK; // ignored by browsers without canvas filters; see makeFaceCopies()
  context.drawImage(img, 0, 0);
  return canvas;
}

// Everything the scare needs, ready before the elevator opens.
let prepared = null;
export function prepareBasement() {
  prepared ??= Promise.all([basementImagesReady(), soundsReady()]).then(() => {
    try {
      gradedFace = gradeFace();
    } catch {
      // the picture failed to load: the flash and shake still play
    }
  });
  return prepared;
}

// One sharp face, two faint copies on top that trail behind it as motion blur.
function makeFaceCopies(host) {
  if (!gradedFace) return [];
  const canvasFilters = "filter" in gradedFace.getContext("2d");
  return [1, 0.22, 0.1].map((opacity) => {
    const canvas = document.createElement("canvas");
    canvas.width = gradedFace.width;
    canvas.height = gradedFace.height;
    canvas.getContext("2d").drawImage(gradedFace, 0, 0);
    if (!canvasFilters) canvas.style.filter = FACE_LOOK;
    host.appendChild(canvas);
    return { canvas, opacity };
  });
}

// Each lamp gets its own short, unevenly spaced dips.
function planFlicker() {
  const dips = [];
  let at = random(150, 400);
  while (at < LAMPS_OUT - 120) {
    const length = random(40, 170);
    dips.push({ at, end: at + length, depth: random(0.45, 1) });
    at += length + random(120, 520);
  }
  return dips;
}

function lampLevel(dips, t) {
  const dip = dips.find((d) => t >= d.at && t < d.end);
  return (dip ? 1 - dip.depth : 1) - Math.abs(Math.sin(t / 37)) * 0.07;
}

function planBuzz() {
  const times = [];
  for (let at = 0; at < LAMPS_OUT - BUZZ_LENGTH * 1000; at += random(110, 200)) times.push(at);
  return times;
}

// The hit: drawn fresh each frame from one clock so sound and picture can't drift apart.
export function runBasementScene(root, onFinal) {
  const scope = createScope();
  const { setTimeout, requestAnimationFrame } = scope;
  const find = (selector) => root.querySelector(selector);
  const shake = find(".bm-shake"), faceHost = find(".bm-face"), flash = find(".bm-flash");
  const black = find(".bm-black"), room = find(".bm-room"), dim = find(".bm-dim");
  const doors = [find(".bm-door.left"), find(".bm-door.right")];
  const lamps = ["l1", "l2"].map((id) => ({
    glow: find(`.bm-glow.${id}`),
    off: find(`.bm-off.${id}`),
    dips: planFlicker(),
  }));
  const buzz = planBuzz();
  let nextBuzz = 0;

  const smallest = 0.06;
  // At full size her eyes and mouth (about 400 pixels tall, 320 wide) just fit on screen. The
  // face, her hair and the vignette fill the rest.
  const largest = Math.min(innerHeight / 400, innerWidth / 320);
  // Exponential scale reads as an object approaching at speed. Scale and tilt both turn
  // around the middle of the face, so it stays centred all the way in.
  const placeFace = ({ canvas, opacity }, k) => {
    const clamped = Math.max(0, Math.min(1, k));
    const eased = Math.pow(clamped, 1.4);
    const scale = smallest * Math.pow(largest / smallest, eased);
    const tilt = -5 - 12 * (1 - clamped);
    canvas.style.transform = `translate(${-FACE_X}%, ${-FACE_Y}%) rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
    // Starts dark and lights up as it arrives.
    canvas.style.opacity = (opacity * Math.min(1, 0.2 + clamped * 1.6)).toFixed(3);
  };
  let copies = [];

  const drawLamps = (t) => {
    let total = 0;
    lamps.forEach(({ glow, off, dips }) => {
      const level = Math.max(0, lampLevel(dips, t));
      glow.style.opacity = level.toFixed(3);
      off.style.opacity = (1 - level).toFixed(3);
      total += level;
    });
    dim.style.opacity = (0.72 - 0.37 * (total / 2)).toFixed(3);
    while (nextBuzz < buzz.length && buzz[nextBuzz] <= t) {
      noiseBurst(BUZZ_LENGTH, 120, 10, 1.6);
      if (Math.random() < 0.35) noiseBurst(0.06, 2600, 4, 0.05);
      nextBuzz++;
    }
  };

  const drawDoors = (t) => {
    const k = Math.min(1, t / DOORS_OPEN);
    const eased = 1 - Math.pow(1 - k, 3);
    doors[0].style.transform = `translateX(${(-100 * eased).toFixed(2)}%)`;
    doors[1].style.transform = `translateX(${(100 * eased).toFixed(2)}%) scaleX(-1)`;
    if (k === 1) doors.forEach((door) => { door.style.display = "none"; });
  };

  const drawScare = (t) => {
    const k = (t - FACE) / (CUT - FACE);
    copies.forEach((copy, i) => placeFace(copy, k - i * 0.05));
    flash.style.opacity = (0.14 + 0.76 * Math.exp((FACE - t) / 110)).toFixed(3);
    const amount = 34 * (0.55 + 0.45 * k);
    shake.style.transform = `translate(${random(-amount, amount).toFixed(1)}px, ${random(-amount, amount).toFixed(1)}px) rotate(${random(-1.4, 1.4).toFixed(2)}deg)`;
  };

  let lampsOut = false;
  let scared = false;
  let startedAt = null;
  const frame = (now) => {
    startedAt ??= now;
    const t = now - startedAt;
    if (t >= CUT) {
      root.querySelector(".bm-scene").style.display = "none"; // the hard cut, before React re-renders
      onFinal();
      return;
    }
    if (t < LAMPS_OUT) {
      drawLamps(t);
      if (t <= DOORS_OPEN + 40) drawDoors(t);
    } else if (!lampsOut) {
      lampsOut = true;
      room.style.visibility = "hidden";
      setDroneLevel(0, 0.008);
    }
    if (t >= FACE) {
      if (!scared) {
        scared = true;
        black.style.visibility = "hidden";
        play("witch_laugh", 1);
        play("basement_jumpscare", SCREAM_VOLUME, 0, SCREAM_DELAY);
        noiseBurst(0.6, 110, 0.7, 2.6);
      }
      drawScare(t);
    }
    requestAnimationFrame(frame);
  };

  // A slow connection gets a moment of black rather than a stuttering scare.
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    copies = makeFaceCopies(faceHost);
    copies.forEach((copy) => placeFace(copy, 0));
    setDroneLevel(0.03, 0.45);
    requestAnimationFrame(frame);
  };
  prepareBasement().then(start);
  setTimeout(start, 1500);

  scope.add(() => {
    started = true; // a late prepareBasement() must not restart a disposed scene
    faceHost.replaceChildren();
  });
  return scope.dispose;
}
