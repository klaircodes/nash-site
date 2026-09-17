import { useEffect, useRef, useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useSignIn } from '../../App.jsx';
import { ease, dur } from '../../motion.js';

const GH = (
  <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
);

/* Tour · Try · Learn more — one pill that slides between the three */
export function ModeSwitch({ mode, setMode, id = 'ms', dark = false }) {
  const items = [['tour', 'Tour'], ['try', 'Try'], ['site', 'Learn more']];
  /* the pill slides to the choice first; the view follows a beat later */
  const [sel, setSel] = useState(mode);
  const timer = useRef(null);
  useEffect(() => { setSel(mode); }, [mode]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const choose = (k) => { if (k === sel) return; setSel(k); clearTimeout(timer.current); timer.current = setTimeout(() => setMode(k), 420); };
  return (
    <div className={`modeswitch${dark ? ' dark' : ''}`} role="group" aria-label="View">
      {items.map(([k, label]) => (
        <button key={k} type="button" className={`msbtn${sel === k ? ' on' : ''}`} aria-pressed={sel === k} onClick={() => choose(k)}>
          {sel === k && <motion.span layoutId={`${id}-pill`} className="mspill" transition={{ duration: 0.42, ease: [0.45, 0, 0.2, 1] }} />}
          <span style={{ position: 'relative' }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function SiteNav({ mode, setMode, showSwitch, dark = false, minimal = false }) {
  const signIn = useSignIn();
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const act = ({ isActive }) => (isActive ? 'act' : '');
  if (minimal) {
    return (
      <div className={`navbar minimal${dark ? ' dark' : ''}`}>
        <div className="shell"><nav className="nav"><ModeSwitch mode={mode} setMode={setMode} id="nav" /></nav></div>
      </div>
    );
  }
  return (
    <div className={`navbar${stuck ? ' stuck' : ''}${dark ? ' dark' : ''}`}>
      <div className="shell">
        <nav className="nav">
          <Link className="brand" to="/">nash:</Link>
          <span className="links">
            <NavLink to="/" end className={act}>Product</NavLink>
            <NavLink to="/security" className={act}>Security</NavLink>
            <NavLink to="/pricing" className={act}>Pricing</NavLink>
            <NavLink to="/about" className={act}>About</NavLink>
          </span>
          {showSwitch && <ModeSwitch mode={mode} setMode={setMode} id="nav" />}
          <span className="right">
            <a className="gh" href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener" aria-label="GitHub">{GH}</a>
            <button className="signin" type="button" onClick={() => signIn('', 'Sign in to Nash')}>Sign in</button>
          </span>
        </nav>
      </div>
    </div>
  );
}
