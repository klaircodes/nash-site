import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { I } from '../../icons.jsx';
import { PROVIDERS, TIERS, TOTALS } from '../../data.js';
import { popDialog, fade, ease } from '../../motion.js';

/* DesktopModelModal.tsx: a 472px panel over a scrim; root lists providers, drilling in lists models,
   search selects models, the tier chips narrow, pins persist for the session. */
export default function ModelPicker({ open, onClose, model, setModel, pins, setPins, api }) {
  const [drill, setDrill] = useState(null);
  useEffect(() => { if (api) api.current = { drill: (v) => setDrill(PROVIDERS.find((p) => p.value === v) || null) }; }, [api]);
  const [q, setQ] = useState('');
  const [tier, setTier] = useState(null);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const search = useRef(null);

  useEffect(() => { if (open) { setDrill(null); setQ(''); requestAnimationFrame(() => search.current?.focus()); } }, [open]);
  useEffect(() => { setQ(''); }, [drill]);
  useEffect(() => {
    if (!open) return;
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); drill ? setDrill(null) : onClose(); } };
    window.addEventListener('keydown', key, true); return () => window.removeEventListener('keydown', key, true);
  }, [open, drill, onClose]);

  const isPinned = (name, ep) => pins.some((p) => p.name === name && p.ep === ep);
  const togglePin = (name, ep) => setPins((l) => (isPinned(name, ep) ? l.filter((p) => !(p.name === name && p.ep === ep)) : [...l, { name, ep }]));
  const tierOk = (m) => tier == null || m.tiers.includes(tier);
  const ql = q.trim().toLowerCase();

  const providers = useMemo(() => PROVIDERS.filter((p) => {
    const own = p.models.filter(tierOk); if (!own.length) return false;
    if (!ql) return true;
    return p.label.toLowerCase().includes(ql) || own.some((m) => m.name.toLowerCase().includes(ql));
  }), [ql, tier]);
  const results = useMemo(() => {
    if (!ql) return null;
    const out = [];
    PROVIDERS.forEach((p) => p.models.forEach((m) => { if (tierOk(m) && m.name.toLowerCase().includes(ql) && out.length < 60) out.push({ p, m }); }));
    return out;
  }, [ql, tier]);
  const pinnedRows = pins.filter((x) => { const p = PROVIDERS.find((pp) => pp.value === x.ep); return p && p.models.some((m) => m.name === x.name && tierOk(m)); });
  const drillModels = drill ? drill.models.filter(tierOk).filter((m) => !ql || m.name.toLowerCase().includes(ql)) : [];
  const narrowed = ql !== '' || tier != null;
  const tierLabel = TIERS.find((t) => t[0] === tier)?.[1];

  const pick = (name, ep) => { setModel({ name, ep }); onClose(); };
  const Pin = ({ name, ep }) => {
    const on = isPinned(name, ep);
    return (
      <span className={`mpin${on ? ' on' : ''}`} role="button" tabIndex={0} aria-label={on ? 'Unpin' : 'Pin'}
        onClick={(e) => { e.stopPropagation(); togglePin(name, ep); }}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); togglePin(name, ep); } }}>
        <I name="pin" size={12} />
      </span>
    );
  };
  const Empty = () => (
    <div className="mempty">
      <b>{ql ? `No models match “${q.trim()}”` : 'No models match'}</b>
      <p>{tier != null ? `The ${tierLabel} filter is narrowing this down.` : 'Try a shorter search.'}</p>
      {narrowed && <button type="button" onClick={() => { setQ(''); setTier(null); }}>Clear search and filters</button>}
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="mscrim on" {...fade} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
          <button className="mscrimx" type="button" aria-label="Close" tabIndex={-1} onClick={onClose} />
          <motion.div className="mpanel" role="dialog" aria-modal="true" aria-label="Select Model" {...popDialog}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={drill ? drill.value : 'root'} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1, gap: 10 }}
                initial={{ opacity: 0, x: drill ? 14 : -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: drill ? -14 : 14 }} transition={{ duration: 0.26, ease }}>
                <div className="mhead">
                  <div className="mtitle">
                    <div className="mtrow">
                      {drill && <button className="mback" type="button" aria-label="Back" onClick={() => setDrill(null)}><I name="chevron-left" size={18} /></button>}
                      <h2>{drill ? drill.label : 'Select Model'}</h2>
                    </div>
                    <p>{drill ? `${drill.count || drill.models.length} models` : `${TOTALS.models}+ models · ${TOTALS.providers} providers`}</p>
                  </div>
                  <button className="mclose" type="button" aria-label="Close" onClick={onClose}><I name="x" size={16} /></button>
                </div>
                <div className="msearch">
                  <I name="search" size={16} />
                  <input ref={search} type="text" value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder={drill ? `Search ${drill.label}...` : `Search ${TOTALS.models}+ models...`} aria-label="Search models" />
                </div>
                {!drill && (
                  <div className="mfilters">
                    <span className="fl">Filter</span>
                    <button className={`chip${tier == null && !pinnedOnly ? ' on' : ''}`} type="button" onClick={() => { setTier(null); setPinnedOnly(false); }}>All</button>
                    {pins.length > 0 && <button className={`chip${pinnedOnly ? ' on' : ''}`} type="button" onClick={() => { setTier(null); setPinnedOnly((v) => !v); }}>Pinned</button>}
                    {TIERS.map(([k, label]) => <button key={k} className={`chip${tier === k ? ' on' : ''}`} type="button" onClick={() => { setPinnedOnly(false); setTier(k); }}>{label}</button>)}
                  </div>
                )}
                <div className="mbody">
                  {drill ? (
                    drillModels.length === 0 ? <Empty /> : (
                      <>
                        <div className="mlabel">All models</div>
                        <div className="mlist">
                          {drillModels.map((m) => (
                            <button key={m.name} className="mrow h44" type="button" onClick={() => pick(m.name, drill.value)}>
                              <span className="mname13">{m.name}</span>
                              {model.name === m.name && model.ep === drill.value && <span className="tick"><I name="check" size={16} /></span>}
                              <Pin name={m.name} ep={drill.value} />
                            </button>
                          ))}
                        </div>
                      </>
                    )
                  ) : pinnedOnly ? (
                    pinnedRows.length ? (
                      <div className="mlist">
                        {pinnedRows.map((x) => {
                          const p = PROVIDERS.find((pp) => pp.value === x.ep);
                          return (
                            <button key={`${x.ep}-${x.name}`} className="mrow h52" type="button" onClick={() => pick(x.name, x.ep)}>
                              <span className="mt"><span className="mn">{x.name}</span><span className="mm">{p.label}</span></span>
                              <Pin name={x.name} ep={x.ep} />
                            </button>
                          );
                        })}
                      </div>
                    ) : <Empty />
                  ) : (
                    <>
                      {results && (
                        <>
                          <div className="mlabel">Models</div>
                          {results.length ? (
                            <div className="mlist">
                              {results.map(({ p, m }) => (
                                <button key={`${p.value}-${m.name}`} className="mrow h52" type="button" onClick={() => pick(m.name, p.value)}>
                                  <span className="mt"><span className="mn">{m.name}</span><span className="mm">{p.label}</span></span>
                                </button>
                              ))}
                            </div>
                          ) : <div style={{ padding: '8px 4px 20px', fontSize: 13, color: 'var(--text-secondary-alt)' }}>Nothing found</div>}
                        </>
                      )}
                      {providers.length > 0 ? <div className="mlabel">Providers</div> : !results && <Empty />}
                      <div className="mlist">
                        {providers.map((p) => (
                          <button key={p.value} className="mrow h62" type="button" onClick={() => setDrill(p)}>
                            <span className="mt"><span className="mn">{p.label}</span><span className="mm">{p.models.slice(0, 3).map((m) => m.name).join(', ')}</span></span>
                            <span className="mcnt">{p.count || p.models.length}</span>
                            <I name="chevron-right" size={16} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
