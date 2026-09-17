import { Link } from 'react-router-dom';
import { Reveal, Stagger, Item, Footer, TextReveal } from '../components/site/bits.jsx';

export default function About() {
  return (
    <div className="page on">
      <div className="shell">
        <div className="pagehead">
          <Reveal as="p" className="lbl">About</Reveal>
          <TextReveal delay={0.06}>We think AI should belong to the people using it.</TextReveal>
          <Reveal as="p" className="sub" delay={0.12}>Nash is made by Backboard.</Reveal>
        </div>
        <Stagger className="lede-two">
          <Item as="p" className="body">Most teams got to AI the same way: one person expensed a subscription, then another, then four. Now the work is spread across tools that do not know about each other, on accounts nobody can see, with nobody quite sure what is being pasted where.</Item>
          <Item as="p" className="body">Nash is the opposite arrangement. One place, every model, a memory that is yours alone, and controls that belong to the organisation rather than to whoever set it up first — and all of it open source, so the arrangement holds even if we do not.</Item>
        </Stagger>
      </div>
      <section className="band"><div className="shell">
        <Stagger className="cols3">
          <Item className="fact"><div className="t">Open by default</div><div className="d">Every line is public under an MIT licence. You can read it, change it, and run it yourself.</div></Item>
          <Item className="fact"><div className="t">Built on Backboard</div><div className="d">The memory that carries your context between sessions is Backboard's, ranked first on the leading memory benchmarks.</div></Item>
          <Item className="fact"><div className="t">No lock-in by design</div><div className="d">Bring your own keys, export what you have written, or take the whole thing and host it. Leaving stays possible on purpose.</div></Item>
        </Stagger>
      </div></section>
      <div className="shell">
        <Reveal className="close">
          <TextReveal as="h2" by="chars" style={{ margin: '0 auto 18px' }}>Come and talk to us.</TextReveal>
          <p className="body">Whether that is a demo, a security review, or a question about the code.</p>
          <div className="hbtns"><Link className="btn solid" to="/pricing">Talk to sales</Link><a className="btn" href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener">Read the source</a></div>
        </Reveal>
      </div>
      <Footer />
    </div>
  );
}
