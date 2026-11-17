import { dateKey, localEventOnDate, localEventRange, fullDate, getMonthCells, localEventStatus, localHasStartedEarlier, eventTimeLabel, eventRangeLabel } from '../utils/dates';

const weekdays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export default function MonthCalendar({ month, events, categories, onSelect, now }) {
  const cells = getMonthCells(month);
  const today = dateKey(new Date());
  const weeks = Array.from({ length: cells.length / 7 }, (_, week) => {
    const first = dateKey(cells[week * 7]);
    const last = dateKey(cells[week * 7 + 6]);
    const spans = events.flatMap((event) => {
      const range = localEventRange(event);
      if (range.start === range.end || range.start > last || range.end < first) return [];
      const start = cells.slice(week * 7, week * 7 + 7).findIndex((date) => dateKey(date) >= range.start);
      const end = cells.slice(week * 7, week * 7 + 7).findLastIndex((date) => dateKey(date) <= range.end);
      return [{ event, start: Math.max(0, start), end: end < 0 ? 6 : end }];
    }).sort((a, b) => a.start - b.start || b.end - a.end);
    const lanes = [];
    for (const span of spans) {
      let lane = lanes.findIndex((occupiedEnd) => occupiedEnd < span.start);
      if (lane < 0) lane = lanes.length;
      lanes[lane] = span.end;
      span.lane = lane;
    }
    return { spans, lanes: lanes.length };
  });

  return (
    <div className="calendar-grid" role="grid" aria-label="Calendário mensal">
      {weekdays.map((day) => <div key={day} className="weekday">{day}</div>)}
      {cells.map((date, index) => {
        const key = dateKey(date);
        const week = Math.floor(index / 7);
        const dayEvents = events.filter((event) => localEventOnDate(event, key));
        const singleDayEvents = dayEvents.filter((event) => {
          const range = localEventRange(event);
          return range.start === range.end;
        });
        return (
          <div key={key} className={`calendar-day ${date.getMonth() !== month.getMonth() ? 'outside' : ''} ${key === today ? 'today' : ''}`} style={{ '--multi-lanes': weeks[week].lanes }} role="gridcell" tabIndex={0} aria-label={`${fullDate(date)}, ${dayEvents.length} eventos`}>
            <div className="day-number">{key === today && <span>HOJE</span>}{date.getDate()}</div>
            <div className="day-events">
              {singleDayEvents.slice(0, 3).map((event) => {
                const category = categories.find((item) => item.id === event.categoryId);
                return <button key={event.id} className={`calendar-event ${localHasStartedEarlier(event, now) ? 'event-past' : ''}`} style={{ '--event-color': category?.color || '#8b9b8d' }} onClick={() => onSelect(event)} title={event.title}><span>{event.allDay ? '' : eventTimeLabel(event)}</span> {event.title}</button>;
              })}
              {singleDayEvents.length > 3 && <small className="more-events">+{singleDayEvents.length - 3} eventos</small>}
            </div>
            {dayEvents.length > 0 && (
              <div className="day-popover">
                <div className="popover-title"><strong>{fullDate(date)}</strong><small>{dayEvents.length} evento(s)</small></div>
                {dayEvents.map((event) => {
                  const category = categories.find((item) => item.id === event.categoryId);
                  return <button key={event.id} className={`popover-event ${localHasStartedEarlier(event, now) ? 'event-past' : ''}`} style={{ '--event-color': category?.color || '#8b9b8d' }} onClick={() => onSelect(event)}><strong>{event.title}</strong><span>{category?.name || 'Sem categoria'} · {event.allDay ? 'Dia inteiro' : eventRangeLabel(event)} · {localEventStatus(event, now).label}</span></button>;
                })}
              </div>
            )}
          </div>
        );
      })}
      {weeks.flatMap(({ spans }, week) => spans.map(({ event, start, end, lane }) => {
        const category = categories.find((item) => item.id === event.categoryId);
        const range = localEventRange(event);
        const startsHere = range.start >= dateKey(cells[week * 7]);
        const endsHere = range.end <= dateKey(cells[week * 7 + 6]);
        return <button
          key={`${event.id}-${week}`}
          type="button"
          className={`calendar-multiday ${startsHere ? 'multi-start' : 'multi-continued'} ${endsHere ? 'multi-end' : ''} ${localHasStartedEarlier(event, now) ? 'event-past' : ''}`}
          style={{ gridColumn: `${start + 1} / ${end + 2}`, gridRow: week + 2, '--multi-lane': lane, '--event-color': category?.color || '#8b9b8d' }}
          title={`${event.title} · ${eventRangeLabel(event)}`}
          aria-label={`${event.title}, ${eventRangeLabel(event)}`}
          onClick={() => onSelect(event)}
        >
          <span className="multi-title">{event.title}</span>
          {endsHere && !event.allDay && <span className="multi-end-time">{eventTimeLabel(event, event.endDate || event.startDate, event.endTime || '23:59')}</span>}
        </button>;
      }))}
    </div>
  );
}
