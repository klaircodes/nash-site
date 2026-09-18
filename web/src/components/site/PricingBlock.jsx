import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, animate, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { useSignIn } from '../../App.jsx';
import { Reveal, Stagger, Item } from './bits.jsx';
import { photo } from '../../data.js';
import { ease } from '../../motion.js';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/* a number that counts up the first time it is seen */
function Count({ to, prefix = '$' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  const still = useReducedMotion();
  const [v, setV] = useState(still ? to : 0);
  useEffect(() => {
    if (!inView || still) return;
    const c = animate(0, to, { duration: 1.1, ease, onUpdate: (x) => setV(Math.round(x)) });
    return () => c.stop();
  }, [inView, to, still]);
  return <span ref={ref}>{prefix}{v}</span>;
}

/* digits that roll like a counter: every digit column holds a strip of 0-9 and slides to the one it needs;
   columns are keyed from the right so a number growing a digit does not re-roll the rest */
const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
function Roll({ text }) {
  const chars = text.split('');
  return (
    <span className="roll" aria-label={text}>
      {chars.map((ch, k) => {
        const key = chars.length - k;
        if (!/\d/.test(ch)) return <span key={`s${key}`} aria-hidden="true">{ch}</span>;
        return (
          <span key={key} className="rc" aria-hidden="true">
            <span className="ghost">{ch}</span>
            <motion.span className="strip" initial={false} animate={{ y: `${-Number(ch) * 10}%` }} transition={{ duration: 0.45, ease }}>
              {DIGITS.map((d) => <span key={d}>{d}</span>)}
            </motion.span>
          </span>
        );
      })}
    </span>
  );
}

const TICK = <svg viewBox="0 0 16 16"><path d="m3.5 8.5 3 3 6-7"/></svg>;
const TIERS = [
  { n: 'Starter', amt: '$25', per: 'a month', d: 'On your own. Every model, a memory that follows you.', li: ['Every AI model', 'Memory that follows you', 'Generous monthly usage', '1 GB of documents a month'], b: 'Get started' },
  { n: 'Team', amt: '$49', per: 'a person a month', d: 'For the team. One bill, pooled usage, a cap per person.', li: ['Everything in Starter', 'Admin controls and spend caps', 'Pooled usage, 5 GB of documents', 'Usage analytics'], b: 'Start a team', lead: true, pop: 'Most teams' },
  { n: 'Business', amt: '$69', per: 'a person a month', d: 'When IT gets involved. Identity, audit, allow-lists.', li: ['Everything in Team', 'Single sign-on and role-based access', 'Audit logs', 'Model allow-listing, 20 GB of documents'], b: 'Talk to sales' },
  { n: 'Enterprise', amt: 'Talk to us', per: '', d: 'For the whole company, on your terms.', li: ['Everything in Business', 'Private deployment', 'Custom usage and retention', 'A person to call'], b: 'Talk to sales', words: true },
];

/* The pricing block layouts B and C shared: four numerals, a seat slider, the copy. */
export default function PricingBlock({ full = false }) {
  const signIn = useSignIn();
  const still = useReducedMotion();
  const [n, setN] = useState(still ? 12 : 1);
  const [hint, setHint] = useState(false);
  const heads = useRef(null);
  const inView = useInView(heads, { once: true, margin: '0px 0px -18% 0px' });
  /* the first time it is seen, the team grows to twelve on its own; then it is yours */
  useEffect(() => {
    if (!inView || still) return;
    const c = animate(1, 12, { duration: 1.6, delay: 0.25, ease, onUpdate: (v) => setN(Math.round(v)), onComplete: () => setHint(true) });
    return () => c.stop();
  }, [inView, still]);
  const pct = ((n - 1) / 199) * 100;
  const shown = Math.min(n, 14);
  const thumbLeft = `calc(9px + (100% - 18px) * ${pct / 100})`;
  return (
    <section className="s7 dpr"><div className="shell">
      {!full && <Reveal as="p" className="slbl">Pricing</Reveal>}
      <Reveal as="p" className="intro"><b>Every plan includes every model.</b> The price is about how many of you there are.</Reveal>
      {full ? (
        <Stagger className="tiers">
          {TIERS.map((t) => (
            <Item key={t.n} className={`tier${t.lead ? ' lead' : ''}`}>
              {t.pop && <span className="pop">{t.pop}</span>}
              <p className="n">{t.n}</p>
              <p className={`price${t.words ? ' words' : ''}`}><span className="amt">{t.amt}</span>{t.per && <span className="per">{t.per}</span>}</p>
              <p className="d">{t.d}</p>
              <ul>{t.li.map((x) => <li key={x}>{TICK}{x}</li>)}</ul>
              <button className="b" type="button" onClick={() => signIn('', t.b === 'Talk to sales' ? 'Talk to sales' : 'Sign in to get started')}>{t.b}</button>
            </Item>
          ))}
        </Stagger>
      ) : (
      <Stagger className="row">
        <Item className="plan"><p className="n"><Count to={25} /></p><p className="lab">a month, on your own</p></Item>
        <Item className="plan lead"><p className="n"><Count to={49} /></p><p className="lab">a person, for the team</p></Item>
        <Item className="plan"><p className="n"><Count to={69} /></p><p className="lab">a person, when IT gets involved</p></Item>
        <Item className="plan"><p className="n word">Talk to us</p><p className="lab">for the whole company</p></Item>
      </Stagger>
      )}
      <Reveal className="calc">
        <div className="heads" aria-hidden="true" ref={heads}>
          <AnimatePresence initial={false}>
            {Array.from({ length: shown }, (_, k) => (
              <motion.span key={k} className="hd pho" initial={{ scale: 0.2, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.2, opacity: 0, y: 10 }} transition={{ duration: 0.4, ease }}>
                <img src={photo((k % 14) + 1)} alt="" />
              </motion.span>
            ))}
            {n > shown && (
              <motion.span key="more" className="hd more" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.4, opacity: 0 }} transition={{ duration: 0.26, ease }}>+{n - shown}</motion.span>
            )}
          </AnimatePresence>
        </div>
        <p className="out">
          {n >= 200 ? <>Past 200 people, <b>talk to us</b>.</> : <><Roll text={String(n)} /> {n === 1 ? 'person' : 'people'} on Team is <b><Roll text={fmt.format(n * 49)} /></b> a month.</>}
        </p>
        <div className="trackwrap">
          <input type="range" min="1" max="200" step="1" value={n} aria-label="Team size" style={{ '--fill': `${pct}%` }} onChange={(e) => { setHint(false); setN(+e.target.value); }} />
          <motion.span className="thumbhint" aria-hidden="true" style={{ left: thumbLeft }} initial={false}
            animate={hint ? { scale: [1, 2.8], opacity: [0.55, 0] } : { opacity: 0 }} transition={hint ? { duration: 1, repeat: 2, ease: 'easeOut' } : { duration: 0 }} />
        </div>
      </Reveal>
      <Reveal as="p" className="rest">Team adds admin controls, pooled usage and a spend cap per person. Business adds single sign-on, audit logs and role-based access. Enterprise is a conversation.</Reveal>
      <Reveal className="go">
        <button className="btn solid" type="button" onClick={() => signIn('', 'Sign in to get started')}>Get started</button>
        {!full && <Link className="btn" to="/pricing">See it in full</Link>}
      </Reveal>
    </div></section>
  );
}
