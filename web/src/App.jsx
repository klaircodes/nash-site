import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import SiteNav from './components/site/SiteNav.jsx';
import SignInModal from './components/site/SignInModal.jsx';
import Home from './pages/Home.jsx';
import Security from './pages/Security.jsx';
import Pricing from './pages/Pricing.jsx';
import About from './pages/About.jsx';
import { page } from './motion.js';

/* One door for every "you need an account for that" moment. */
const SignInCtx = createContext(() => {});
export const useSignIn = () => useContext(SignInCtx);

export default function App() {
  const location = useLocation();
  /* Every load starts on Tour — the boss's brief: land on the actual chat. */
  const [mode, setMode] = useState(() => {
    const m = new URLSearchParams(window.location.search).get('mode');
    return ['tour', 'try', 'site'].includes(m) ? m : 'tour';
  });
  const [prompt, setPrompt] = useState(null); // { text, title }
  const signIn = useCallback((text = '', title) => setPrompt({ text, title }), []);
  const onHome = location.pathname === '/';
  const inApp = onHome && mode !== 'site';
  /* the tour hands over to Try with a curtain; the bar's switch goes through it when there is one */
  const curtain = useRef(null);
  const requestMode = useCallback((k) => { if (k === 'try' && mode === 'tour' && curtain.current) curtain.current(); else setMode(k); }, [mode]);

  useEffect(() => {
    document.body.style.overflow = inApp || prompt ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [inApp, prompt]);

  useEffect(() => { if (!inApp) window.scrollTo({ top: 0, behavior: 'auto' }); }, [location.pathname, inApp]);

  return (
    <SignInCtx.Provider value={signIn}>
      {!inApp && <SiteNav mode={mode} setMode={requestMode} showSwitch={onHome} />}
      {/* no initial={false} here: it would also freeze every reveal on the first page */}
      <AnimatePresence mode="wait">
        <motion.div key={location.pathname} {...page}>
          <Routes location={location}>
            <Route path="/" element={<Home mode={mode} setMode={setMode} curtain={curtain} />} />
            <Route path="/security" element={<Security />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home mode={mode} setMode={setMode} curtain={curtain} />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <SignInModal prompt={prompt} onClose={() => setPrompt(null)} />
    </SignInCtx.Provider>
  );
}
