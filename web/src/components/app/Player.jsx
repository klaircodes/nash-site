import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useTransform, animate } from 'motion/react';
import NashApp from './NashApp.jsx';
import Director, { Kinetic } from './Director.jsx';
import { ModeSwitch } from '../site/SiteNav.jsx';
import { ease } from '../../motion.js';

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* One home for the app in both Tour and Try. In Tour it sits inside a screen on a dark stage and a
   director runs a cut film over it: camera, cursor, captions. In Try the same instance fills the window.
   Leaving Tour is a curtain: the chrome fades and the screen's edges run out to the window's. */
export default function Player({ mode, setMode, curtain }) {
  const root = useRef(null);
  const frame = useRef(null);
  const api = useRef(null);
  const player = mode === 'tour';
  const [scenes, setScenes] = useState([]);
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const prog = useMotionValue(0);
  const width = useTransform(prog, (v) => `${v * 100}%`);
  const cam = { z: useMotionValue(1), x: useMotionValue(0), y: useMotionValue(0) };
  const cur = { x: useMotionValue(700), y: useMotionValue(420) };
  const capT = useMotionValue(0);
  const tilt = { rx: useMotionValue(0), ry: useMotionValue(0) };
  const onScenes = useCallback((list) => { setScenes(list); setI((n) => (n < list.length ? n : 0)); }, []);
  const [cap, setCap] = useState(null);
  const capEl = useRef(null);
  /* on a phone the picture is not zoomed, so a caption goes where there is room: under the last message, over the
     dim when a sheet is open, low over the drawer, or up top when the app is empty */
  useEffect(() => {
    if (!cap || !window.matchMedia('(max-width: 760px)').matches) return;
    const place = () => {
      const el = capEl.current, fr = frame.current?.getBoundingClientRect(), app = root.current; if (!el || !fr || !app) return;
      const H = fr.height, h = el.offsetHeight || 120;
      const vis = (n) => n && n.getBoundingClientRect().height > 0;
      let top = H * 0.08;
      if (vis(app.querySelector('.navwrap.drawer'))) top = H * 0.6;
      else if (vis(app.querySelector('.mscrim.on'))) top = H * 0.06;
      else {
        const turns = [...app.querySelectorAll('.msgs .turn')].filter(vis);
        if (turns.length) {
          const streaming = !!app.querySelector('.msgs .mtext.streaming');
          const below = Math.max(...turns.map((t) => t.getBoundingClientRect().bottom)) - fr.top + 20 + (streaming ? 44 : 0);
          const ceil = ['.fly', '.ccard'].map((q) => app.querySelector(q)).filter(vis).map((n) => n.getBoundingClientRect().top - fr.top - 16 - h);
          top = Math.max(H * 0.08, Math.min(below, ...ceil));
        }
      }
      /* once placed, a caption only ever moves down, so a streaming answer nudges it rather than shakes it */
      const cur = parseFloat(el.style.getPropertyValue('--cap-top'));
      if (!Number.isNaN(cur) && top < cur) top = cur;
      el.style.setProperty('--cap-top', `${Math.round(top)}px`);
    };
    place(); const t = setInterval(place, 150);
    return () => clearInterval(t);
  }, [cap]);
  const seekRef = useRef(null);
  const onCap = useCallback((c) => setCap(c), []);
  const jump = (n) => { setI(n); setPlaying(true); };

  /* the curtain, both ways */
  const [leaving, setLeaving] = useState(null);
  const [entering, setEntering] = useState(null);
  const prev = useRef(mode);
  useEffect(() => {
    setLeaving(null);
    if (mode === 'tour') {
      setPlaying(true); setI(0);
      if (prev.current === 'try' && frame.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setEntering({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight });
      }
    }
    prev.current = mode;
  }, [mode]);
  useEffect(() => {
    if (!entering) return;
    const box = frame.current?.parentElement?.getBoundingClientRect(); if (!box) return setEntering(null);
    const c = animate(frame.current, { top: box.top, left: box.left, width: box.width, height: box.height, borderRadius: 14 },
      { duration: 0.8, ease, onComplete: () => setEntering(null) });
    return () => c.stop();
  }, [entering]);
  const toTry = useCallback(() => {
    if (leaving) return;
    const el = frame.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setMode('try');
    const r = el.getBoundingClientRect();
    setPlaying(false);
    setLeaving({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [leaving, setMode]);
  useEffect(() => {
    if (!leaving) return;
    const c = animate(frame.current, { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0 },
      { duration: 0.9, ease, onComplete: () => setMode('try') });
    return () => c.stop();
  }, [leaving, setMode]);
  const switchMode = (k) => (k === 'try' && player ? toTry() : setMode(k));
  useEffect(() => { if (!curtain) return; curtain.current = toTry; return () => { curtain.current = null; }; }, [curtain, toTry]);

  const filming = player && !leaving && !entering;
  const sc = scenes[i];
  return (
    <div className={`${player ? 'player' : 'appframe'}${leaving ? ' leaving' : ''}${entering ? ' entering' : ''}`}>
      {player ? <div className="ptop"><ModeSwitch mode={mode} setMode={switchMode} id="stage" /></div> : null}
      <div className="screenwrap">
        <div className="screenbox">
          <div className="screenshadow" aria-hidden="true" />
          <div className="screen" ref={frame} style={leaving ? { position: 'fixed', ...leaving, borderRadius: 14 } : entering ? { position: 'fixed', ...entering, borderRadius: 0, zIndex: 3 } : undefined}
            onClick={player ? (e) => { if (!e.target.closest('.hdr, .mobilenav')) toTry(); } : undefined}>
            <motion.div className="cam3d" style={{ rotateX: tilt.rx, rotateY: tilt.ry, transformPerspective: 1400 }}>
              <motion.div className="camera" style={{ scale: cam.z, x: cam.x, y: cam.y, transformOrigin: '0 0' }}>
                <NashApp mode={mode} setMode={switchMode} rootRef={root} framed={player} api={api} />
                <Director active={filming} playing={playing} api={api} root={root} frame={frame} cam={cam} cur={cur} tilt={tilt} i={i} setI={setI} prog={prog} onScenes={onScenes} onCap={onCap} seekRef={seekRef} capT={capT} />
              </motion.div>
            </motion.div>
            <AnimatePresence>
              {filming && cap && (
                <motion.div key={cap.key} ref={capEl} data-phone="" className={`kcap ${cap.pos} ${cap.tone}`} aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.18 } }} transition={{ duration: 0.25, ease }}>
                  <Kinetic text={cap.text} capT={capT} />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePaused playing={!player || playing || !!leaving || !!entering} />
          </div>
        </div>
      </div>
      {player ? (
        <div className="pbar">
          <button className="pplay" type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={() => setPlaying((p) => !p)}>
            {playing ? <svg width="14" height="14" viewBox="0 0 14 14"><rect x="2" y="1.5" width="3.4" height="11" rx="1" fill="currentColor"/><rect x="8.6" y="1.5" width="3.4" height="11" rx="1" fill="currentColor"/></svg>
                     : <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3.5 1.8v10.4c0 .8.9 1.3 1.6.9l8-5.2c.6-.4.6-1.3 0-1.7l-8-5.2c-.7-.5-1.6 0-1.6.8z" fill="currentColor"/></svg>}
          </button>
          <span className="pcap">{sc ? sc.title : 'Tour'}</span>
          <div className="pchap" role="group" aria-label="Chapters">
            {scenes.map((s, k) => (
              <button key={s.key} type="button" className={k === i ? 'cur' : ''} aria-label={s.title}
                onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setPlaying(true); (seekRef.current || jump)(k, (e.clientX - r.left) / r.width); }}>
                <span className="clabel" aria-hidden="true"><b>{s.title}</b><span>{s.blurb}</span></span>
                <i>{k < i ? <b style={{ width: '100%' }} /> : k === i ? <motion.b style={{ width }} /> : <b style={{ width: 0 }} />}</i>
              </button>
            ))}
          </div>
          <Clock prog={prog} scenes={scenes} i={i} />
          <button className="ptry" type="button" onClick={toTry}>Try it yourself</button>
        </div>
      ) : null}
    </div>
  );
}

/* the clock subscribes to time on its own, so the rest of the player is not redrawn every frame */
function Clock({ prog, scenes, i }) {
  const before = scenes.slice(0, i).reduce((n, s) => n + s.dur, 0);
  const total = scenes.reduce((n, s) => n + s.dur, 0) / 1000;
  const t = useTransform(prog, (v) => fmt((before + v * (scenes[i]?.dur || 0)) / 1000));
  return <span className="ptime"><motion.span>{t}</motion.span> / {fmt(total)}</span>;
}

/* a quiet mark in the corner while the film is paused */
function AnimatePaused({ playing }) {
  return (
    <motion.div className="ppaused" initial={false} animate={{ opacity: playing ? 0 : 1, scale: playing ? 0.9 : 1 }} transition={{ duration: 0.26 }} aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 14 14"><path d="M3.5 1.8v10.4c0 .8.9 1.3 1.6.9l8-5.2c.6-.4.6-1.3 0-1.7l-8-5.2c-.7-.5-1.6 0-1.6.8z" fill="currentColor"/></svg>
    </motion.div>
  );
}
