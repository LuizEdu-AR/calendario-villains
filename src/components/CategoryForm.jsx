import { useEffect, useState } from 'react';

const PRESETS = ['#EC4899', '#A78BFA', '#F97316', '#06B6D4', '#22C55E', '#EAB308', '#3B82F6', '#EF4444', '#56BD7C', '#D946EF'];
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toHex = (r, g, b) => `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
function hsvToHex(h, s, v) {
  const f = (n) => { const k = (n + h / 60) % 6; return Math.round((v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)) * 255); };
  return toHex(f(5), f(3), f(1));
}
function hexToHsv(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  let h = 0;
  if (delta) {
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h = (h * 60 + 360) % 360;
  }
  return { h, s: max === 0 ? 0 : delta / max, v: max };
}
export default function CategoryForm({ category, onSave, onClose, busy }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#56BD7C');
  const [hexInput, setHexInput] = useState('#56BD7C');
  const hsv = hexToHsv(color);
  const updateColor = (next) => { setColor(next.toUpperCase()); setHexInput(next.toUpperCase()); };
  useEffect(() => {
    setName(category?.name || '');
    const initial = /^#[0-9a-f]{6}$/i.test(category?.color || '') ? category.color : '#56BD7C';
    updateColor(initial);
  }, [category]);
  const pickSquare = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    updateColor(hsvToHex(hsv.h, clamp((event.clientX - bounds.left) / bounds.width, 0, 1), 1 - clamp((event.clientY - bounds.top) / bounds.height, 0, 1)));
  };
  const onSquareDown = (event) => { event.currentTarget.setPointerCapture(event.pointerId); pickSquare(event); };
  const onHexChange = (value) => { setHexInput(value); if (/^#[0-9a-f]{6}$/i.test(value)) setColor(value.toUpperCase()); };
  return (
    <form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSave({ name: name.trim(), color }); }}>
      <label>Nome da categoria<input required maxLength="60" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <div className="category-color-editor">
        <span className="category-color-label">Cor de identificação</span>
        <div className="category-color-top"><span className="category-color-swatch" style={{ backgroundColor: color }} /><label className="category-hex-label">Código HEX<input aria-label="Código hexadecimal da cor" maxLength={7} value={hexInput} onChange={(event) => onHexChange(event.target.value)} onBlur={() => setHexInput(color)} /></label></div>
        <div className="category-color-square" role="slider" aria-label="Saturação e brilho" aria-valuetext={`Saturação ${Math.round(hsv.s * 100)}%, brilho ${Math.round(hsv.v * 100)}%`} tabIndex={0} style={{ backgroundColor: hsvToHex(hsv.h, 1, 1) }} onPointerDown={onSquareDown} onPointerMove={(event) => { if (event.buttons === 1) pickSquare(event); }} onKeyDown={(event) => { const step = event.shiftKey ? .1 : .02; const changes = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }; if (changes[event.key]) { event.preventDefault(); const [ds, dv] = changes[event.key]; updateColor(hsvToHex(hsv.h, clamp(hsv.s + ds, 0, 1), clamp(hsv.v + dv, 0, 1))); } }}><span className="category-color-pointer" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} /></div>
        <label className="category-hue-label">Tonalidade<input type="range" min="0" max="359" value={Math.round(hsv.h)} onChange={(event) => updateColor(hsvToHex(Number(event.target.value), hsv.s, hsv.v))} aria-label="Tonalidade da cor" /></label>
        <div className="category-preset-title">Cores sugeridas</div>
        <div className="category-color-presets">{PRESETS.map((preset) => <button type="button" key={preset} className={preset.toUpperCase() === color ? 'active' : ''} aria-label={`Selecionar cor ${preset}`} aria-pressed={preset.toUpperCase() === color} title={preset} style={{ backgroundColor: preset }} onClick={() => updateColor(preset)} />)}</div>
        <div className="category-color-preview"><span style={{ backgroundColor: color }} />Prévia: <strong style={{ color }}>{name.trim() || 'Nome da categoria'}</strong></div>
      </div>
      <div className="modal-actions"><button type="button" className="button subtle" onClick={onClose}>Cancelar</button><button className="button primary" disabled={busy || !name.trim()}>{busy ? 'Salvando...' : 'Salvar categoria'}</button></div>
    </form>
  );
}
