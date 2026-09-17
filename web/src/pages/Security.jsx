import { Link } from 'react-router-dom';
import { Reveal, Stagger, Item, Footer, TextReveal } from '../components/site/bits.jsx';

const FACTS = [
  ['Encrypted in transit and at rest', 'Everything, everywhere, by default — not a setting someone has to remember to turn on.'],
  ['Never used to train models', "Not ours, not anyone else's. What your team writes stays your team's."],
  ['Full audit logs', 'Every action attributable to a person, exportable when someone asks.'],
  ['Single sign-on', 'Your identity provider, your rules. Nobody gets a second password to lose.'],
  ['Two-factor sign-in', 'On by default for organisations, and you can require it for everyone.'],
  ['Roles and permissions', 'Decide who can use which models, connect which tools, and share what.'],
];
const NEVER = [
  ['No one else reading your chats', 'Each person’s conversations and memory are private to them. Admins see usage, never content.'],
  ['No shared company key', 'If you bring your own key, it is encrypted and only ever used for you.'],
  ['No training on your conversations', 'Not by us, and not by the providers we route to.'],
  ['No one at Nash reading your chats', 'Support cannot browse your workspace. If you want help with something, you share it.'],
  ['No lock-in as a retention strategy', 'The software is open source and your data exports. Leaving stays possible on purpose.'],
];
const X = <span className="x"><svg viewBox="0 0 12 12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7"/></svg></span>;

export default function Security() {
  return (
    <div className="page on">
      <div className="shell">
        <div className="pagehead">
          <Reveal as="p" className="lbl">Security</Reveal>
          <TextReveal delay={0.06}>Your data stays yours.</TextReveal>
          <Reveal as="p" className="sub" delay={0.12}>Everything here is on by default for organisations. None of it is an add-on, and none of it costs extra.</Reveal>
        </div>
      </div>
      <section><div className="shell">
        <Stagger className="cols3">
          {FACTS.map(([t, d]) => <Item key={t} className="fact"><div className="t">{t}</div><div className="d">{d}</div></Item>)}
        </Stagger>
      </div></section>
      <section className="band"><div className="shell">
        <TextReveal as="h2" style={{ maxWidth: '14ch' }}>Just as important: what never happens.</TextReveal>
        <Stagger className="never-list">
          {NEVER.map(([t, d]) => <Item key={t} className="n">{X}<div><div className="t">{t}</div><div className="d">{d}</div></div></Item>)}
        </Stagger>
      </div></section>
      <section><div className="shell two">
        <Reveal>
          <h2>If you would rather run it yourself, you can.<span className="l2">Same product, your servers.</span></h2>
          <p className="body">Nash is open source. Deploy it into your own cloud, in your own region, under your own controls — everything needed to do that sits in the same public repository as the code.</p>
          <div className="hbtns"><a className="btn" href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener">Read the source</a></div>
        </Reveal>
        <Reveal className="repo-win" style={{ margin: 0 }} delay={0.1}>
          <div className="bar"><a className="nm" href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener" style={{ color: 'inherit', textDecoration: 'none' }}>Backboard-io / <b>Nash</b></a><span className="pub">Public</span></div>
          <div className="files">
            <div className="f"><span className="nn">terraform</span><span className="dd">Everything needed to run it yourself</span></div>
            <div className="f"><span className="nn">docs</span><span className="dd">How it fits together</span></div>
            <div className="f"><span className="nn">LICENSE</span><span className="dd">MIT</span></div>
          </div>
          <div className="lic-row"><b>MIT License</b> — free to use, change and run.</div>
        </Reveal>
      </div></section>
      <div className="shell">
        <Reveal className="close">
          <TextReveal as="h2" by="chars" style={{ margin: '0 auto 18px' }}>Send us your security questionnaire.</TextReveal>
          <p className="body">We will fill it in properly. If something on it we cannot do, we will say so rather than word around it.</p>
          <div className="hbtns"><Link className="btn solid" to="/pricing">Talk to sales</Link><a className="btn" href="https://github.com/Backboard-io/Nash" target="_blank" rel="noopener">Read the source</a></div>
        </Reveal>
      </div>
      <Footer />
    </div>
  );
}
