/* One motion vocabulary, the same one the product uses: everything decelerates
   into place, nothing overshoots. */
export const ease = [0.16, 1, 0.3, 1];
export const dur = { press: 0.09, hover: 0.16, swap: 0.26, move: 0.38, page: 0.42 };

export const liquid = { type: 'spring', stiffness: 260, damping: 32, mass: 0.9 };

export const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.68, ease } },
};
export const pop = {
  hidden: { opacity: 0, scale: 0.5, y: 8 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.55, ease } },
};
export const slideIn = {
  hidden: { opacity: 0, x: 44 },
  show: { opacity: 1, x: 0, transition: { duration: 0.85, ease } },
};
export const stagger = (gap = 0.07, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});
export const page = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: dur.page, ease } },
  exit: { opacity: 0, y: 6, transition: { duration: 0.22, ease } },
};
export const popMenu = {
  initial: { opacity: 0, x: 0, y: -6, scale: 0.98 },
  animate: { opacity: 1, x: 0, y: 0, scale: 1 },
  exit: { opacity: 0, y: -6, scale: 0.98 },
  transition: { duration: 0.18, ease },
};
export const popSide = {
  initial: { opacity: 0, x: -10, y: 0, scale: 0.98 },
  animate: { opacity: 1, x: 0, y: 0, scale: 1 },
  exit: { opacity: 0, x: -8, scale: 0.98 },
  transition: liquid,
};
export const popUp = {
  initial: { opacity: 0, x: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, x: 0, y: 0, scale: 1 },
  exit: { opacity: 0, y: 6, scale: 0.98 },
  transition: liquid,
};
export const popDialog = {
  initial: { opacity: 0, y: 10, scale: 0.99 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 8, scale: 0.99 },
  transition: liquid,
};
export const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.18, ease },
};
