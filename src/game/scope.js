// Tracks every timer, animation frame and listener a scene starts, so it can all be
// stopped together. Scenes shadow the global timer functions with these versions,
// which keeps React StrictMode's mount/unmount/mount from running a loop twice.
export function createScope() {
  const timeouts = new Set();
  const intervals = new Set();
  const frames = new Set();
  const cleanups = [];

  return {
    setTimeout(fn, ms) {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        fn();
      }, ms);
      timeouts.add(id);
      return id;
    },
    clearTimeout(id) {
      timeouts.delete(id);
      window.clearTimeout(id);
    },
    setInterval(fn, ms) {
      const id = window.setInterval(fn, ms);
      intervals.add(id);
      return id;
    },
    clearInterval(id) {
      intervals.delete(id);
      window.clearInterval(id);
    },
    requestAnimationFrame(fn) {
      const id = window.requestAnimationFrame((t) => {
        frames.delete(id);
        fn(t);
      });
      frames.add(id);
      return id;
    },
    on(target, type, fn, options) {
      target.addEventListener(type, fn, options);
      cleanups.push(() => target.removeEventListener(type, fn, options));
    },
    add(cleanup) {
      cleanups.push(cleanup);
    },
    dispose() {
      timeouts.forEach((id) => window.clearTimeout(id));
      intervals.forEach((id) => window.clearInterval(id));
      frames.forEach((id) => window.cancelAnimationFrame(id));
      timeouts.clear();
      intervals.clear();
      frames.clear();
      cleanups.splice(0).forEach((cleanup) => cleanup());
    },
  };
}
