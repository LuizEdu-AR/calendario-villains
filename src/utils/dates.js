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
