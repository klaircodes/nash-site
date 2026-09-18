import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { modelColor } from '../../data.js';
import { ease } from '../../motion.js';

/* the model's name, and a small flourish whenever it changes */
export function ModelName({ name, className, settle = 'var(--text-secondary-alt)' }) {
  const c = modelColor(name);
  return (
    <motion.span key={name} className={className} initial={{ opacity: 0, y: 4, scale: 1.08, color: c === 'var(--t4)' ? settle : c }} animate={{ opacity: 1, y: 0, scale: 1, color: settle }}
      transition={{ opacity: { duration: 0.18 }, y: { duration: 0.32, ease }, scale: { duration: 0.32, ease }, color: { duration: 0.9, delay: 0.35, ease } }} style={{ display: 'inline-block', transformOrigin: '0 50%' }}>{name}</motion.span>
  );
}
import { I } from '../../icons.jsx';
import { ASKS, SEQUENCE } from '../../data.js';

/* the answer a question gets, signed out: the scripted ones by name, anything else in the same shape */
const FOLLOWUPS = [
  ['why did she move it', 'The **App Store review** window. Apple was quoting five to seven days that week, so shipping on the 17th left no buffer before the 24th.'],
  ['who else was on that thread', 'Tom, and Lena from security was copied on the reply. Nobody else.'],
];
export function answerFor(q) {
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const n = norm(q);
  const fu = FOLLOWUPS.find(([k]) => n === k || n.startsWith(k)); if (fu) return fu[1];
  const seq = SEQUENCE.find((s) => norm(s.ask) === n); if (seq) return seq.reply;
  const ask = ASKS.find((a) => norm(a.q) === n); if (ask) return ask.a;
  const hit = [...SEQUENCE.map((s) => ({ k: s.ask, a: s.reply })), ...ASKS.map((a) => ({ k: a.q, a: a.a }))].find((x) => { const w = norm(x.k).split(' ').filter((t) => t.length > 3); return w.filter((t) => n.includes(t)).length >= 2; });
  if (hit) return hit.a;
  return `Here is what I would do with that once you are signed in: read the **email, files and calendar** you have connected, answer from what is there, and remember what you told me for next time.`;
}

const words = (t) => t.split(' ');
function Rich({ text, count }) {
  const ws = words(text); const shown = count == null ? ws : ws.slice(0, count);
  return shown.map((w, k) => { const b = w.startsWith('**'); const c = w.replace(/\*\*/g, ''); return <span key={k}>{b ? <strong>{c}</strong> : c}{k < shown.length - 1 ? ' ' : ''}</span>; });
}

function Act({ name, title, onClick, className, size = 15 }) {
  return <button className={`hbtn${className ? ` ${className}` : ''}`} type="button" title={title} aria-label={title} onClick={onClick}><I name={name} size={size} /></button>;
}

/* Messages/ui/MessageRender.tsx: a user turn is a bubble on the right; an agent turn is the model's name, then the text,
   then a row of actions that shows on hover. */
export default memo(function Thread({ messages, model, signIn, onRegenerate, onEdit, reserve = false }) {
  const end = useRef(null);
  const [copied, setCopied] = useState(null);
  const [fb, setFb] = useState({});
  const streaming = messages.some((m) => m.streaming);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);
  useEffect(() => { if (!streaming) return; const t = setInterval(() => { const box = end.current?.parentElement; if (box) box.scrollTop = box.scrollHeight; }, 160); return () => clearInterval(t); }, [streaming]);
  const copy = (m) => { try { navigator.clipboard?.writeText(m.text.replace(/\*\*/g, '')); } catch {} setCopied(m.id); setTimeout(() => setCopied((c) => (c === m.id ? null : c)), 1600); };
  return (
    <div className="msgs" role="log" aria-live="polite">
      {messages.map((m) => (
        <div key={m.id} className={`turn ${m.user ? 'user' : 'agent'}${m.hover ? ' hovered' : ''}`}>
          {m.user ? (
            <>
              <div className="bubble"><Rich text={m.text} /></div>
              <div className="hoverrow">
                <Act name={copied === m.id ? 'check' : 'copy'} title={copied === m.id ? 'Copied to clipboard' : 'Copy to clipboard'} onClick={() => copy(m)} />
                <Act name="pencil" title="Edit" onClick={() => onEdit(m)} />
              </div>
            </>
          ) : (
            <>
              <div className="mmodel"><ModelName name={m.model || model} /></div>
              <div className={`mtext${m.streaming ? ' streaming' : ''}${m.streaming && reserve ? ' reserved' : ''}`}>
                {m.streaming && reserve && <span className="msizer" aria-hidden="true"><Rich text={m.text} /></span>}
                <span className="mlive">{m.count === 0 && m.streaming ? <span className="thinking" aria-label="Thinking" /> : <Rich text={m.text} count={m.streaming ? m.count : null} />}</span>
              </div>
              {!m.streaming && (
                <div className="hoverrow">
                  <Act name={copied === m.id ? 'check' : 'copy'} title={copied === m.id ? 'Copied to clipboard' : 'Copy to clipboard'} onClick={() => copy(m)} />
                  <Act name="thumbs-up" title="Good response" className={fb[m.id] === 'up' ? 'on' : ''} onClick={() => setFb((f) => ({ ...f, [m.id]: f[m.id] === 'up' ? null : 'up' }))} />
                  <Act name="thumbs-down" title="Bad response" className={fb[m.id] === 'down' ? 'on' : ''} onClick={() => setFb((f) => ({ ...f, [m.id]: f[m.id] === 'down' ? null : 'down' }))} />
                  <Act name="bookmark" title="Save to Bookmarks" onClick={() => signIn('', 'Sign in to save to Bookmarks')} />
                  <Act name="volume-2" title="Read aloud" onClick={() => signIn('', 'Sign in to use narration')} />
                  <Act name="refresh-cw" title="Regenerate" onClick={() => onRegenerate(m)} />
                </div>
              )}
            </>
          )}
        </div>
      ))}
      <div ref={end} className="tend" />
    </div>
  );
});
