import { DatePicker, TimePicker } from './DateTimePickers';
import CategoryPicker from './CategoryPicker';
import { useEffect, useState } from 'react';

const blank = {
  title: '', description: '', categoryId: '', startDate: '', endDate: '',
  startTime: '20:00', endTime: '21:00', allDay: false, status: 'scheduled',
};

export default function EventForm({ event, categories, onSave, onClose, busy }) {
  const [form, setForm] = useState(blank);
  const [validation, setValidation] = useState('');

  useEffect(() => {
    setForm(event ? { ...blank, ...event } : { ...blank, categoryId: categories[0]?.id || '' });
  }, [event, categories]);

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  function submit(e) {
    e.preventDefault();
    if (form.endDate && form.endDate < form.startDate) { setValidation('A data final não pode ser anterior à data inicial.'); return; }
    if (!form.allDay && !form.endDate && form.endTime <= form.startTime) { setValidation('O horário de término deve ser posterior ao início.'); return; }
    setValidation('');
    const { id, ...payload } = form;
    onSave(payload);
  }

  return (
    <form onSubmit={submit} className="form-stack">
      {validation && <p className="notice error" role="alert">{validation}</p>}
      <label>Nome do evento<input required maxLength="120" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex.: Reunião da fraternidade" /></label>
      <label>Categoria<CategoryPicker categories={categories} value={form.categoryId} onChange={(value) => set('categoryId', value)} /></label>
      <div className="form-two"><label>Data de início<DatePicker required value={form.startDate} onChange={(value) => set('startDate', value)} /></label><label>Data final (opcional)<DatePicker min={form.startDate} value={form.endDate} onChange={(value) => set('endDate', value)} /></label></div>
      <label className="check-label"><input type="checkbox" checked={form.allDay} onChange={(e) => set('allDay', e.target.checked)} /> Dia inteiro</label>
      {!form.allDay && <div className="form-two"><label>Início<TimePicker required value={form.startTime} onChange={(value) => set('startTime', value)} /></label><label>Término<TimePicker required value={form.endTime} onChange={(value) => set('endTime', value)} /></label></div>}
      <label>Status<select value={form.status} onChange={(e) => set('status', e.target.value)}><option value="scheduled">Agendado</option><option value="completed">Concluído</option><option value="cancelled">Cancelado</option></select></label>
      <label>Descrição<textarea rows="4" value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Informações adicionais para os participantes" /></label>
      <div className="modal-actions"><button type="button" className="button subtle" onClick={onClose}>Cancelar</button><button type="submit" className="button primary" disabled={busy}>{busy ? 'Salvando...' : event ? 'Salvar alterações' : 'Criar evento'}</button></div>
    </form>
  );
}
