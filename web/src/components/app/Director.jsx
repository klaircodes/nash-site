import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, animate } from 'motion/react';
import { ease } from '../../motion.js';

/* The tour as a cut film. A camera zooms and pans over the live app, a cursor does the work,
   and edited captions run along the bottom. Each scene is a shot list with timings in ms. */
const CAM = [0.65, 0, 0.35, 1];
const TYPE_MS = 34;

export const SCENES = [
  { key: 'open', title: 'Welcome', blurb: 'One place for the whole team', dur: 4200, pos: 'low', cam: { zoom: 1 },
    caps: [[200, 'This is **Nash.**'], [1600, 'One place for / **your whole team.**']],
    acts: [[300, 'move', '.landing', 0.5, 0.62]] },
  { key: 'ask', title: 'Ask anything', blurb: 'Type the way you would say it', dur: 7600, pos: 'mid', cam: { sel: '.ccard', zoom: 1.5 },
    caps: [[300, 'Ask in / **plain words.**'], [4300, 'The way you would / ask a **colleague.**']],
    acts: [[500, 'move', '.ccard textarea', 0.08, 0.5], [1300, 'click'], [1500, 'type', 'What did Priya say about the launch date?'], [6600, 'move', '.ccard .send', 0.5, 0.5], [7100, 'click']] },
  { key: 'model', title: 'Every model', blurb: 'Pick one, switch any time', dur: 11400, pos: 'right', cam: { sel: '.modelpick', zoom: 1.6 },
    caps: [[300, '**Every model** / in one place.'], [2500, 'Pick one. / **Switch** any time.', 'light'], [6800, 'Your context / **comes with you.**']],
    acts: [[1200, 'move', '.modelpick', 0.5, 0.5], [2000, 'click'], [2450, 'openPicker'], [2900, 'cam', '.mpanel', 1.15], [3800, 'move', '.mrow.h62|Anthropic', 0.4, 0.5], [4500, 'click'], [4550, 'drill', 'anthropic'], [5600, 'move', '.mrow.h44|Claude Sonnet 4.6', 0.4, 0.5], [6400, 'click'], [6450, 'pick', 'Claude Sonnet 4.6', 'anthropic'], [6500, 'closePicker'], [6900, 'cam', '.modelpick', 1.6], [7500, 'move', '.modelpick', 0.5, 0.5]] },
  { key: 'tools', title: 'Connectors', blurb: 'Gmail, Drive, Calendar, MCP', dur: 8200, pos: 'left', cam: { sel: '.trow', zoom: 1.5 },
    caps: [[300, 'Gmail. Drive. / **Calendar.**'], [2600, 'Anything / on **MCP.**'], [5300, 'Each person / connects **their own.**']],
    acts: [[600, 'move', '.rbtn.mcp', 0.5, 0.5], [1200, 'click'], [1250, 'openFly', 'mcp'], [1700, 'cam', '.fly.mcpp', 1.3], [2700, 'move', '.mcprow|Google Calendar|.sw', 0.5, 0.5], [3400, 'click'], [3450, 'toggle', 'Google Calendar'], [5000, 'click'], [5050, 'toggle', 'Google Calendar'], [6300, 'closeFly'], [6400, 'cam', '.trow', 1.5]] },
  { key: 'team', title: 'Bring the team', blurb: 'One workspace, one bill', dur: 7400, pos: 'right', cam: { sel: '.orgbtn', zoom: 1.35 },
    caps: [[300, 'One workspace. / **One bill.**'], [3000, 'A spend cap / **per person.**'], [5300, '**Bring** / **the team.**']],
    acts: [[100, 'drawer', true], [700, 'cam', '.orgbtn', 1.35], [900, 'move', '.orgbtn', 0.5, 0.5], [1500, 'click'], [1550, 'openFly', 'org'], [2000, 'cam', '.fly.org', 1.35], [3000, 'move', '.fly.org .orgrow:nth-of-type(2)', 0.5, 0.5], [5600, 'closeFly'], [5700, 'cam', '.orgbtn', 1.35], [6900, 'drawer', false]] },
  { key: 'close', title: 'Try it yourself', blurb: 'Your chats stay yours', dur: 4200, pos: 'low', cam: { zoom: 1 },
    caps: [[300, 'Your chats / **stay yours.**'], [2200, '**Try it** / yourself.']],
    acts: [[200, 'reset'], [600, 'move', '.landing', 0.5, 0.62]] },
];

/* "selector|text|child": the first visible element matching the selector whose text includes the phrase,
   or a descendant of it when a child selector is given */
const visible = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
function find(root, spec) {
  if (!root.current) return null;
  const [sel, text, child] = spec.split('|');
  for (const el of root.current.querySelectorAll(sel)) {
    if (text && !el.textContent.includes(text)) continue;
    const target = child ? el.querySelector(child) : el;
    if (target && visible(target)) return target;
  }
  return null;
}

export default function Director({ active, playing, api, root, frame, cam, cur, i, setI, prog, onScenes, onCap, seekRef }) {
  const [scenes, setScenes] = useState([]);
  const [click, setClick] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const pendingFrac = useRef(0);
  /* seek like a video: to a point inside a chapter; everything before that point happens at once */
  useEffect(() => {
    if (!seekRef) return;
    seekRef.current = (k, f) => { pendingFrac.current = Math.max(0, Math.min(0.97, f || 0)); if (k === i) setEpoch((e) => e + 1); else setI(k); };
    return () => { seekRef.current = null; };
  }, [seekRef, i, setI]);
  const st = useRef({ elapsed: 0, fired: new Set(), typing: null, capIdx: -1 });

  /* app-local coordinates of an element, whatever the camera is doing */
  const local = (el) => {
    const fr = frame.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    const z = cam.z.get(), x = cam.x.get(), y = cam.y.get();
    return { left: (r.left - fr.left - x) / z, top: (r.top - fr.top - y) / z, width: r.width / z, height: r.height / z, W: fr.width, H: fr.height };
  };
  const shoot = (sel, zoom, dur = 1.1) => {
    const el = sel ? find(root, sel) : null;
    const fr = frame.current?.getBoundingClientRect(); if (!fr) return;
    let x = 0, y = 0, z = zoom;
    if (el) {
      const l = local(el);
      /* on a phone the picture barely zooms at all: the whole screen is the close-up */
      const cap = window.matchMedia('(max-width: 768px)').matches ? 1.12 : zoom;
      z = Math.max(1, Math.min(zoom, cap, (l.W * 0.92) / l.width, (l.H * 0.92) / l.height));
      x = Math.min(0, Math.max(l.W - z * l.W, l.W / 2 - z * (l.left + l.width / 2)));
      y = Math.min(0, Math.max(l.H - z * l.H, l.H / 2 - z * (l.top + l.height / 2)));
    } else z = 1;
    animate(cam.z, z, { duration: dur, ease: CAM }); animate(cam.x, x, { duration: dur, ease: CAM }); animate(cam.y, y, { duration: dur, ease: CAM });
  };
  const moveTo = (sel, fx = 0.5, fy = 0.5, dur = 0.75) => {
    const el = find(root, sel); if (!el) return;
    const l = local(el);
    animate(cur.x, l.left + l.width * fx, { duration: dur, ease: CAM }); animate(cur.y, l.top + l.height * fy, { duration: dur, ease: CAM });
  };
  const run = (a) => {
    const A = api.current; const [op, ...args] = a;
    if (op === 'move') moveTo(...args);
    else if (op === 'click') setClick((c) => c + 1);
    else if (op === 'type') st.current.typing = { text: args[0], started: st.current.elapsed };
    else if (op === 'cam') setTimeout(() => shoot(args[0], args[1]), 90); // a beat, so what it frames has had time to appear
    else if (op === 'openPicker') A?.openPicker();
    else if (op === 'closePicker') A?.closePicker();
    else if (op === 'drill') A?.drill(args[0]);
    else if (op === 'pick') A?.setModel({ name: args[0], ep: args[1] });
    else if (op === 'openFly') A?.openFly(args[0]);
    else if (op === 'closeFly') A?.closeFly();
    else if (op === 'toggle') A?.toggleServer(args[0]);
    else if (op === 'reset') A?.reset();
    else if (op === 'drawer') { if (window.matchMedia('(max-width:768px)').matches) A?.setDrawer(args[0]); }
  };

  /* which scenes have something to point at, at this size */
  useEffect(() => {
    if (!active) { setScenes([]); onScenes([]); return; }
    const t = setTimeout(() => { const list = SCENES.filter((s) => !s.cam.sel || find(root, s.cam.sel)); setScenes(list); onScenes(list); }, 300);
    return () => clearTimeout(t);
  }, [active, root, onScenes]);

  /* a new scene: clean slate, frame the shot (or land part-way in, after a seek) */
  useEffect(() => {
    const sc = scenes[i];
    st.current = { elapsed: pendingFrac.current * (sc?.dur || 0), fired: new Set(), typing: null, capIdx: -1 };
    pendingFrac.current = 0;
    prog.set(sc ? st.current.elapsed / sc.dur : 0); onCap(null);
    if (!sc || !active) return;
    api.current?.reset?.();
    /* after a seek, a camera move that already happened wins over the scene's opening shot */
    const seekedPast = st.current.elapsed > 0 && sc.acts.some((a) => a[0] <= st.current.elapsed && a[1] === 'cam');
    const t = setTimeout(() => { if (!seekedPast) shoot(sc.cam.sel, sc.cam.zoom); }, 60);
    return () => clearTimeout(t);
  }, [i, scenes, active, epoch]);

  /* the clock: only runs while playing, so pause stops typing and time together */
  useEffect(() => {
    if (!active || !playing || !scenes.length) return;
    let raf, last = performance.now();
    const tick = (now) => {
      const dt = Math.min(64, now - last); last = now;
      const s = st.current; const sc = scenes[i]; if (!sc) return;
      s.elapsed += dt;
      sc.acts.forEach((act, k) => { if (act[0] <= s.elapsed && !s.fired.has(k)) { s.fired.add(k); try { run(act.slice(1)); } catch (e) { console.warn('tour action failed', act, e); } } });
      if (s.typing) { const n = Math.floor((s.elapsed - s.typing.started) / TYPE_MS); api.current?.setText(s.typing.text.slice(0, Math.max(0, n))); if (n >= s.typing.text.length) s.typing = null; }
      let ci = -1; sc.caps.forEach((c, k) => { if (c[0] <= s.elapsed) ci = k; });
      if (ci !== s.capIdx) { s.capIdx = ci; onCap(ci < 0 ? null : { key: `${sc.key}-${ci}`, text: sc.caps[ci][1], pos: sc.pos, tone: sc.caps[ci][2] || '' }); }
      prog.set(Math.min(1, s.elapsed / sc.dur));
      if (s.elapsed >= sc.dur) { setI((n) => (n + 1) % scenes.length); return; }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, playing, scenes, i, epoch]);

  /* leaving the film: the camera comes back to wide, and anything the film left open closes */
  useEffect(() => { if (!active) { animate(cam.z, 1, { duration: 0.6, ease }); animate(cam.x, 0, { duration: 0.6, ease }); animate(cam.y, 0, { duration: 0.6, ease }); api.current?.closePicker?.(); api.current?.closeFly?.(); } }, [active]);

  return active ? (
    <motion.div className="fcursor" style={{ x: cur.x, y: cur.y }} aria-hidden="true">
      <AnimatePresence>{click > 0 && <motion.i key={click} initial={{ scale: 0.3, opacity: 0.7 }} animate={{ scale: 2.6, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} />}</AnimatePresence>
      <svg width="18" height="20" viewBox="0 0 18 20"><path d="M2 1.5l13.2 9.6-5.8 1.1 3.3 6.2-2.6 1.4-3.3-6.3L2.8 18z" fill="#fff" stroke="#131211" strokeWidth="1.3" strokeLinejoin="round"/></svg>
    </motion.div>
  ) : null;
}

/* Dynamic captions: a few words at a time, stacked, one line big and in the accent.
   "/" breaks a line, **so** marks the big one. Each word slams in, biggest last. */
export function Kinetic({ text }) {
  const lines = text.split('/').map((l) => l.trim()).filter(Boolean);
  let n = 0;
  return lines.map((line, li) => {
    const big = line.startsWith('**');
    const words = line.replace(/\*\*/g, '').split(' ').filter(Boolean);
    return (
      <span key={li} className={`kl${big ? ' big' : ''}`}>
        {words.map((w, wi) => {
          const d = 0.05 + (n++) * 0.07;
          return (
            <motion.span key={wi} className="kw" initial={{ opacity: 0, scale: big ? 1.6 : 1.3, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: big ? 0.42 : 0.34, ease, delay: d }}>{w}{wi < words.length - 1 ? '\u00a0' : ''}</motion.span>
          );
        })}
      </span>
    );
  });
}
