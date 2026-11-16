import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';

export const initialCategories = [
  { name: 'Reunião', color: '#79a8ff' },
  { name: 'Estudo Villains', color: '#b497f2' },
  { name: 'Lore Interna', color: '#ce75b5' },
  { name: 'Recrutamento', color: '#f1b75e' },
  { name: 'Evento Interno', color: '#56bd7c' },
  { name: 'Aniversário', color: '#ee8fa9' },
  { name: 'Evento Fraternidades', color: '#6ec4c5' },
  { name: 'Evento Cidade', color: '#d99a69' },
];

export function subscribeCollection(name, callback, onError) {
  if (!db) return () => {};

  return onSnapshot(
    collection(db, name),
    (snapshot) => callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
}

export function createRecord(name, payload) {
  return addDoc(collection(db, name), payload);
}

export function updateRecord(name, id, payload) {
  return updateDoc(doc(db, name, id), payload);
}

export function removeRecord(name, id) {
  return deleteDoc(doc(db, name, id));
}
