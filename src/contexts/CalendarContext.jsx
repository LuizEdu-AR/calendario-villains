import { createContext, useContext, useEffect, useState } from 'react';
import { firebaseConfigured } from '../services/firebase';
import { initialCategories, subscribeCollection } from '../services/calendarService';

const CalendarContext = createContext(null);

export function CalendarProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured) return undefined;

    let eventReady = false;
    let categoryReady = false;
    const ready = () => {
      if (eventReady && categoryReady) setLoading(false);
    };
    const fail = (issue) => {
      console.error(issue);
      setError('Não foi possível carregar o calendário. Confira a configuração e as regras do Firebase.');
      setLoading(false);
    };

    const stopEvents = subscribeCollection('events', (items) => {
      setEvents(items);
      eventReady = true;
      ready();
    }, fail);

    const stopCategories = subscribeCollection('categories', (items) => {
      setCategories(items);
      categoryReady = true;
      ready();
    }, fail);

    return () => {
      stopEvents();
      stopCategories();
    };
  }, []);

  return (
    <CalendarContext.Provider value={{ events, categories, error, loading, initialCategories }}>
      {children}
    </CalendarContext.Provider>
  );
}

export const useCalendar = () => useContext(CalendarContext);
