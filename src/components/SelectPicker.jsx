import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function SelectPicker({ value, onChange, options, searchable = false, placeholder = 'Selecione' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef(null);
  const search = useRef(null);
  const selected = options.find((option) => option.value === value);
  useEffect(() => {
    const outside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);
  useEffect(() => { if (open && searchable) search.current?.focus(); if (!open) setQuery(''); }, [open, searchable]);
  const visible = options.filter((option) => option.label.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  return <div className="villains-select" ref={root}>
    <button type="button" className="villains-select-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span className="villains-select-value">{selected?.color && <span className="category-picker-dot" style={{ background: selected.color }} />}{selected?.label || placeholder}</span><ChevronDown size={16} />
    </button>
    {open && <div className="villains-select-menu">
      {searchable && <div className="category-picker-search"><Search size={15}/><input ref={search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar..." aria-label="Pesquisar opções" /></div>}
      <div className="villains-select-options" role="listbox">{visible.map((option) => <button type="button" role="option" aria-selected={value === option.value} className={value === option.value ? 'selected' : ''} key={option.value} onClick={() => { onChange(option.value); setOpen(false); }}>
        {option.color && <span className="category-picker-dot" style={{ background: option.color }} />}<span>{option.label}</span>{value === option.value && <Check size={15} />}
      </button>)}{!visible.length && <div className="category-picker-empty">Nenhuma opção encontrada.</div>}</div>
    </div>}
  </div>;
}
