import { AnimatePresence, motion } from 'motion/react';
import Player from '../components/app/Player.jsx';
import LearnMore from './LearnMore.jsx';
import { ease } from '../motion.js';

/* Three ways in. Tour is the product as a film, Try is the product itself (the same instance,
   let out of its frame), Learn more is the website. The site and the app cross-fade; Tour and Try
   move between each other inside Player. */
export default function Home({ mode, setMode, curtain }) {
  const site = mode === 'site';
  return (
    <AnimatePresence mode="wait">
      <motion.div key={site ? 'site' : 'app'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.28, ease }}>
        {site ? <LearnMore /> : <Player mode={mode} setMode={setMode} curtain={curtain} />}
      </motion.div>
    </AnimatePresence>
  );
}
