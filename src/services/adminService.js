import { httpsCallable, getFunctions } from 'firebase/functions';
import { app } from './firebase';

function invoke(name, payload) {
  if (!app) throw new Error('Firebase não configurado.');
  return httpsCallable(getFunctions(app, 'us-central1'), name)(payload);
}

export const createAdministrator = (data) => invoke('createAdministrator', data);
export const removeAdministrator = (uid) => invoke('removeAdministrator', { uid });
export const updateAdministrator = (data) => invoke('updateAdministrator', data);
