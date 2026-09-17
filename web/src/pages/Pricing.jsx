import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSignIn } from '../App.jsx';
import PricingBlock from '../components/site/PricingBlock.jsx';
import { Reveal, Stagger, Item, Footer, TextReveal } from '../components/site/bits.jsx';
import { ease } from '../motion.js';

const ROWS = [
  ['Every AI model', '✓', '✓', '✓', '✓'],
  ['Memory that follows you', '✓', '✓', '✓', '✓'],
  ['Monthly usage', 'Generous', 'More, pooled', 'Highest, pooled', 'Custom'],
  ['Document upload', '1 GB / mo', '5 GB / mo', '20 GB / mo', 'Custom'],
  ['Admin controls and spend caps', '—', '✓', '✓', '✓'],
  ['Usage analytics', '—', '✓', '✓', '✓'],
  ['Single sign-on', '—', '—', '✓', '✓'],
  ['Role-based access', '—', '—', '✓', '✓'],
  ['Audit logs', '—', '—', '✓', '✓'],
  ['Model allow-listing', '—', '—', '✓', '✓'],
  ['Private deployment', '—', '—', '—', '✓'],
  ['Anyone else able to read your chats', '—', '—', '—', '—'],
];
const FAQ = [
  ['What counts as usage?', 'Every message uses some of your monthly allowance, and bigger models use more of it. On Team and above the allowance is pooled, so a heavy week for one person comes out of the team’s total, not their own.'],
  ['What happens if we run out?', 'Nothing breaks and nobody is cut off mid-sentence. Admins see it coming in usage analytics, and you can lift a person’s cap without changing anyone else’s.'],
  ['Can we use our own OpenAI account?', 'Yes, on any plan. Your key is encrypted and only ever used for you, so the usage lands on your existing contract and your bill.'],
  ['Can we change plan later?', 'Yes, in both directions. Nothing you have written is locked behind a tier — memory, chats and files stay yours if you move down.'],
  ['Do you charge for people who barely use it?', 'Team and Business are per user, so a large team of light users is worth a conversation — that is usually what Enterprise pricing exists to solve.'],
  ['Is there really no catch to self-hosting?', 'No. It is MIT licensed and the deployment sits in the public repository. Most teams still choose hosted because running it is work, which is exactly the point.'],
];

export default function Pricing() {
  const signIn = useSignIn();
  const [hot, setHot] = useState(-1);
  const [openQ, setOpenQ] = useState(-1);
  return (
    <div className="page on">
      <div className="shell">
        <div className="pagehead">
          <Reveal as="p" className="lbl">Pricing</Reveal>
          <TextReveal delay={0.06}>Simple pricing that grows with you.</TextReveal>
          <Reveal as="p" className="sub" delay={0.12}>Start on your own. Bring your team when you're ready. Every plan includes every model.</Reveal>
        </div>
      </div>
      <PricingBlock full />
      <section><div className="shell">
        <TextReveal as="h2" style={{ maxWidth: '18ch' }}>Everything, side by side.</TextReveal>
        <Reveal className="scrollx">
          <table className="ptable" onMouseLeave={() => setHot(-1)}>
            <thead><tr><th />{['Starter', 'Team', 'Business', 'Enterprise'].map((h, k) => <th key={h} className={hot === k + 1 ? 'hot' : ''} onMouseOver={() => setHot(k + 1)}>{h}</th>)}</tr></thead>
            <tbody>
              {ROWS.map(([label, ...cells]) => (
                <tr key={label}><td>{label}</td>{cells.map((c, k) => <td key={k} className={`c${hot === k + 1 ? ' hot' : ''}`} onMouseOver={() => setHot(k + 1)}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div></section>
      <section className="band"><div className="shell">
        <TextReveal as="h2" style={{ maxWidth: '16ch' }}>Questions people actually ask.</TextReveal>
        <Stagger className="faq">
          {FAQ.map(([q, a], k) => (
            <Item key={q} className="item">
              <button className="qbtn" type="button" aria-expanded={openQ === k} onClick={() => setOpenQ(openQ === k ? -1 : k)}>{q}<span className="pm" /></button>
              <AnimatePresence initial={false}>
                {openQ === k && (
                  <motion.div className="ans" style={{ display: 'block', gridTemplateRows: 'none' }} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.38, ease }}>
                    <div><p>{a}</p></div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Item>
          ))}
        </Stagger>
      </div></section>
      <div className="shell">
        <Reveal className="close">
          <TextReveal as="h2" by="chars" style={{ margin: '0 auto 18px' }}>Not sure which one?</TextReveal>
          <p className="body">Tell us how many people and what they do all day. We will tell you the cheapest plan that works, including if that is not the one we would rather sell you.</p>
          <div className="hbtns"><button className="btn solid" type="button" onClick={() => signIn('', 'Talk to sales')}>Talk to sales</button><button className="btn" type="button" onClick={() => signIn('', 'Sign in to get started')}>Get started</button></div>
        </Reveal>
      </div>
      <Footer />
    </div>
  );
}
