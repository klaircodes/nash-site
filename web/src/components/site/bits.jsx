import { Fragment } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ease, rise, stagger } from '../../motion.js';
import { photo } from '../../data.js';
import { Mark } from './Marks.jsx';

export { ProviderMarks, ToolMarks, Mark } from './Marks.jsx';

/* rises in once, the first time it is reached */
export function Reveal({ as = 'div', className, children, delay = 0, style, variants = rise }) {
  const Tag = motion[as] || motion.div;
  const still = useReducedMotion();
  return (
    <Tag className={className} style={style} variants={still ? undefined : variants} initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }} transition={{ delay }}>
      {children}
    </Tag>
  );
}
/* Text reveal: a line of type arrives piece by piece, each piece rising out of its own mask.
   by="words" for headlines, by="chars" for short lines that should feel typed-and-lifted. */
const piece = (d) => ({ hidden: { y: '112%', opacity: 0 }, show: { y: '0%', opacity: 1, transition: { duration: d, ease } } });
export function TextReveal({ as = 'h1', className, style, children, delay = 0, gap, by = 'words', duration, once = true, active = true }) {
  const Tag = motion[as] || motion.div;
  const still = useReducedMotion();
  const text = String(children);
  const chars = by === 'chars';
  const words = text.split(' ');
  const v = still ? undefined : piece(duration ?? (chars ? 0.55 : 0.8));
  const step = gap ?? (chars ? 0.022 : 0.06);
  const trigger = active === 'now' ? { initial: 'hidden', animate: 'show' } : { initial: 'hidden', whileInView: 'show', viewport: { once, margin: '0px 0px -12% 0px' } };
  return (
    <Tag className={className} style={style} aria-label={text} variants={stagger(step, delay)} {...trigger}>
      {words.map((w, k) => (
        <Fragment key={k}>
          <span aria-hidden="true" className={chars ? 'cword' : undefined}>
            {chars
              ? w.split('').map((ch, c) => <span key={c} className="cmask"><motion.span className="w" variants={v}>{ch}</motion.span></span>)
              : <span className="wmask"><motion.span className="w" variants={v}>{w}</motion.span></span>}
          </span>
          {k < words.length - 1 && ' '}
        </Fragment>
      ))}
    </Tag>
  );
}
export const Words = (props) => <TextReveal by="words" {...props} />;

/* siblings arriving together stagger rather than snapping in as a block */
export function Stagger({ className, children, gap = 0.07, style }) {
  return (
    <motion.div className={className} style={style} variants={stagger(gap)} initial="hidden" whileInView="show"
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}>
      {children}
    </motion.div>
  );
}
export const Item = ({ as = 'div', className, children, style }) => {
  const Tag = motion[as] || motion.div;
  return <Tag className={className} style={style} variants={rise}>{children}</Tag>;
};

/* the provider strip under a hero: every model, on a loop */

export const Photo = ({ n, className }) => (
  <span className={className}><img src={photo(n)} alt="" /></span>
);

export function Footer() {
  return (
    <div className="shell">
      <footer>
        <span>Nash</span>
        <Link to="/">Product</Link><Link to="/security">Security</Link><Link to="/pricing">Pricing</Link><Link to="/about">About</Link>
        <a href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener">GitHub</a>
        <span className="sp">A Backboard.io product</span>
      </footer>
    </div>
  );
}
