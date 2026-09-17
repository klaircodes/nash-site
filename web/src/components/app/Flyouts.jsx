import { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { I, ServerIcon } from '../../icons.jsx';
import { popSide, popMenu, popUp } from '../../motion.js';

const isPhone = () => window.matchMedia('(max-width: 768px)').matches;

/* One flyout for the org switcher, More, the account menu and the Connectors panel —
   drawn beside the sidebar (12px clear), or above the composer for the connectors. */
export default function Flyout({ fly, onClose, root, servers, setServers, signIn }) {
  const panel = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, dir: 'side' });
  const dirFor = (k) => (k === 'mcp' ? 'up' : isPhone() ? (k === 'acct' ? 'up' : 'down') : 'side');
  const [q, setQ] = useState('');
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  useLayoutEffect(() => {
    if (!fly || !panel.current) return;
    setQ(''); setAdding(false); setDraft('');
    /* everything in the app's own coordinates: the tour's camera may have the whole app scaled */
    const cr = root.current.getBoundingClientRect(), z = cr.width / (root.current.offsetWidth || cr.width) || 1;
    const L = (b) => ({ left: (b.left - cr.left) / z, top: (b.top - cr.top) / z, right: (b.right - cr.left) / z, bottom: (b.bottom - cr.top) / z });
    const r = L(fly.anchor.getBoundingClientRect()), W = panel.current.offsetWidth, H = panel.current.offsetHeight;
    const vw = root.current.offsetWidth, vh = root.current.offsetHeight;
    const navEl = root.current?.querySelector('.navwrap'); const nav = navEl ? L(navEl.getBoundingClientRect()) : null;
    let left, top, dir = 'side';
    if (fly.kind === 'mcp') {
      const cardEl = root.current?.querySelector('.ccard'); const card = cardEl ? L(cardEl.getBoundingClientRect()) : null;
      dir = 'up'; left = Math.min(Math.max(r.left, 16), vw - W - 16); top = Math.max(8, (card ? card.top : r.top) - 30 - H);
    } else if (fly.kind === 'acct') {
      left = (nav?.right ?? r.right) + 12; top = r.bottom + 4 - H;
      if (left + W > vw - 8 || isPhone()) { dir = 'up'; left = Math.min(r.left, vw - W - 16); top = r.top - 8 - H; }
    } else {
      left = (nav?.right ?? r.right) + 12; top = r.top - 4;
      if (left + W > vw - 8 || isPhone()) { dir = 'down'; left = Math.min(r.left, vw - W - 16); top = r.bottom + 8; }
    }
    top = Math.max(8, Math.min(top, vh - H - 8));
    setPos({ left, top, dir });
  }, [fly, root, servers.length]);

  const kind = fly?.kind;
  const dir = fly ? (pos.dir !== 'side' ? pos.dir : dirFor(fly.kind)) : 'side';
  const anim = dir === 'up' ? popUp : dir === 'down' ? popMenu : popSide;
  const list = servers.filter((s) => !q || s.name.toLowerCase().includes(q.toLowerCase()));
  const add = (e) => {
    e.preventDefault(); const v = draft.trim(); if (!v) return;
    const name = v.replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
    setServers((l) => [...l, { name, mark: null, tools: 0, on: true }]); setDraft(''); setAdding(false);
  };

  return (
    <>
      {fly && <div className="flyveil" onClick={onClose} />}
      <AnimatePresence>
        {fly && (
          <motion.div key={kind} ref={panel} className={`fly on ${kind === 'org' ? 'org' : kind === 'more' ? 'more' : kind === 'acct' ? 'acct' : 'mcpp'}`}
            style={{ left: pos.left, top: pos.top }} {...anim}>
            {kind === 'org' && (
              <>
                <button className="orgrow" type="button" onClick={onClose}><I name="user" /><div className="ot"><span className="oname">Personal</span></div><span className="tick"><I name="check" /></span></button>
                <button className="orgrow" type="button" onClick={() => { onClose(); signIn('', 'Sign in to Backboard'); }}><I name="building-2" /><div className="ot"><span className="oname">Backboard</span><span className="ocap">Sign in to this organization</span></div></button>
                <div className="osep" role="separator" /><div className="olabel">Nash</div>
                <button className="orgrow" type="button" onClick={() => { onClose(); signIn('', 'Sign in to Design team'); }}><I name="building-2" /><div className="ot"><span className="oname">Design team</span><span className="ocap cap">member</span></div></button>
              </>
            )}
            {kind === 'more' && [['library', 'Library'], ['database', 'Memories'], ['server', 'MCP Settings']].map(([ic, label]) => (
              <button key={label} className="morerow" type="button" onClick={() => { onClose(); signIn('', `Sign in to open ${label}`); }}>
                {ic === 'server' ? <ServerIcon size={16} /> : <I name={ic} />}{label}
              </button>
            ))}
            {kind === 'acct' && (
              <>
                <div className="anote" role="note"><span className="amail">Not signed in</span><span className="ameta"><span>No active plan</span><span aria-hidden="true">·</span><span>Nash v1.0.0</span></span></div>
                <div className="osep" role="separator" />
                <button className="selitem" type="button" onClick={() => { onClose(); signIn('', 'Sign in to Nash'); }}><I name="link-2" />Help &amp; FAQ</button>
                <button className="selitem" type="button" onClick={() => { onClose(); signIn('', 'Sign in to open Settings'); }}><I name="settings" />Settings</button>
                <div className="osep" role="separator" />
                <button className="selitem" type="button" onClick={() => { onClose(); signIn('', 'Sign in to Nash'); }}><I name="user" />Sign in</button>
              </>
            )}
            {kind === 'mcp' && (
              <>
                <div className="mcphead"><b>Connectors in this chat</b><button className="mcpmanage" type="button" onClick={() => { onClose(); signIn('', 'Sign in to manage connectors'); }}><I name="settings" size={15} />Manage</button></div>
                <div className="mcpsearch"><I name="search" size={16} /><input type="text" placeholder="Search connectors" aria-label="Search connectors" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                <div className="mcplist">
                  {list.length === 0 && <div className="mcprow" style={{ height: 48, color: 'var(--text-secondary-alt)', fontSize: 12.5 }}>No MCP servers configured yet</div>}
                  {list.map((sv) => (
                    <div key={sv.name} className="mcprow" role="group" aria-label={sv.name}>
                      <span className="mcpico">{sv.mark ? <span dangerouslySetInnerHTML={{ __html: sv.mark }} /> : <ServerIcon size={18} />}</span>
                      <span className="mt"><span className="mn">{sv.name}</span><span className="mm">{sv.tools === 1 ? '1 tool' : `${sv.tools} tools`}</span></span>
                      <button className="sw" type="button" role="switch" aria-checked={sv.on} aria-label={sv.name}
                        onClick={() => setServers((l) => l.map((s) => (s.name === sv.name ? { ...s, on: !s.on } : s)))}><i /></button>
                    </div>
                  ))}
                  {adding ? (
                    <form className="mcpaddform" onSubmit={add}><ServerIcon size={18} /><input autoFocus type="text" placeholder="Server URL" aria-label="Server URL" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setAdding(false); }} /></form>
                  ) : (
                    <button className="mcpadd" type="button" onClick={() => setAdding(true)}><I name="plus" size={18} /><span className="mt"><span className="mn">Add MCP server</span><span className="mm">Any server that speaks MCP</span></span></button>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
