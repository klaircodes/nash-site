import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, cubicBezier, useTransform } from 'motion/react';
import { ease } from '../../motion.js';

/* The tour as a cut film, run the way a video timeline runs: every value is a function of the clock.
   Camera and cursor are keyframes, captions have an in and an out.
   Seeking, pausing and looping all fall out of that; nothing is a fire-and-forget animation. */
const E = cubicBezier(0.16, 1, 0.3, 1);
const CAM = cubicBezier(0.65, 0, 0.35, 1);
const CAM_MS = 1500, CUR_MS = 750, TYPE_MS = 38;

/* cam: where the camera goes and when. cur: where the cursor goes and when. caps: what is said, from-to.
   acts: things done to the app at a moment. Times in ms from the start of the scene. */
/* Pacing rules, from broadcast captioning and Remotion's caption guidance: a caption holds for half a second plus a third
   of a second per word (never under 1.8s), captions sit at least 1.2s apart, nothing is said over a click, a camera move
   gets its 1.5s plus a beat before anything else happens, and every result on screen is held for a second before the
   cursor moves on. Words stream at about 90ms each. */
export const SCENES = [
  { key: 'open', title: 'Welcome', blurb: 'One place for the whole team', dur: 5900, pos: 'low',
    cam: [{ at: 0, zoom: 1 }],
    cur: [{ at: 300, sel: '.landing', fx: 0.5, fy: 0.62 }],
    caps: [{ at: 500, end: 2300, text: 'This is / **Nash.**' }, { at: 2800, end: 5300, text: 'One place for / **your whole team.**' }],
    acts: [] },
  { key: 'ask', title: 'Ask anything', blurb: 'Type the way you would say it', dur: 9600, pos: 'mid',
    cam: [{ at: 0, sel: '.ccard', zoom: 1.5, rx: 10, ry: -4 }],
    cur: [{ at: 1600, sel: '.ccard textarea', fx: 0.08, fy: 0.5 }, { at: 7900, sel: '.ccard .send' }],
    caps: [{ at: 700, end: 2400, text: 'Ask in / **plain words.**' }, { at: 4800, end: 7600, text: 'The way you would ask / **a colleague.**' }],
    acts: [[2700, 'click'], [2900, 'type', 'What did Claire say about the launch date?'], [9000, 'click'], [9080, 'ask', 'What did Claire say about the launch date?']] },
  { key: 'answer', title: 'It answers', blurb: 'From the email, files and calendar you allow', dur: 8600, pos: 'low', keep: true,
    cam: [{ at: 0, sel: '.msgs', zoom: 1.25, rx: 7, ry: -5 }],
    cur: [{ at: 300, sel: '.msgs', fx: 0.9, fy: 0.8 }, { at: 4400, sel: '.turn.agent .mtext', fx: 0.3, fy: 0.5 }, { at: 5600, sel: '.turn.agent .hbtn:nth-child(1)' }],
    caps: [{ at: 300, end: 2800, text: 'It reads what / **you let it.**' }, { at: 5200, end: 7400, text: 'Copy it. / **Or ask again.**' }],
    acts: [[0, 'ensure', 'What did Claire say about the launch date?'], [200, 'stream', 2400], [4800, 'hover', true], [8200, 'hover', false]] },
  { key: 'model', title: 'Every model', blurb: 'Pick one, switch any time, keep the thread', dur: 22000, pos: 'right',
    cam: [{ at: 0, sel: '.modelpick', zoom: 1.6, rx: 7, ry: -8 }, { at: 4000, sel: '.mpanel', zoom: 1.15, rx: 4, ry: -11 }, { at: 11500, sel: '.ccard', zoom: 1.45, rx: 6, ry: -7 }, { at: 16900, sel: '.msgs .turn:nth-last-child(2)', zoom: 1.3, rx: 5, ry: -6 }],
    cur: [{ at: 2000, sel: '.modelpick' }, { at: 6700, sel: '.mrow.h62|Anthropic', fx: 0.4 }, { at: 9200, sel: '.mrow.h44|Claude Sonnet 4.6', fx: 0.4 }, { at: 12500, sel: '.ccard textarea', fx: 0.08 }, { at: 15400, sel: '.ccard .send' }, { at: 19000, sel: '.msgs .turn:nth-last-child(2) .mtext', fx: 0.85, fy: 0.5 }],
    caps: [{ at: 400, end: 2600, text: '**Every model** / in one place.' }, { at: 4300, end: 6500, text: 'Pick one. / **Switch** any time.', tone: 'light' }, { at: 18400, end: 20800, text: 'Your context / **comes with you.**', pos: 'leftwide' }],
    acts: [[0, 'ensure', 'What did Claire say about the launch date?'], [3100, 'click'], [3550, 'openPicker'], [7900, 'click'], [7950, 'drill', 'anthropic'], [10400, 'click'], [10450, 'cycle', 'model', ['Gemini 2.5 Pro', 'Grok 4', 'Claude Opus 4.7', 'GPT 5', 'Claude Sonnet 4.6'], 110], [11000, 'closePicker'], [13600, 'click'], [13800, 'type', 'Why did she move it?'], [16500, 'click'], [16580, 'ask', 'Why did she move it?'], [16660, 'cycle', 'label', ['GPT 4.1', 'Gemini 2.5 Pro', 'Grok 4', 'Claude Opus 4.7', 'Claude Sonnet 4.6'], 110], [17200, 'stream', 2400]] },
  { key: 'tools', title: 'Connectors', blurb: 'Gmail, Drive, Calendar, MCP', dur: 14400, pos: 'left',
    cam: [{ at: 0, sel: '.trow', zoom: 1.5, rx: 5, ry: -3 }, { at: 3400, sel: '.fly.mcpp', zoom: 1.3, rx: 1, ry: 4 }, { at: 9700, sel: '.trow', zoom: 1.5, rx: 4, ry: 1 }],
    cur: [{ at: 1800, sel: '.rbtn.mcp' }, { at: 4000, sel: '.mcprow|Google Calendar|.sw' }],
    caps: [{ at: 400, end: 2400, text: 'Gmail. Drive. / **Calendar.**' }, { at: 5800, end: 7700, text: 'Anything on / **MCP.**' }, { at: 11400, end: 13800, text: 'Each person connects / **their own.**' }],
    acts: [[2900, 'click'], [2950, 'openFly', 'mcp'], [5200, 'click'], [5250, 'toggle', 'Google Calendar'], [8200, 'click'], [8250, 'toggle', 'Google Calendar'], [9600, 'closeFly']] },
  { key: 'team', title: 'Bring the team', blurb: 'One workspace, one bill', dur: 12800, pos: 'right',
    cam: [{ at: 0, sel: '.orgbtn', zoom: 1.35, rx: 3, ry: 7 }, { at: 3500, sel: '.fly.org', zoom: 1.35, rx: 2, ry: 9 }, { at: 8700, sel: '.orgbtn', zoom: 1.35, rx: 3, ry: 7 }],
    cur: [{ at: 2100, sel: '.orgbtn' }, { at: 4600, sel: '.fly.org .orgrow:nth-of-type(2)' }],
    caps: [{ at: 800, end: 2800, text: 'One workspace. / **One bill.**' }, { at: 5400, end: 7600, text: 'A spend cap / **per person.**' }, { at: 10200, end: 12200, text: '**Bring** / **the team.**' }],
    acts: [[100, 'drawer', true], [3300, 'click'], [3350, 'openFly', 'org'], [8600, 'closeFly'], [12400, 'drawer', false]] },
  { key: 'close', title: 'Try it yourself', blurb: 'Your chats stay yours', dur: 6100, pos: 'low',
    cam: [{ at: 0, zoom: 1 }],
    cur: [{ at: 600, sel: '.landing', fx: 0.5, fy: 0.62 }],
    caps: [{ at: 700, end: 2700, text: 'Your chats / **stay yours.**' }, { at: 3200, end: 5400, text: '**Try it** / yourself.' }],
    acts: [[200, 'reset']] },
];

/* one dial for the whole cut: 1 is the reading-speed reference above, lower is brisker. Typing, streaming and
   the model flicker keep their own rates; only the beats between them scale. */
const PACE = 0.82;
for (const sc of SCENES) {
  sc.dur = Math.round(sc.dur * PACE);
  sc.cam.forEach((k) => { k.at = Math.round(k.at * PACE); });
  sc.cur.forEach((k) => { k.at = Math.round(k.at * PACE); });
  sc.caps.forEach((c) => { c.at = Math.round(c.at * PACE); c.end = Math.round(c.end * PACE); });
  sc.acts.forEach((a) => { a[0] = Math.round(a[0] * PACE); });
}

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
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const mix = (a, b, p) => a + (b - a) * p;

export default function Director({ active, playing, api, root, frame, cam, cur, tilt, capT, i, setI, prog, onScenes, onCap, seekRef }) {
  const [scenes, setScenes] = useState([]);
  const [click, setClick] = useState(0);
  const [epoch, setEpoch] = useState(0);
  const pendingFrac = useRef(0);
  const st = useRef(null);
  const lean = useRef({ rx: 0, ry: 0 });
  const viaSeek = useRef(false);
  /* snap: after a seek the first keyframes land at once, like a video; in the flow they ease from wherever things are */
  const fresh = (elapsed = 0, snap = false) => ({ elapsed, snap, fired: new Set(), typing: null, streaming: null, cycle: null, capKey: null, camK: -1, camFrom: null, camTo: null, camAt: 0, curK: -1, curFrom: null, curTo: null, curAt: 0, tiltFrom: { ...lean.current }, tiltTo: { ...lean.current } });
  const before = (k) => scenes.slice(0, k).reduce((n, s) => n + s.dur, 0);
  const phone = () => window.matchMedia('(max-width: 768px)').matches;

  /* the surface leans toward what the camera is looking at */
  const tiltFor = (to, kf) => {
    const k = phone() ? 0 : 1;
    if (kf && (kf.rx !== undefined || kf.ry !== undefined)) return { rx: (kf.rx || 0) * k, ry: (kf.ry || 0) * k };
    const fr = frame.current?.getBoundingClientRect(); if (!fr || to.z <= 1.06) return { rx: 0, ry: 0 };
    const cx = (fr.width / 2 - to.x) / to.z, cy = (fr.height / 2 - to.y) / to.z;
    return { ry: ((cx - fr.width / 2) / fr.width) * 8 * k, rx: -((cy - fr.height / 2) / fr.height) * 6 * k };
  };

  /* a screen point carried back through the lean and the camera into app coordinates, so the cursor and the framing
     land on what the eye sees, whatever angle the picture is at */
  const unproject = (sx, sy) => {
    const fr = frame.current?.getBoundingClientRect(), el3 = frame.current?.querySelector('.cam3d'); if (!fr || !el3) return null;
    const cs = getComputedStyle(el3);
    const m = new DOMMatrix(cs.transform === 'none' ? undefined : cs.transform);
    const [ox, oy] = cs.transformOrigin.split(' ').map(parseFloat);
    const M = new DOMMatrix().translateSelf(ox, oy).multiplySelf(m).multiplySelf(new DOMMatrix().translateSelf(-ox, -oy));
    const px = sx - fr.left, py = sy - fr.top;
    const a = M.m11 - px * M.m14, b = M.m21 - px * M.m24, c = px * M.m44 - M.m41;
    const d = M.m12 - py * M.m14, e = M.m22 - py * M.m24, f = py * M.m44 - M.m42;
    const det = a * e - b * d; if (Math.abs(det) < 1e-9) return null;
    const x = (c * e - b * f) / det, y = (a * f - c * d) / det, z = cam.z.get();
    return { x: (x - cam.x.get()) / z, y: (y - cam.y.get()) / z };
  };
  const local = (el) => {
    const fr = frame.current.getBoundingClientRect(), r = el.getBoundingClientRect();
    const c = unproject(r.left + r.width / 2, r.top + r.height / 2); if (!c) return null;
    const w = el.offsetWidth || r.width / cam.z.get(), h = el.offsetHeight || r.height / cam.z.get();
    return { left: c.x - w / 2, top: c.y - h / 2, width: w, height: h, W: fr.width, H: fr.height };
  };
  const camTarget = (kf) => {
    const fr = frame.current?.getBoundingClientRect(); if (!fr) return null;
    if (!kf.sel) { const z = kf.zoom || 1; return { z, x: (fr.width - z * fr.width) / 2, y: (fr.height - z * fr.height) / 2 }; }
    const el = find(root, kf.sel); if (!el) return null;
    const l = local(el); if (!l) return null;
    const cap = phone() ? 1 : kf.zoom;
    const z = Math.max(1, Math.min(kf.zoom, cap, (l.W * 0.92) / l.width, (l.H * 0.92) / l.height));
    return { z, x: Math.min(0, Math.max(l.W - z * l.W, l.W / 2 - z * (l.left + l.width / 2))), y: Math.min(0, Math.max(l.H - z * l.H, l.H / 2 - z * (l.top + l.height / 2))) };
  };
  const curTarget = (kf) => { const el = find(root, kf.sel); if (!el) return null; const l = local(el); if (!l) return null; return { x: l.left + l.width * (kf.fx ?? 0.5), y: l.top + l.height * (kf.fy ?? 0.5) }; };

  const run = (a) => {
    const A = api.current; const [op, ...args] = a;
    if (op === 'click') setClick((c) => c + 1);
    else if (op === 'type') st.current.typing = { text: args[0], started: st.current.elapsed };
    else if (op === 'ask') { A?.ask(args[0]); A?.setText(''); st.current.typing = null; }
    else if (op === 'ensure') A?.ensure(args[0]);
    else if (op === 'cycle') st.current.cycle = { target: args[0], list: args[1], every: args[2], started: st.current.elapsed };
    else if (op === 'stream') st.current.streaming = { ms: args[0], started: st.current.elapsed + 600 };
    else if (op === 'hover') A?.hoverLast(args[0]);
    else if (op === 'openPicker') A?.openPicker();
    else if (op === 'closePicker') A?.closePicker();
    else if (op === 'drill') A?.drill(args[0]);
    else if (op === 'pick') A?.setModel({ name: args[0], ep: args[1] });
    else if (op === 'openFly') A?.openFly(args[0]);
    else if (op === 'closeFly') A?.closeFly();
    else if (op === 'toggle') A?.toggleServer(args[0]);
    else if (op === 'reset') A?.reset();
    else if (op === 'drawer') { if (window.matchMedia('(max-width:768px)').matches) { A?.setDrawer(args[0]); A?.fold(args[0]); } }
  };

  /* one tick of the timeline: actions that are due, then every continuous value from the clock */
  const tick = (sc, s) => {
    const t = s.elapsed;
    sc.acts.forEach((act, k) => { if (act[0] <= t && !s.fired.has(k)) { s.fired.add(k); try { run(act.slice(1)); } catch (e) { console.warn('tour action failed', act, e); } } });
    if (s.typing) { const n = Math.floor((t - s.typing.started) / TYPE_MS); api.current?.setText(s.typing.text.slice(0, Math.max(0, n))); if (n >= s.typing.text.length) s.typing = null; }
    if (s.cycle) { const k = Math.floor((t - s.cycle.started) / s.cycle.every); const name = s.cycle.list[Math.min(k, s.cycle.list.length - 1)]; if (s.cycle.target === 'model') api.current?.setModel({ name, ep: /claude/i.test(name) ? 'anthropic' : /gemini/i.test(name) ? 'google' : /grok/i.test(name) ? 'xai' : 'openai' }); else api.current?.setLastModel(name); if (k >= s.cycle.list.length - 1) s.cycle = null; }
    if (s.streaming) { const p = clamp01((t - s.streaming.started) / s.streaming.ms); api.current?.stream(p); if (p >= 1) s.streaming = null; }
    /* camera: the latest keyframe that is due; its target is measured once it can be, then eased to */
    let k = -1; sc.cam.forEach((kf, j) => { if (kf.at <= t) k = j; });
    if (k !== s.camK && k >= 0) { const to = camTarget(sc.cam[k]); if (to) { s.camK = k; s.camFrom = { z: cam.z.get(), x: cam.x.get(), y: cam.y.get() }; s.camTo = to; s.camAt = s.snap ? t - CAM_MS : t; s.tiltFrom = { ...lean.current }; s.tiltTo = tiltFor(to, sc.cam[k]); } }
    /* a slow drift keeps the surface alive even on a wide shot; the lean toward the target rides on top */
    const drift = phone() ? 0 : 1, T = before(i) + t, total = scenes.reduce((n, x) => n + x.dur, 0) || 1, ph = (2 * Math.PI * T) / total;
    const dRx = 1.4 * drift * Math.sin(2 * ph), dRy = 2 * drift * Math.sin(3 * ph + 1.2);
    if (s.camTo) { const p = CAM(clamp01((t - s.camAt) / CAM_MS)); cam.z.set(mix(s.camFrom.z, s.camTo.z, p)); cam.x.set(mix(s.camFrom.x, s.camTo.x, p)); cam.y.set(mix(s.camFrom.y, s.camTo.y, p)); lean.current = { rx: mix(s.tiltFrom.rx, s.tiltTo.rx, p), ry: mix(s.tiltFrom.ry, s.tiltTo.ry, p) }; }
    tilt.rx.set(lean.current.rx + dRx); tilt.ry.set(lean.current.ry + dRy);
    let c = -1; sc.cur.forEach((kf, j) => { if (kf.at <= t) c = j; });
    if (c !== s.curK && c >= 0) { const to = curTarget(sc.cur[c]); if (to) { s.curK = c; s.curFrom = { x: cur.x.get(), y: cur.y.get() }; s.curTo = to; s.curAt = s.snap ? t - CUR_MS : t; } }
    if (s.curTo) { const p = CAM(clamp01((t - s.curAt) / CUR_MS)); cur.x.set(mix(s.curFrom.x, s.curTo.x, p)); cur.y.set(mix(s.curFrom.y, s.curTo.y, p)); }
    /* captions: each has an in and an out */
    const cp = sc.caps.find((x) => x.at <= t && t < x.end);
    const key = cp ? `${sc.key}-${cp.at}` : null;
    if (key !== s.capKey) { s.capKey = key; onCap(cp ? { key, text: cp.text, pos: cp.pos || sc.pos, tone: cp.tone || '' } : null); }
    capT.set(cp ? t - cp.at : 0);
    prog.set(Math.min(1, t / sc.dur));
    if (s.camK >= 0) s.snap = false;
  };

  /* seek like a video: to a point inside a chapter; everything before that point happens at once */
  useEffect(() => {
    if (!seekRef) return;
    seekRef.current = (k, f) => { viaSeek.current = true; pendingFrac.current = Math.max(0, Math.min(0.97, f || 0)); if (k === i) setEpoch((e) => e + 1); else setI(k); };
    return () => { seekRef.current = null; };
  }, [seekRef, i, setI]);

  /* which scenes have something to point at, at this size */
  useEffect(() => {
    if (!active) { setScenes([]); onScenes([]); return; }
    const pick = () => { const list = SCENES.filter((s) => s.keep || s.cam.every((kf) => !kf.sel) || s.cam.some((kf) => kf.sel && find(root, kf.sel))); setScenes(list); onScenes(list); };
    let t = setTimeout(pick, 300);
    const onResize = () => { clearTimeout(t); t = setTimeout(pick, 250); };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [active, root, onScenes]);

  /* a new scene, or a seek: clean slate, then one catch-up tick so the clock is right before the first frame */
  useEffect(() => {
    const sc = scenes[i];
    st.current = fresh(pendingFrac.current * (sc?.dur || 0), viaSeek.current);
    pendingFrac.current = 0;
    onCap(null); capT.set(0);
    prog.set(sc ? st.current.elapsed / sc.dur : 0);
    if (!sc || !active) return;
    if (viaSeek.current || i === 0) { api.current?.reset?.(); viaSeek.current = false; }
    const t = setTimeout(() => tick(sc, st.current), 60);
    return () => clearTimeout(t);
  }, [i, scenes, active, epoch]);

  /* the clock: only runs while playing, so pause stops typing, camera and captions together */
  useEffect(() => {
    if (!active || !playing || !scenes.length) return;
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(64, now - last); last = now;
      const s = st.current, sc = scenes[i]; if (!s || !sc) return;
      s.elapsed += dt;
      tick(sc, s);
      if (s.elapsed >= sc.dur) { setI((n) => (n + 1) % scenes.length); return; }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [active, playing, scenes, i, epoch]);

  /* leaving the film: the camera comes back to wide and anything the film left open closes */
  useEffect(() => {
    if (active) return;
    const from = { z: cam.z.get(), x: cam.x.get(), y: cam.y.get() }; const t0 = performance.now(); let raf;
    const back = (now) => { const p = E(clamp01((now - t0) / 600)); cam.z.set(mix(from.z, 1, p)); cam.x.set(mix(from.x, 0, p)); cam.y.set(mix(from.y, 0, p)); if (p < 1) raf = requestAnimationFrame(back); };
    raf = requestAnimationFrame(back);
    const tf = { rx: tilt.rx.get(), ry: tilt.ry.get() }; const flat = (now) => { const p = E(clamp01((now - t0) / 500)); tilt.rx.set(mix(tf.rx, 0, p)); tilt.ry.set(mix(tf.ry, 0, p)); if (p < 1) requestAnimationFrame(flat); }; requestAnimationFrame(flat);
    lean.current = { rx: 0, ry: 0 };
    onCap(null); api.current?.closePicker?.(); api.current?.closeFly?.();
    return () => cancelAnimationFrame(raf);
  }, [active]);

  return active ? (
    <motion.div className="fcursor" style={{ x: cur.x, y: cur.y }} aria-hidden="true">
      <AnimatePresence>{click > 0 && <motion.i key={click} initial={{ scale: 0.3, opacity: 0.7 }} animate={{ scale: 2.6, opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} />}</AnimatePresence>
      <svg width="18" height="20" viewBox="0 0 18 20"><path d="M2 1.5l13.2 9.6-5.8 1.1 3.3 6.2-2.6 1.4-3.3-6.3L2.8 18z" fill="#fff" stroke="#131211" strokeWidth="1.3" strokeLinejoin="round"/></svg>
    </motion.div>
  ) : null;
}

/* Dynamic captions driven by the clock: each word rises in at its own moment after the caption starts,
   so seeking into the middle of one shows exactly the words that should be there. */
const WORD_MS = 70, WORD_IN = 340;
function Word({ capT, n, big, children }) {
  const from = n * WORD_MS;
  const opacity = useTransform(capT, [from, from + WORD_IN], [0, 1], { ease: E });
  const y = useTransform(capT, [from, from + WORD_IN], [14, 0], { ease: E });
  const scale = useTransform(capT, [from, from + WORD_IN + (big ? 120 : 0)], [big ? 1.6 : 1.3, 1], { ease: E });
  return <motion.span className="kw" style={{ opacity, y, scale }}>{children}</motion.span>;
}
export function Kinetic({ text, capT }) {
  const lines = text.split('/').map((l) => l.trim()).filter(Boolean);
  let n = 0;
  return lines.map((line, li) => {
    const big = line.startsWith('**');
    const words = line.replace(/\*\*/g, '').split(' ').filter(Boolean);
    return (
      <span key={li} className={`kl${big ? ' big' : ''}`}>
        {words.map((w, wi) => <Word key={wi} capT={capT} n={n++} big={big}>{w}{wi < words.length - 1 ? ' ' : ''}</Word>)}
      </span>
    );
  });
}
