import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const readable = (s) => s ? s.split('-').reverse().join('/') : '';
const weekdays = ['D','S','T','Q','Q','S','S'];

// Render popovers outside scrollable dialogs so their edges are never clipped.
function useFloatingPicker(open, root, popup, preferredWidth, preferredHeight) {
  const [position, setPosition] = useState({ top: 0, left: 0, visibility: 'hidden' });
  useLayoutEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = root.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(preferredWidth, window.innerWidth - 24);
      const height = popup.current?.offsetHeight || preferredHeight;
      const below = window.innerHeight - rect.bottom - 12;
      const above = rect.top - 12;
      const placeAbove = below < height && above > below;
      const top = placeAbove ? Math.max(12, rect.top - height - 7) : Math.min(rect.bottom + 7, Math.max(12, window.innerHeight - height - 12));
      const left = Math.max(12, Math.min(rect.left, window.innerWidth - width - 12));
      setPosition({ position: 'fixed', top, left, width, zIndex: 4000, visibility: 'visible' });
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true); };
  }, [open, root, popup, preferredWidth, preferredHeight]);
  return position;
}


export function DatePicker({ value, onChange, min, required, placeholder = 'dd/mm/aaaa' }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => value ? new Date(`${value}T12:00:00`) : new Date());
  const root = useRef(null);
  const popup = useRef(null);
  const position = useFloatingPicker(open, root, popup, 296, 375);
  useEffect(() => { if (value) setView(new Date(`${value}T12:00:00`)); }, [value]);
  useEffect(() => {
    const outside = (e) => { if (!root.current?.contains(e.target) && !popup.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', outside); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', esc); };
  }, []);
  const year = view.getFullYear(), month = view.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days = Array.from({length: 42}, (_, i) => new Date(year, month, i-first+1));
  const today = iso(new Date());
  return <div className="villains-picker" ref={root}>
    <button type="button" className={`picker-trigger ${!value ? 'placeholder' : ''}`} onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Selecionar data: ${readable(value) || placeholder}`}><span>{readable(value) || placeholder}</span><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/></svg></button>
    {required && <input className="picker-validation" tabIndex={-1} aria-hidden="true" required value={value} onChange={() => {}} />}
    {open && createPortal(<div className="date-popover floating-picker" ref={popup} style={position}><div className="date-picker-header"><button type="button" aria-label="Mês anterior" onClick={() => setView(new Date(year,month-1,1))}>‹</button><strong>{new Intl.DateTimeFormat('pt-BR',{month:'long',year:'numeric'}).format(view)}</strong><button type="button" aria-label="Próximo mês" onClick={() => setView(new Date(year,month+1,1))}>›</button></div><div className="date-picker-grid">{weekdays.map((w,i) => <span key={i} className="date-weekday">{w}</span>)}{days.map((day) => { const key = iso(day); return <button type="button" key={key} disabled={!!min && key < min} className={`${day.getMonth() !== month ? 'outside' : ''} ${key === today ? 'today' : ''} ${key === value ? 'picked' : ''}`} onClick={() => { onChange(key); setOpen(false); }}>{day.getDate()}</button>; })}</div><div className="date-picker-footer"><button type="button" onClick={() => {onChange('');setOpen(false);}}>Limpar</button><button type="button" disabled={!!min && today < min} onClick={() => {onChange(today);setOpen(false);}}>Hoje</button></div></div>, document.body)}
  </div>;
}

export function TimePicker({ value, onChange, required }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const popup = useRef(null);
  const position = useFloatingPicker(open, root, popup, 220, 290);
  const [h='00',m='00'] = (value || '00:00').split(':');
  useEffect(() => { const outside = (e) => { if (!root.current?.contains(e.target) && !popup.current?.contains(e.target)) setOpen(false); }; const esc = (e) => {if (e.key === 'Escape') setOpen(false);}; document.addEventListener('pointerdown',outside);document.addEventListener('keydown',esc);return () => {document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',esc);}; }, []);
  return <div className="villains-picker time-picker" ref={root}><button type="button" className="picker-trigger" aria-expanded={open} onClick={() => setOpen(!open)}><span>{value || '--:--'}</span><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></button>{required && <input className="picker-validation" tabIndex={-1} aria-hidden="true" required value={value} onChange={() => {}} />}{open && createPortal(<div className="time-popover floating-picker" ref={popup} style={position}><div className="time-popover-title">Selecionar horário</div><div className="time-columns"><div><small>Hora</small><div className="time-options">{Array.from({length:24},(_,i) => <button type="button" key={i} className={Number(h)===i?'picked':''} onClick={() => onChange(`${pad(i)}:${m}`)}>{pad(i)}</button>)}</div></div><div><small>Minuto</small><div className="time-options">{Array.from({length:60},(_,i) => <button type="button" key={i} className={Number(m)===i?'picked':''} onClick={() => onChange(`${h}:${pad(i)}`)}>{pad(i)}</button>)}</div></div></div><button type="button" className="time-done" onClick={() => setOpen(false)}>Concluir</button></div>, document.body)}</div>;
}
