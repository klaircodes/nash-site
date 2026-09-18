import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useSignIn } from '../../App.jsx';
import { ModeSwitch } from '../site/SiteNav.jsx';
import { I, TempIcon, WaveIcon, ServerIcon, PlusMinus } from '../../icons.jsx';
import { FOLDERS, CHATS, GROUPS, CONNECTORS, SEEDS } from '../../data.js';
import ModelPicker from './ModelPicker.jsx';
import Flyout from './Flyouts.jsx';
import Thread, { answerFor, ModelName } from './Thread.jsx';
import { ease, dur } from '../../motion.js';

const greeting = () => {
  const d = new Date(), h = d.getHours(), we = d.getDay() === 0 || d.getDay() === 6;
  return h < 5 ? 'Happy late night' : h < 12 ? (we ? 'Happy weekend' : 'Good morning') : h < 17 ? 'Good afternoon' : 'Good evening';
};
const ASKS = ['Ask anything…', 'What did Claire say about the launch date?', 'Summarise the Q3 plan in the shared drive.', 'What am I walking into on Monday?', 'Catch me up on #launch since Thursday.'];
const isPhone = () => window.matchMedia('(max-width: 768px)').matches;

/* the seeded conversations behind every chat in the sidebar */
const seedThreads = () => Object.fromEntries(Object.entries(SEEDS).map(([title, s]) => [title, { id: title, messages: [{ id: 1, user: true, text: s.q }, { id: 2, user: false, text: s.a, model: s.model, streaming: false, count: s.a.split(' ').length }] }]));

/* ── Conversations/Convo.tsx ── */
function Convo({ title, pinned, onPin, inFolder, hidden, signIn, onOpen, on }) {
  if (hidden) return null;
  return (
    <div className={`convo${on ? ' active' : ''}`} role="button" tabIndex={0} aria-current={on ? 'page' : undefined} onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(); } }}>
      <div className="clink"><div className="ctitle">{title}</div></div>
      {!inFolder && (
        <button className={`cpin${pinned ? ' on' : ''}`} type="button" aria-label={pinned ? 'Unpin' : 'Pin'} aria-pressed={pinned}
          onClick={(e) => { e.stopPropagation(); if (e.detail > 0) e.currentTarget.blur(); onPin(); }}>
          <I name="pin" size={12} />
        </button>
      )}
      <div className="copts">
        <button className="cdots" type="button" aria-label="Chat options" onClick={(e) => { e.stopPropagation(); signIn('', 'Sign in to manage your chats'); }}><I name="ellipsis" size={14} /></button>
      </div>
    </div>
  );
}

/* ── Nav.tsx: NewChat, OrgSwitcher, SearchBar, NavControlLinks, FoldersList, Conversations, AccountSettings ── */
const Sidebar = memo(function Sidebar({ collapsed, setCollapsed, drawer, setDrawer, openFly, flyKind, onNewChat, signIn, chats, setChats, active, onOpen }) {
  const [q, setQ] = useState('');
  const [chatsOpen, setChatsOpen] = useState(true);
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [open, setOpen] = useState(() => Object.fromEntries(FOLDERS.map((f) => [f.key, f.open])));
  const hit = (t) => !q || t.toLowerCase().includes(q.toLowerCase());
  const groups = useMemo(() => {
    const pinned = chats.filter((c) => c.pinned && hit(c.title));
    const dated = GROUPS.map((g) => [g, chats.filter((c) => c.group === g && !c.pinned && hit(c.title))]).filter(([, r]) => r.length);
    return [['Pinned', pinned], ...dated].filter(([, r]) => r.length);
  }, [chats, q]);
  const shownFolders = FOLDERS.map((f) => ({ ...f, chats: f.chats.filter(hit) })).filter((f) => !q || f.chats.length);
  const nothing = q && !groups.length && !shownFolders.length;
  const pin = (title) => setChats((l) => l.map((c) => (c.title === title ? { ...c, pinned: !c.pinned } : c)));
  const orgRef = useRef(null), moreRef = useRef(null), acctRef = useRef(null);

  return (
    <div className={`navwrap${collapsed ? ' collapsed' : ''}${drawer ? ' drawer' : ''}`}>
      <div className="rail">
        <button className="railbtn" type="button" aria-label="Open sidebar" onClick={() => setCollapsed(false)}><I name="panel-left" size={18} /></button>
        <button className="railbtn" type="button" aria-label="New chat" onClick={onNewChat}><I name="square-pen" size={18} /></button>
      </div>
      <div className="nav" data-testid="nav"><nav className="navin" aria-label="Chat History">
        <div className="navtop">
          <div className="brandrow">
            <span className="wordmark">nash:</span>
            <button className="closenav" type="button" aria-label="Close sidebar" onClick={() => (isPhone() ? setDrawer(false) : setCollapsed(true))}><I name="panel-left" size={18} /></button>
          </div>
          <div className="sp12" />
          <button ref={orgRef} className="orgbtn" type="button" aria-label="Switch organization" aria-expanded={flyKind === 'org'} onClick={() => openFly('org', orgRef.current)}>
            <I name="user" size={15} /><span className="orglabel">Personal</span><I name="chevron-down" size={16} />
          </button>
          <div className="sp14" />
          <div className={`searchbar${q ? ' has' : ''}`}>
            <I name="search" size={14} />
            <input type="text" placeholder="Search messages" aria-label="Search messages" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Escape') setQ(''); }} />
            <button className="sclear" type="button" aria-label="Clear search" tabIndex={q ? 0 : -1} onClick={() => setQ('')}><I name="x" size={16} /></button>
          </div>
          <div className="sp14" />
          <a className={`navrow${active ? '' : ' active'}`} href="#/" onClick={(e) => { e.preventDefault(); onNewChat(); }}><I name="plus" size={16} /> New Chat</a>
          <div className="navscroll">
            <div className="navlinks">
              <button className="navrow" type="button" onClick={() => signIn('', 'Sign in to open Bookmarks')}><I name="bookmark" size={16} /> Bookmarks</button>
              <button className="navrow" type="button" onClick={() => signIn('', 'Sign in to open Persona Marketplace')}><I name="users" size={16} /> Persona Marketplace</button>
              <button ref={moreRef} className="navrow more" type="button" aria-label="More" aria-haspopup="menu" aria-expanded={flyKind === 'more'} onClick={() => openFly('more', moreRef.current)}><I name="ellipsis" size={16} /> More</button>
            </div>
            <div className="chatshead-wrap">
              <button className="chatshead" type="button" aria-expanded={chatsOpen} onClick={() => setChatsOpen((v) => !v)}><span>Chats</span><I name="chevron-down" size={16} /></button>
            </div>
            <div className={`chats${chatsOpen ? ' open' : ''}`}><div className="fold"><div className="chatsin">
              <div className={`folders${foldersOpen ? ' open' : ''}`}>
                <div className="fhead">
                  <button className="flabel" type="button" aria-expanded={foldersOpen} onClick={() => setFoldersOpen((v) => !v)}>Folders</button>
                  <button className="fadd" type="button" aria-label="Create Folder" onClick={() => signIn('', 'Sign in to create folders')}><I name="plus" size={16} /></button>
                  <button className="fhchev" type="button" aria-label="Folders" aria-expanded={foldersOpen} onClick={() => setFoldersOpen((v) => !v)}><I name="chevron-down" size={16} /></button>
                </div>
                <div className="fold"><div className="flist">
                  {shownFolders.map((f) => {
                    const isOpen = q ? true : open[f.key];
                    const tog = () => setOpen((o) => ({ ...o, [f.key]: !o[f.key] }));
                    return (
                      <div key={f.key} className={`folder${isOpen ? ' open' : ''}`}>
                        <div className="frow" role="button" tabIndex={0} aria-expanded={isOpen} onClick={() => { if (!isOpen) tog(); signIn('', 'Sign in to open folders'); }}>
                          <I name="folder" size={16} className="ico-closed" /><I name="folder-open" size={16} className="ico-open" />
                          <span className="fname">{f.label}</span>
                          <button className="fshare" type="button" aria-label="Share folder" onClick={(e) => { e.stopPropagation(); signIn('', 'Sign in to share folders'); }}><I name="link-2" size={16} /></button>
                          <button className="fdel" type="button" aria-label="Delete folder" onClick={(e) => { e.stopPropagation(); signIn('', 'Sign in to manage folders'); }}><I name="trash-2" size={16} /></button>
                          <button className="fchev" type="button" aria-label={f.label} aria-expanded={isOpen} onClick={(e) => { e.stopPropagation(); tog(); }}><I name="chevron-right" size={16} /></button>
                        </div>
                        <div className="fold"><div className="fchats">
                          {f.chats.map((t) => <div key={t} className="fchat"><Convo title={t} inFolder signIn={signIn} onOpen={() => onOpen(t)} on={active === t} /></div>)}
                        </div></div>
                      </div>
                    );
                  })}
                </div></div>
              </div>
              <div className="convos">
                {groups.map(([g, rows]) => (
                  <div key={g} className="dgroup">
                    <div className={`dlabel${g === 'Pinned' ? ' first' : ''}`}>{g}</div>
                    <AnimatePresence initial={false}>
                      {rows.map((c) => (
                        <motion.div key={c.title} layout transition={{ duration: dur.move, ease }}>
                          <Convo title={c.title} pinned={c.pinned} onPin={() => pin(c.title)} signIn={signIn} onOpen={() => onOpen(c.id)} on={active === c.id} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ))}
                {nothing && <div className="nothing">Nothing found</div>}
              </div>
            </div></div></div>
          </div>
        </div>
        <div className="sp6" /><div className="rulehr" /><div className="sp6" />
        <button ref={acctRef} className="account" type="button" aria-label="Account Settings" aria-expanded={flyKind === 'acct'} onClick={() => openFly('acct', acctRef.current)}>
          <div className="avatar"><span>G</span></div>
          <div className="acct"><span className="aname">Guest</span><span className="aplan">No active plan</span></div>
          <I name="settings" size={14} />
        </button>
      </nav></div>
    </div>
  );
});

/* ── ChatForm.tsx ── */
const Composer = memo(function Composer({ text, setText, model, openPicker, pickerOpen, tools, setTools, temp, setTemp, image, setImage, openFly, flyKind, signIn, connected, onSend }) {
  const ta = useRef(null);
  const mcpRef = useRef(null);
  const [multi, setMulti] = useState(false);
  const grow = useCallback(() => {
    const el = ta.current; if (!el) return;
    el.style.height = '22px'; const h = el.scrollHeight; el.style.height = `${Math.min(h, 168)}px`;
    setMulti((was) => (!el.value.trim() ? false : was || h > 30));
  }, []);
  useEffect(grow, [text, grow]);
  useEffect(() => { window.addEventListener('resize', grow); return () => window.removeEventListener('resize', grow); }, [grow]);
  const send = () => { const q = text.trim(); if (!q) return; setText(''); onSend(q); };

  return (
    <div className="formcol">
      <div className="cform">
        <div className={`ccard${multi ? ' multi' : ''}${temp ? ' temp' : ''}`} data-tools={tools ? 'open' : 'closed'}
          onClick={(e) => { if (window.matchMedia('(pointer: coarse)').matches) return; if (e.target.closest('input, textarea, button, [role=dialog], [role=menu]')) return; ta.current?.focus(); }}>
          <div className="crow">
            <button className="tog" type="button" aria-label={tools ? 'Hide tools' : 'Show tools'} aria-expanded={tools}
              onClick={(e) => { e.stopPropagation(); if (isPhone()) return signIn('', 'Sign in to add to chat'); setTools((v) => !v); }}>
              <PlusMinus open={tools} />
            </button>
            <textarea ref={ta} rows="1" placeholder={temp ? 'Temporary chat' : 'Ask anything…'} aria-label="Message input" spellCheck="false" value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
            <button className="modelpick" type="button" aria-haspopup="dialog" aria-expanded={pickerOpen} aria-label="Select a model" onClick={(e) => { e.stopPropagation(); openPicker(); }}>
              <ModelName name={model} className="mname" settle="var(--text-secondary)" /><I name="chevron-down" size={14} />
            </button>
            <button className="mic" type="button" aria-label="Dictate a message" onClick={() => signIn('', 'Sign in to dictate')}><I name="mic" size={17} /></button>
            <button className="send" type="button" aria-label="Send message" disabled={!text.trim()} onClick={(e) => { e.stopPropagation(); send(); }}><I name="arrow-up" size={17} /></button>
          </div>
          <div className="tools"><div className="trow">
            <div className="tleft">
              <button className="pill" type="button" aria-label="Attach File" onClick={() => signIn('', 'Sign in to add files')}><I name="paperclip" size={15} /><span>Add File</span></button>
              <button className="pill img" type="button" aria-label="Create Image" aria-pressed={image} onClick={() => setImage((v) => !v)}><I name="image" size={15} /><span>Create Image</span></button>
            </div>
            <div className="tright">
              <button className="rbtn temp" type="button" aria-label={temp ? 'Turn off temporary chat' : 'Start a temporary chat'} aria-pressed={temp} onClick={() => setTemp((v) => !v)}><TempIcon /></button>
              <button ref={mcpRef} className="rbtn mcp" type="button" aria-label="Connectors" aria-haspopup="menu" aria-expanded={flyKind === 'mcp'} onClick={() => openFly('mcp', mcpRef.current)}>
                <ServerIcon /><span className="mcpcount">{connected || ''}</span>
              </button>
              <button className="rbtn voice" type="button" aria-label="Voice Mode" onClick={() => signIn('', 'Sign in to use voice mode')}><WaveIcon /></button>
              <button className="rbtn settings" type="button" aria-label="Settings" onClick={() => signIn('', 'Sign in to change settings')}><I name="settings" size={17} /></button>
            </div>
          </div></div>
        </div>
      </div>
      <div className="disclaimer" role="note">Nash can make mistakes. Please double-check responses.</div>
    </div>
  );
});

export default function NashApp({ mode, setMode, rootRef, framed = false, api }) {
  const signIn = useSignIn();
  const own = useRef(null);
  const root = rootRef || own;
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [chats, setChats] = useState(() => CHATS.map((c) => ({ ...c, id: c.title })));
  const [threads, setThreads] = useState(seedThreads);
  const [active, setActive] = useState(null);
  const activeRef = useRef(null);
  activeRef.current = active;
  const messages = (active && threads[active]?.messages) || [];
  const openChat = useCallback((id) => { stopStream(); setActive(id); activeRef.current = id; setDrawer(false); setText(''); }, []);
  const [text, setText] = useState('');
  const streamTimer = useRef(null);
  const modelRef = useRef(null);
  const [tools, setTools] = useState(true);
  const [temp, setTemp] = useState(false);
  const [image, setImage] = useState(false);
  const [model, setModel] = useState({ name: 'GPT 4.1', ep: 'openai' });
  const [pins, setPins] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [fly, setFly] = useState(null); // { kind, anchor }
  const [servers, setServers] = useState(CONNECTORS.map((c) => ({ ...c, on: true })));
  const greet = useMemo(greeting, []);
  const pickerApi = useRef(null);
  modelRef.current = model;

  /* signed out, the conversation is a rehearsal: the question goes up, the answer comes back word by word */
  const stopStream = () => { clearInterval(streamTimer.current); streamTimer.current = null; };
  const setMessages = (fn) => setThreads((t) => { const id = activeRef.current; if (!id) return t; const th = t[id] || { id, messages: [] }; const ms = fn(th.messages); return ms === th.messages ? t : { ...t, [id]: { ...th, messages: ms } }; });
  const setLast = (fn) => setMessages((l) => { const k = l.length - 1; if (k < 0 || l[k].user) return l; const next = fn(l[k]); return next === l[k] ? l : [...l.slice(0, k), next]; });
  /* a message in a new chat makes the chat: it takes its title from the question and lands under Today */
  const ensureChat = (q) => {
    if (activeRef.current) return activeRef.current;
    const id = `c${Date.now()}`; activeRef.current = id; setActive(id);
    setChats((l) => [{ id, title: q.length > 30 ? `${q.slice(0, 29).trimEnd()}…` : q, group: 'Today', pinned: false }, ...l]);
    return id;
  };
  const ask = useCallback((q, opts = {}) => {
    stopStream(); ensureChat(q);
    const a = answerFor(q); const total = a.split(' ').length; const id = Date.now();
    /* an answer still arriving lands in full before the next question goes up */
    setMessages((l) => [...l.map((m) => (m.streaming ? { ...m, streaming: false, count: m.text.split(' ').length } : m)), { id, user: true, text: q }, { id: id + 1, user: false, text: a, model: opts.model || modelRef.current.name, streaming: true, count: 0 }]);
    if (!opts.manual) {
      let n = 0; const t0 = performance.now();
      streamTimer.current = setInterval(() => { const dt = performance.now() - t0; if (dt < 700) return; n = Math.min(total, Math.floor((dt - 700) / 60)); setLast((m) => ({ ...m, count: n, streaming: n < total })); if (n >= total) stopStream(); }, 40);
    }
  }, []);
  const regenerate = useCallback((m) => { const list = (activeRef.current && threads[activeRef.current]?.messages) || []; const q = [...list].reverse().find((x) => x.user && x.id < m.id); setMessages((l) => l.filter((x) => x.id !== m.id && x.id !== q?.id)); if (q) setTimeout(() => ask(q.text), 30); }, [threads, ask]);
  useEffect(() => () => stopStream(), []);
  const [settled, setSettled] = useState(false);
  useEffect(() => { const t = setTimeout(() => setSettled(true), 900); return () => clearTimeout(t); }, []);

  /* what the tour's director can do to the app: type, open things, pick a model, flip a switch, tidy up */
  useEffect(() => {
    if (!api) return;
    api.current = {
      setText, setTools, setModel,
      openPicker: () => { setFly(null); setPickerOpen(true); },
      closePicker: () => setPickerOpen(false),
      drill: (v) => pickerApi.current?.drill(v),
      openFly: (kind) => { const el = root.current?.querySelector(kind === 'mcp' ? '.rbtn.mcp' : kind === 'org' ? '.orgbtn' : kind === 'acct' ? '.account' : '.navrow.more'); if (el) setFly({ kind, anchor: el }); },
      closeFly: () => setFly(null),
      setDrawer,
      ask: (q) => ask(q, { manual: true }),
      ensure: (q) => { if (activeRef.current && threads[activeRef.current]?.messages?.length) return; ensureChat(q); setMessages((l) => { if (l.length) return l; const a = answerFor(q); return [{ id: 1, user: true, text: q }, { id: 2, user: false, text: a, model: 'GPT 4.1', streaming: false, count: a.split(' ').length }]; }); },
      setLastModel: (name) => setLast((m) => (m.model === name ? m : { ...m, model: name })),
      stream: (p) => setLast((m) => { const total = m.text.split(' ').length; const n = Math.max(0, Math.min(total, Math.round(p * total))); const st = p < 1; return m.count === n && m.streaming === st ? m : { ...m, count: n, streaming: st }; }),
      hoverLast: (on) => setMessages((l) => (l.length && !!l[l.length - 1].hover === !!on ? l : l.map((m, k) => (k === l.length - 1 ? { ...m, hover: on } : m)))),
      toggleServer: (name) => setServers((l) => l.map((s) => (s.name === name ? { ...s, on: !s.on } : s))),
      reset: () => { stopStream(); setActive(null); activeRef.current = null; setThreads(seedThreads()); setChats(CHATS.map((c) => ({ ...c, id: c.title }))); setText(''); setFly(null); setPickerOpen(false); setDrawer(false); setModel({ name: 'GPT 4.1', ep: 'openai' }); setServers((l) => l.map((s) => ({ ...s, on: true }))); },
    };
    return () => { api.current = null; };
  }, [api, threads]);

  /* placeholder cycles through real asks while the box is empty; it is written straight to the field so nothing redraws */
  const textRef = useRef(text); textRef.current = text;
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ai = 0, typing = null;
    const ta = () => root.current?.querySelector('.ccard textarea');
    const tick = setInterval(() => {
      if (textRef.current || temp || document.activeElement?.tagName === 'TEXTAREA') return;
      ai = (ai + 1) % ASKS.length; const t = ASKS[ai]; let k = 0;
      clearInterval(typing);
      typing = setInterval(() => { ta()?.setAttribute('placeholder', t.slice(0, ++k)); if (k >= t.length) clearInterval(typing); }, 28);
    }, 4200);
    return () => { clearInterval(tick); clearInterval(typing); };
  }, [temp]);

  const openFly = useCallback((kind, anchor) => setFly((f) => (f?.kind === kind ? null : { kind, anchor })), []);
  const closeFly = useCallback(() => setFly(null), []);
  useEffect(() => { if (mode !== 'try') { setFly(null); setPickerOpen(false); setDrawer(false); } }, [mode]);
  useEffect(() => {
    const key = (e) => {
      if (e.key !== 'Escape') return;
      if (fly) return setFly(null);
      if (pickerOpen) return setPickerOpen(false);
      if (mode === 'tour' && !framed) setMode('try');
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [fly, pickerOpen, mode, setMode, framed]);

  const onNewChat = useCallback(() => { stopStream(); setActive(null); activeRef.current = null; setText(''); setDrawer(false); root.current?.querySelector('textarea')?.focus(); }, []);
  const connected = servers.filter((s) => s.on).length;
  const onEdit = useCallback(() => signIn('', 'Sign in to edit messages'), [signIn]);
  const openPicker = useCallback(() => { setFly(null); setPickerOpen(true); }, []);

  return (
    <div ref={root} className={`nashapp${mode === 'tour' ? ' tourmode' : ''}${framed ? ' framed' : ''}${settled ? '' : ' presettle'}`} aria-label="Nash"
      onPointerDown={(e) => { if (mode === 'tour' && !framed && !e.target.closest('.hdr, .mobilenav, .tcard')) setMode('try'); }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} drawer={drawer} setDrawer={setDrawer}
        openFly={openFly} flyKind={fly?.kind} onNewChat={onNewChat} signIn={signIn} chats={chats} setChats={setChats} active={active} onOpen={openChat} />
      <AnimatePresence>{drawer && <motion.div className="navmask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.32, ease }} onClick={() => setDrawer(false)} />}</AnimatePresence>
      <div className="main">
        <div className="mobilenav">
          <button className="mnbtn" type="button" aria-label="Open sidebar" onClick={() => setDrawer(true)}><I name="panel-left" size={20} /></button>
          {!framed && <ModeSwitch mode={mode} setMode={setMode} id="mob" />}
          <button className="signin" type="button" onClick={() => signIn('', 'Sign in to Nash')}>Sign in</button>
        </div>
        <div className="hdr">
          <div className="hdrmid">{!framed && <ModeSwitch mode={mode} setMode={setMode} id="hdr" />}</div>
          <div className="hdrright">
            <button className="signin" type="button" onClick={() => signIn('', 'Sign in to Nash')}>Sign in</button>
            <button className="hmenu" type="button" aria-label="More" onClick={() => signIn('', 'Sign in to continue')}><I name="ellipsis" size={18} /></button>
          </div>
        </div>
        <div className={`landingcol${messages.length ? ' chatting' : ''}`}>
          {messages.length ? (
            <Thread messages={messages} model={model.name} signIn={signIn} onRegenerate={regenerate} onEdit={onEdit} />
          ) : (
          <div className="landing">
            <div className="greetwrap">
              <motion.h1 key={temp ? 't' : 'g'} className="greet" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease }}>
                {temp ? 'Temporary chat' : greet}
              </motion.h1>
              {temp && <p className="gdesc">This chat won’t be saved to your history.</p>}
            </div>
          </div>
          )}
          <Composer text={text} setText={setText} model={model.name} openPicker={openPicker} pickerOpen={pickerOpen}
            tools={tools} setTools={setTools} temp={temp} setTemp={setTemp} image={image} setImage={setImage}
            openFly={openFly} flyKind={fly?.kind} signIn={signIn} connected={connected} onSend={ask} />
        </div>
      </div>
      <Flyout fly={fly} onClose={closeFly} root={root} servers={servers} setServers={setServers} signIn={signIn} />
      <ModelPicker open={pickerOpen} onClose={() => setPickerOpen(false)} model={model} setModel={setModel} pins={pins} setPins={setPins} api={pickerApi} />
    </div>
  );
}

