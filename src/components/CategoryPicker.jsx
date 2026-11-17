import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

export default function CategoryPicker({ categories, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const root = useRef(null);
  const search = useRef(null);
  const selected = categories.find((category) => category.id === value);
  const filtered = useMemo(() => categories.filter((category) => category.name.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [categories, query]);
  useEffect(() => {
    const outside = (event) => { if (!root.current?.contains(event.target)) setOpen(false); };
    const escape = (event) => { if (event.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);
  useEffect(() => { if (open) search.current?.focus(); else setQuery(''); }, [open]);
  return <div className="category-picker" ref={root}>
    <button type="button" className="category-picker-trigger" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((current) => !current)}>
      <span className="category-picker-choice">{selected && <span className="category-picker-dot" style={{ background: selected.color }} />}{selected?.name || 'Selecione uma categoria'}</span><ChevronDown size={16} />
    </button>
    {!value && <input className="picker-validation" required value={value} onChange={() => {}} tabIndex={-1} aria-hidden="true" />}
    {open && <div className="category-picker-menu"><div className="category-picker-search"><Search size={15} /><input ref={search} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar categoria..." aria-label="Pesquisar categoria" /></div><div className="category-picker-options" role="listbox" aria-label="Categorias">{filtered.map((category) => <button type="button" role="option" aria-selected={value === category.id} className={value === category.id ? 'selected' : ''} key={category.id} onClick={() => { onChange(category.id); setOpen(false); }}><span className="category-picker-dot" style={{ background: category.color }} /><span>{category.name}</span>{value === category.id && <Check size={15} />}</button>)}{!filtered.length && <p className="category-picker-empty">Nenhuma categoria encontrada.</p>}</div></div>}
  </div>;
}
