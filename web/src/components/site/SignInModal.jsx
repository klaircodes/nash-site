import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { popDialog, fade } from '../../motion.js';

export default function SignInModal({ prompt, onClose }) {
  const first = useRef(null);
  useEffect(() => {
    if (!prompt) return;
    const t = setTimeout(() => first.current?.focus(), 240);
    const key = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => { clearTimeout(t); window.removeEventListener('keydown', key); };
  }, [prompt, onClose]);

  const text = prompt?.text || '';
  const title = prompt?.title || (text ? 'Sign in to send' : 'Sign in to continue');

  return (
    <AnimatePresence>
      {prompt && (
        <motion.div className="scrim on" {...fade} style={{ opacity: 1, visibility: 'visible' }}
          role="dialog" aria-modal="true" aria-labelledby="mtitle"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <motion.div className="modal" {...popDialog} style={{ transform: 'none' }}>
            <button className="x" type="button" aria-label="Close" onClick={onClose}>
              <svg viewBox="0 0 12 12"><path d="M6 4.94 10.06.88l1.06 1.06L7.06 6l4.06 4.06-1.06 1.06L6 7.06l-4.06 4.06L.88 10.06 4.94 6 .88 1.94 1.94.88z"/></svg>
            </button>
            <h3 id="mtitle">{title}</h3>
            <p className="lead">Takes about a minute, and every plan includes every model.</p>
            {text && <blockquote className="quote">{text}</blockquote>}
            <div className="gbtns">
              <button ref={first} className="gb solid" type="button">Continue with Google</button>
              <button className="gb" type="button">Continue with email</button>
            </div>
            {text && (
              <span className="saved"><i><svg viewBox="0 0 12 12"><path d="M4.6 9 1.5 5.9l1-1L4.6 7l5-5 1 1z"/></svg></i>We've kept what you typed — it'll be waiting for you.</span>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
