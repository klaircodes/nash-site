import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'motion/react';
import { useSignIn } from '../App.jsx';
import { Reveal, Words, ProviderMarks, ToolMarks } from '../components/site/bits.jsx';
import { slideIn } from '../motion.js';
import HeroSequence from '../components/site/HeroSequence.jsx';
import PricingBlock from '../components/site/PricingBlock.jsx';
import Ticker from '../components/site/Ticker.jsx';

/* Learn more: copy left, the way in on the right; pricing; the asks as a ticker; the footer.
   Scroll drives the wash and the sign-in panel in the hero, and the wordmark at the end. */
export default function LearnMore() {
  const signIn = useSignIn();
  const still = useReducedMotion();
  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 120, damping: 28, mass: 0.6 });
  const washY = useTransform(smooth, [0, 700], [0, still ? 0 : 140]);
  const washO = useTransform(smooth, [0, 500], [1, 0.35]);
  const panelY = useTransform(smooth, [0, 500], [0, still ? 0 : -48]);
  const heroY = useTransform(smooth, [0, 500], [0, still ? 0 : 24]);

  const foot = useRef(null);
  const { scrollYProgress: footP } = useScroll({ target: foot, offset: ['start end', 'end end'] });
  const wordY = useTransform(footP, [0, 1], [still ? 0 : 120, 0]);
  const wordO = useTransform(footP, [0, 0.6, 1], [0, 0.6, 1]);

  return (
    <div className="var on" data-var="d">
      <section className="dh">
        <motion.div className="washbg" style={{ y: washY, opacity: washO }} aria-hidden="true" />
        <div className="shell dh2">
          <motion.div className="dhl" style={{ y: heroY }}>
            <Reveal as="p" className="dmodels"><ProviderMarks /><span>and every other leading model, in one place</span></Reveal>
            <Words delay={0.1}>One place for your whole team to use AI.</Words>
            <Reveal as="p" className="sub" delay={0.12}>Ask in plain words. Nash reads the email, files and calendar you let it, answers with whichever model is best, and remembers what you told it next time.</Reveal>
            <Reveal delay={0.18}><HeroSequence /></Reveal>
            <Reveal as="p" className="dworks" delay={0.24}><span className="lb">Works with</span><ToolMarks /><span>and anything on MCP</span></Reveal>
          </motion.div>
          <motion.div style={{ y: panelY }}>
            <Reveal as="aside" className="dsign" delay={0.25} variants={slideIn}>
              <p className="t">Get started</p>
              <p className="d">Every plan includes every model. Start on your own for $25 a month and bring the team when you are ready.</p>
              <button className="gb solid" type="button" onClick={() => signIn('', 'Continue with Google')}>Continue with Google</button>
              <button className="gb" type="button" onClick={() => signIn('', 'Continue with email')}>Continue with email</button>
              <p className="fine">Already have an account? <button className="lnk" type="button" onClick={() => signIn('', 'Sign in to Nash')}>Sign in</button></p>
            </Reveal>
          </motion.div>
        </div>
      </section>

      <PricingBlock />
      <Ticker />

      <footer className="dfoot" ref={foot}><div className="shell">
        <div className="dftop">
          <div>
            <Link className="brand" to="/">nash:</Link>
            <p className="dftag">One AI workspace for the whole team. Every model, your tools, and a memory that stays yours.</p>
          </div>
          <div className="dfcol"><p className="dfh">Product</p><Link to="/security">Security</Link><Link to="/pricing">Pricing</Link><a href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener">GitHub</a></div>
          <div className="dfcol"><p className="dfh">Company</p><Link to="/about">About</Link><Link to="/pricing">Talk to sales</Link></div>
        </div>
        <div className="dfbot"><span>© 2026 Backboard.io</span><span><Link to="/about">Privacy</Link><Link to="/about">Terms</Link><a href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener">MIT licence</a></span></div>
        <motion.p className="dword" style={{ y: wordY, opacity: wordO }} aria-hidden="true">Nash</motion.p>
      </div></footer>
    </div>
  );
}
