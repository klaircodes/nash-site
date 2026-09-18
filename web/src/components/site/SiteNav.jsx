import { useEffect, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useSignIn } from '../../App.jsx';
import { ease } from '../../motion.js';

const GH = (
  <svg viewBox="0 0 16 16"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"/></svg>
);

/* Tour · Try · Learn more — one pill that slides between the three */
export function ModeSwitch({ mode, setMode, id = 'ms' }) {
  const items = [['tour', 'Tour'], ['try', 'Try'], ['site', 'Learn more']];
  /* the pill slides to the choice first; the view follows a beat later */
  const [sel, setSel] = useState(mode);
  const timer = useRef(null);
  useEffect(() => { setSel(mode); }, [mode]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const choose = (k) => { if (k === sel) return; setSel(k); clearTimeout(timer.current); timer.current = setTimeout(() => setMode(k), 420); };
  return (
    <div className="modeswitch" role="group" aria-label="View">
      {items.map(([k, label]) => (
        <button key={k} type="button" className={`msbtn${sel === k ? ' on' : ''}`} aria-pressed={sel === k} onClick={() => choose(k)}>
          {sel === k && <motion.span layoutId={`${id}-pill`} className="mspill" transition={{ duration: 0.42, ease: [0.45, 0, 0.2, 1] }} />}
          <span style={{ position: 'relative' }}>{label}</span>
        </button>
      ))}
    </div>
  );
}

export default function SiteNav({ mode, setMode, showSwitch }) {
  const signIn = useSignIn();
  const [stuck, setStuck] = useState(false);
  /* on phones the pages live behind a menu, so the bar stays three things: mark, switch, menu */
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname, mode]);
  useEffect(() => { if (!open) return; const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; }, [open]);
  const menuRef = useRef(null);
  useEffect(() => { if (open) menuRef.current?.focus(); }, [open]);
  useEffect(() => {
    const on = () => setStuck(window.scrollY > 8);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  const act = ({ isActive }) => (isActive ? 'act' : '');
  return (
    <div className={`navbar${stuck ? ' stuck' : ''}${open ? ' open' : ''}`}>
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
            <button ref={menuRef} className={`menubtn${open ? ' on' : ''}`} type="button" aria-label={open ? 'Close menu' : 'Menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              <i /><i /><i />
            </button>
          </span>
        </nav>
      </div>
      <MobileMenu open={open} onClose={() => setOpen(false)} signIn={signIn} />
    </div>
  );
}

/* The phone menu: a sheet wipes down from under the bar, the four pages rise out of their own lines,
   rules draw in under them, and an amber square marks where you are. Tap another page and the square
   travels there first; then the page changes. */
const PAGES = [['/', 'Product'], ['/security', 'Security'], ['/pricing', 'Pricing'], ['/about', 'About']];
function MobileMenu({ open, onClose, signIn }) {
  const nav = useNavigate();
  const location = useLocation();
  const still = useReducedMotion();
  const [pending, setPending] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setPending(null); if (!open) { setReady(false); return; } const t = setTimeout(() => setReady(true), still ? 0 : 480); return () => clearTimeout(t); }, [open, still]);
  useEffect(() => { if (!open) return; const k = (e) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, [open, onClose]);
  const cur = pending || location.pathname;
  const go = (to) => { if (to === location.pathname) return onClose(); setPending(to); setTimeout(() => nav(to), still ? 0 : 260); };
  const wipe = still
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : { initial: { clipPath: 'inset(0px 0px 100% 0px)' }, animate: { clipPath: 'inset(0px 0px 0% 0px)' }, exit: { clipPath: 'inset(0px 0px 100% 0px)', transition: { duration: 0.32, delay: 0.12, ease } }, transition: { duration: 0.42, ease } };
  return (
    <AnimatePresence>
      {open && (
        <motion.div className={`msheet${ready ? ' ready' : ''}`} role="dialog" aria-modal="true" aria-label="Menu" {...wipe}>
          <nav className="mlinks">
            {PAGES.map(([to, label], k) => (
              <button key={to} type="button" className={`mrow${cur === to ? ' cur' : ''}`} onClick={() => go(to)}>
                <span className="mmask">
                  <motion.span className="mtext" initial={still ? false : { y: '110%' }} animate={{ y: 0, transition: { duration: 0.48, delay: 0.12 + k * 0.055, ease } }}
                    exit={still ? { opacity: 0 } : { y: '-110%', transition: { duration: 0.26, delay: (PAGES.length - 1 - k) * 0.03, ease } }}>{label}</motion.span>
                </span>
                {cur === to && <motion.i className="mmark" layoutId="mmark" transition={{ duration: 0.22, ease }} aria-hidden="true" />}
                <motion.b className="mrule" initial={still ? false : { scaleX: 0 }} animate={{ scaleX: 1, transition: { duration: 0.4, delay: 0.16 + k * 0.055, ease } }} exit={{ opacity: 0, transition: { duration: 0.16 } }} aria-hidden="true" />
              </button>
            ))}
          </nav>
          <motion.div className="mfoot" initial={still ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.36, delay: 0.4, ease } }} exit={{ opacity: 0, transition: { duration: 0.16 } }}>
            <button className="signin" type="button" onClick={() => { onClose(); signIn('', 'Sign in to Nash'); }}>Sign in</button>
            <div className="mmeta"><a href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener">GitHub ↗</a><span>A Backboard.io product</span></div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
