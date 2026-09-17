import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSignIn } from '../../App.jsx';
import { SEQUENCE, modelColor } from '../../data.js';
import { ease } from '../../motion.js';

/* The Learn more hero composer runs a scripted loop: an ask is typed, sent,
   answered word by word, then the next. Type anything yourself and the script
   steps aside; sending asks you to sign in. */
export default function HeroSequence() {
  const signIn = useSignIn();
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState('');
  const [phase, setPhase] = useState('typing'); // typing | sent | reply | hold
  const [own, setOwn] = useState('');
  const [manual, setManual] = useState(false);
  const still = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const seq = SEQUENCE[i];

  useEffect(() => {
    if (manual || still.current) return;
    let t;
    if (phase === 'typing') {
      if (typed.length < seq.ask.length) t = setTimeout(() => setTyped(seq.ask.slice(0, typed.length + 1)), 34);
      else t = setTimeout(() => setPhase('sent'), 700);
    } else if (phase === 'sent') {
      t = setTimeout(() => { setTyped(''); setPhase('reply'); }, 260);
    } else if (phase === 'reply') {
      t = setTimeout(() => setPhase('hold'), 2600);
    } else {
      t = setTimeout(() => { setI((n) => (n + 1) % SEQUENCE.length); setPhase('typing'); }, 2400);
    }
    return () => clearTimeout(t);
  }, [phase, typed, seq, manual]);

  const words = seq.reply.split(' ');
  const showReply = phase === 'reply' || phase === 'hold';
  const value = manual ? own : typed;

  const fire = () => { if (value.trim()) signIn(value.trim()); };

  return (
    <div className="win bare"><div className="cwrap">
      <div className={`composer${manual ? ' focus' : ''}`}>
        <div className="crow">
          <button className="cbtn plus" type="button" aria-label="More tools" onClick={() => signIn('', 'Sign in to add to chat')}>
            <svg viewBox="0 0 20 20"><path d="M3.5 10h13"/><path className="bar2" d="M10 3.5v13"/></svg>
          </button>
          <textarea className={`field${!manual && typed ? ' typing' : ''}`} rows="1" placeholder="Ask anything…" spellCheck="false"
            value={value}
            onFocus={() => { setManual(true); setOwn(''); }}
            onChange={(e) => setOwn(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); fire(); } }} />
          <span className="model">GPT 4.1 <svg viewBox="0 0 12 12"><path d="m3 4.5 3 3 3-3"/></svg></span>
          <button className="circ" type="button" aria-label="Voice" onClick={() => signIn('', 'Sign in to talk to Nash')}>
            <svg viewBox="0 0 20 20"><rect x="7.5" y="2.5" width="5" height="9" rx="2.5"/><path d="M4.5 9a5.5 5.5 0 0 0 11 0M10 14.5v3"/></svg>
          </button>
          <button className={`send${(!manual && typed) || own.trim() ? ' armed' : ''}`} type="button" aria-label="Send"
            disabled={!value.trim()} onClick={fire}>
            <svg viewBox="0 0 20 20"><path d="M10 15.5v-11M5 9.5 10 4.5l5 5"/></svg>
          </button>
        </div>
      </div>
      <div className="seq" aria-live="polite">
        <AnimatePresence mode="wait">
          {showReply && !manual && (
            <motion.div key={i} className="reply" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.38, ease }}>
              <span className="ml" style={{ color: modelColor(seq.model) }}>{seq.model}</span>
              <span className="tx">
                {words.map((w, k) => {
                  const bold = w.startsWith('**');
                  const clean = w.replace(/\*\*/g, '');
                  return (
                    <motion.span key={k} className="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * k, duration: 0.24, ease }}>
                      {bold ? <b>{clean}</b> : clean}{' '}
                    </motion.span>
                  );
                })}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div></div>
  );
}
