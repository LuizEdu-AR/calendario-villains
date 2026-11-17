export const dateKey = (date) => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const parseDate = (value) => new Date(`${value}T12:00:00`);

export const monthLabel = (date) => new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
}).format(date);

export const fullDate = (date) => new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
}).format(date);

export function getMonthCells(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells = [];
  const total = Math.ceil((first.getDay() + new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()) / 7) * 7;

  for (let index = 0; index < total; index += 1) {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    cells.push(current);
  }

  return cells;
}

export const eventOnDate = (event, key) => event.startDate <= key && (event.endDate || event.startDate) >= key;

export const sortEvents = (items) => [...items].sort((a, b) =>
  `${a.startDate} ${a.startTime || '00:00'}`.localeCompare(`${b.startDate} ${b.startTime || '00:00'}`),
);

export function getStatus(event) {
  if (event.status === 'cancelled') return { label: 'Cancelado', tone: 'danger' };
  if (event.status === 'completed') return { label: 'Concluído', tone: 'success' };
  const now = new Date();
  const end = new Date(`${event.endDate || event.startDate}T${event.allDay ? '23:59' : event.endTime || '23:59'}:00`);
  const start = new Date(`${event.startDate}T${event.allDay ? '00:00' : event.startTime || '00:00'}:00`);
  if (now > end) return { label: 'Encerrado', tone: 'muted' };
  if (now >= start) return { label: 'Em andamento', tone: 'success' };
  return { label: 'Agendado', tone: 'neutral' };
}

// O risco aparece a partir do minuto seguinte ao início programado.
// Eventos de dia inteiro só são considerados passados no dia seguinte.
export function hasStartedEarlier(event, now = new Date()) {
  if (!event.startDate) return false;
  if (event.allDay) {
    return dateKey(now) > (event.endDate || event.startDate);
  }
  if (!/^\d{2}:\d{2}$/.test(event.startTime || '')) return false;
  const start = new Date(`${event.startDate}T${event.startTime}:00`);
  return !Number.isNaN(start.getTime()) && now.getTime() >= start.getTime() + 60_000;
}


// Eventos são cadastrados no horário civil de Brasília, independentemente do navegador.
export const EVENT_TIME_ZONE = 'America/Sao_Paulo';
export const visitorTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || EVENT_TIME_ZONE;

export function brasiliaInstant(date, time = '00:00') {
  if (!date) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  // America/Sao_Paulo é UTC-3 para datas atuais; usar Intl para respeitar regras históricas.
  const [y, m, d] = match.slice(1).map(Number);
  const [h, min] = (time || '00:00').split(':').map(Number);
  let instant = Date.UTC(y, m - 1, d, h, min);
  for (let i = 0; i < 3; i += 1) {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: EVENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date(instant));
    const value = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
    const seen = Date.UTC(value.year, value.month - 1, value.day, value.hour, value.minute);
    const delta = Date.UTC(y, m - 1, d, h, min) - seen;
    if (!delta) break;
    instant += delta;
  }
  return new Date(instant);
}

export function localDateKey(instant) {
  if (!instant) return '';
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(instant).map((part) => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function localEventRange(event) {
  if (event.allDay) return { start: event.startDate, end: event.endDate || event.startDate };
  return {
    start: localDateKey(brasiliaInstant(event.startDate, event.startTime || '00:00')),
    end: localDateKey(brasiliaInstant(event.endDate || event.startDate, event.endTime || '23:59')),
  };
}

export function localEventOnDate(event, key) {
  const { start, end } = localEventRange(event);
  return start <= key && end >= key;
}

export function eventTimeLabel(event, date = event.startDate, time = event.startTime) {
  if (event.allDay) return 'Dia inteiro';
  const instant = brasiliaInstant(date, time);
  return instant ? new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(instant) : '--:--';
}

export function eventRangeLabel(event) {
  if (event.allDay) return 'Dia inteiro';
  return `${eventTimeLabel(event)} às ${eventTimeLabel(event, event.endDate || event.startDate, event.endTime || '23:59')}`;
}

export function brasiliaRangeLabel(event) {
  if (event.allDay) return 'Dia inteiro';
  return `${event.startTime || '--:--'} às ${event.endTime || '--:--'} (Brasília)`;
}

export function localEventStatus(event, now = new Date()) {
  if (event.status === 'cancelled') return { label: 'Cancelado', tone: 'danger' };
  if (event.status === 'completed') return { label: 'Concluído', tone: 'success' };
  const start = brasiliaInstant(event.startDate, event.allDay ? '00:00' : event.startTime || '00:00');
  const end = brasiliaInstant(event.endDate || event.startDate, event.allDay ? '23:59' : event.endTime || '23:59');
  if (!start || !end) return { label: 'Agendado', tone: 'neutral' };
  if (now > end) return { label: 'Encerrado', tone: 'muted' };
  if (now >= start) return { label: 'Em andamento', tone: 'success' };
  return { label: 'Agendado', tone: 'neutral' };
}

export function localHasStartedEarlier(event, now = new Date()) {
  const start = brasiliaInstant(event.startDate, event.allDay ? '00:00' : event.startTime || '00:00');
  return Boolean(start && now.getTime() >= start.getTime() + 60_000);
}
