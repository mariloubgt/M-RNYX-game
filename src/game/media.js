// Every media file the game uses. All of them live in public/media.
const image = (path) => `/media/images/${path}`;

export const VIDEO = {
  menu: "/media/video/haunted_gate_preview.mp4",
  entry: "/media/video/game_background_clean.mp4",
};

export const BASEMENT_IMAGE = image("basement.jpg");
const BASEMENT_FACE_IMAGE = image("basement_face.png");

export const WARD_IMAGES = {
  corridor: image("ward/corridor.jpg"),
  woman: image("ward/woman.png"),
};

// Kitchen art: the base picture, the door/cupboard panels (p_) and the things you drag aside (d_).
export const KITCHEN_IMAGES = {
  base: image("kitchen/base.jpg"),
  slam: image("kitchen/slam.jpg"),
  p_ulL: image("kitchen/panel-ulL.jpg"),
  p_ulR: image("kitchen/panel-ulR.jpg"),
  p_umL: image("kitchen/panel-umL.jpg"),
  p_umR: image("kitchen/panel-umR.jpg"),
  p_ovL: image("kitchen/panel-ovL.jpg"),
  p_ovR: image("kitchen/panel-ovR.jpg"),
  p_drawer: image("kitchen/panel-drawer.jpg"),
  p_lcab: image("kitchen/panel-lcab.jpg"),
  p_rcab: image("kitchen/panel-rcab.jpg"),
  p_door: image("kitchen/panel-door.jpg"),
  d_kettle: image("kitchen/kettle.png"),
  d_micro: image("kitchen/micro.png"),
  d_plates: image("kitchen/plates.png"),
};

export const SOUNDS = {
  stinger: "/media/audio/stinger.mp3",
  walk: "/media/audio/walk.mp3",
  door_open: "/media/audio/door_open.mp3",
  door_lock: "/media/audio/door_lock.mp3",
  monster_step: "/media/audio/monster_step.mp3",
  jumpscare: "/media/audio/jumpscare.mp3",
  basement_jumpscare: "/media/audio/basement_jumpscare.mp3",
  witch_laugh: "/media/audio/witch_laugh.mp3",
  ambience: "/media/audio/ambience.mp3",
};

// The rooms start hidden, and browsers don't fetch images inside hidden elements.
// Loading them up front stops them popping in the first time a room is shown.
const preloaded = [];
export function preloadMedia() {
  for (const src of [...Object.values(WARD_IMAGES), ...Object.values(KITCHEN_IMAGES)]) {
    const img = new Image();
    img.src = src;
    preloaded.push(img);
  }
  basementImagesReady();
}

// Downloads and decodes the basement pictures once. A failed load still resolves, so the
// scare is never held up by it.
const load = (src) => {
  const img = new Image();
  img.src = src;
  preloaded.push(img);
  return { img, ready: img.decode().catch(() => {}) };
};
let basementImages = null;
export function basementImagesReady() {
  basementImages ??= { room: load(BASEMENT_IMAGE), face: load(BASEMENT_FACE_IMAGE) };
  return Promise.all([basementImages.room.ready, basementImages.face.ready]);
}
export function basementFaceImage() {
  basementImagesReady();
  return basementImages.face.img;
}
