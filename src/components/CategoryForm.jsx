import { useEffect, useState } from 'react';

export default function CategoryForm({ category, onSave, onClose, busy }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#56bd7c');

  useEffect(() => {
    setName(category?.name || '');
    setColor(category?.color || '#56bd7c');
  }, [category]);

  return (
    <form className="form-stack" onSubmit={(event) => { event.preventDefault(); onSave({ name: name.trim(), color }); }}>
      <label>Nome da categoria<input required maxLength="60" value={name} onChange={(event) => setName(event.target.value)} /></label>
      <label>Cor de identificação<div className="color-control"><input type="color" value={color} onChange={(event) => setColor(event.target.value)} /><span>{color.toUpperCase()}</span></div></label>
      <div className="modal-actions"><button type="button" className="button subtle" onClick={onClose}>Cancelar</button><button className="button primary" disabled={busy || !name.trim()}>{busy ? 'Salvando...' : 'Salvar categoria'}</button></div>
    </form>
  );
}
