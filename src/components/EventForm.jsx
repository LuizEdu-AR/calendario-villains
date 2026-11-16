import { useEffect, useState } from 'react';

const blank = {
  title: '', description: '', categoryId: '', startDate: '', endDate: '',
  startTime: '20:00', endTime: '21:00', allDay: false, status: 'scheduled',
};

export default function EventForm({ event, categories, onSave, onClose, busy }) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    setForm(event ? { ...blank, ...event } : { ...blank, categoryId: categories[0]?.id || '' });
  }, [event, categories]);

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  function submit(e) {
    e.preventDefault();
    if (form.endDate && form.endDate < form.startDate) return;
    if (!form.allDay && !form.endDate && form.endTime <= form.startTime) return;
    const { id, ...payload } = form;
    onSave(payload);
  }

  return (
    <form onSubmit={submit} className="form-stack">
      <label>Nome do evento<input required maxLength="120" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: Reunião da fraternidade" /></label>
      <label>Categoria<select required value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}><option value="">Selecione</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
      <div className="form-two"><label>Data de início<input required type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} /></label><label>Data final (opcional)<input type="date" min={form.startDate} value={form.endDate} onChange={(e) => set('endDate', e.target.value)} /></label></div>
      <label className="check-label"><input type="checkbox" checked={form.allDay} onChange={(e) => set('allDay', e.target.checked)} /> Dia inteiro</label>
      {!form.allDay && <div className="form-two"><label>Início<input type="time" required value={form.startTime} onChange={(e) => set('startTime', e.target.value)} /></label><label>Término<input type="time" required value={form.endTime} onChange={(e) => set('endTime', e.target.value)} /></label></div>}
      <label>Status<select value={form.status} onChange={(e) => set('status', e.target.value)}><option value="scheduled">Agendado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></label>
      <label>Descrição<textarea rows="4" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Informações adicionais para os participantes" /></label>
      <div className="modal-actions"><button type="button" className="button subtle" onClick={onClose}>Cancelar</button><button type="submit" className="button primary" disabled={busy}>{busy ? 'Salvando...' : event ? 'Salvar alterações' : 'Criar evento'}</button></div>
    </form>
  );
}
