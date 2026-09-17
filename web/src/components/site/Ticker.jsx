import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate, useInView, useReducedMotion } from 'motion/react';
import { useSignIn } from '../../App.jsx';
import { ASKS, modelColor } from '../../data.js';
import { Photo, Reveal, TextReveal } from './bits.jsx';
import { ease, rise, stagger } from '../../motion.js';

const SPEED = 44; // px a second

/* One ask. When the card drifts into view the model thinks for a moment, then answers word by word;
   when it drifts out it forgets, so the strip stays alive on every pass. */
function Card({ a, k, onOpen }) {
  const ref = useRef(null);
  const seen = useInView(ref, { amount: 0.75 });
  const still = useReducedMotion();
  const [phase, setPhase] = useState(still ? 'answer' : 'idle');
  useEffect(() => {
    if (still) return;
    if (!seen) { setPhase('idle'); return; }
    const off = (k % 4) * 140;
    const t1 = setTimeout(() => setPhase('thinking'), 200 + off);
    const t2 = setTimeout(() => setPhase('answer'), 1050 + off);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [seen, still, k]);
  const words = a.a.split(' ');
  return (
    <motion.button ref={ref} className="ditem" type="button" onClick={onOpen} variants={rise} whileHover={{ y: -4 }} transition={{ duration: 0.22, ease }}>
      <span className="row"><Photo n={a.ph} className="who pho" /><span className="q">{a.q}</span></span>
      <span className="a">
        <b><span style={{ color: modelColor(a.model) }}>{a.model}</span>{phase === 'thinking' && <span className="dots" aria-hidden="true"><i /><i /><i /></span>}</b>
        <span className="atext">
          {phase === 'answer'
            ? words.map((w, i) => <span key={i}><motion.span className="w" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease, delay: i * 0.032 }}>{w}</motion.span>{' '}</span>)
            : <span className="ghost">{a.a}</span>}
        </span>
      </span>
    </motion.button>
  );
}

/* the asks as a strip, not a wall: it drifts on its own clock, rests under the pointer, and each
   card plays its answer as it comes by; open one and you are asked to sign in with it ready */
export default function Ticker() {
  const signIn = useSignIn();
  const track = useRef(null);
  const x = useMotionValue(0);
  const still = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [half, setHalf] = useState(0);
  useLayoutEffect(() => {
    const el = track.current; if (!el) return;
    const measure = () => setHalf(el.scrollWidth / 2);
    measure();
    const ro = new ResizeObserver(measure); ro.observe(el);
    return () => ro.disconnect();
  }, []);
  useEffect(() => {
    if (still || paused || !half) return;
    const from = -(((-x.get()) % half + half) % half);
    const c = animate(x, [from, from - half], { duration: half / SPEED, ease: 'linear', repeat: Infinity, repeatType: 'loop' });
    return () => c.stop();
  }, [still, paused, half, x]);

  const row = (prefix) => ASKS.map((a, k) => <Card key={`${prefix}${k}`} a={a} k={k} onOpen={() => signIn(a.q, 'Sign in to ask this')} />);
  return (
    <section className="dt">
      <div className="shell dthead">
        <Reveal><p className="slbl">What people ask</p><TextReveal as="h2" style={{ maxWidth: '18ch', margin: 0 }}>Ask about anything you already have.</TextReveal></Reveal>
        <Reveal as="p" className="body" delay={0.1}>Email, files, calendars, the plan in the shared drive. Everyone connects their own accounts, and Nash answers from what you allow.</Reveal>
      </div>
      <div className="dtick" aria-label="Examples of what people ask" onPointerEnter={() => setPaused(true)} onPointerLeave={() => setPaused(false)}>
        <motion.div ref={track} className="dtrack" style={{ x }} variants={stagger(0.07)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }}>
          {row('a')}{row('b')}
        </motion.div>
      </div>
    </section>
  );
}
