import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const store = getFirestore();
const emailForId = (id) => `${id}@admins.villains.invalid`;

async function requireAdmin(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Faça login.');
  const doc = await store.collection('admins').doc(request.auth.uid).get();
  if (!doc.exists) throw new HttpsError('permission-denied', 'Acesso restrito.');
}

function validateId(id) {
  if (!/^\d{1,20}$/.test(String(id ?? ''))) throw new HttpsError('invalid-argument', 'ID inválido.');
  return String(id);
}

export const createAdministrator = onCall(async (request) => {
  await requireAdmin(request);
  const id = validateId(request.data?.id);
  const name = String(request.data?.name ?? '').trim();
  const password = String(request.data?.password ?? '');
  if (!name || password.length < 6) throw new HttpsError('invalid-argument', 'Informe nome e senha com pelo menos 6 caracteres.');
  const account = await getAuth().createUser({ email: emailForId(id), password, displayName: name });
  try {
    await store.collection('admins').doc(account.uid).set({ id, name, firstAccessPending: true, createdAt: FieldValue.serverTimestamp() });
  } catch (error) {
    await getAuth().deleteUser(account.uid);
    throw error;
  }
  return { uid: account.uid };
});

export const updateAdministrator = onCall(async (request) => {
  await requireAdmin(request);
  const uid = String(request.data?.uid ?? '');
  const name = String(request.data?.name ?? '').trim();
  if (!uid || !name) throw new HttpsError('invalid-argument', 'Dados inválidos.');
  await getAuth().updateUser(uid, { displayName: name });
  await store.collection('admins').doc(uid).update({ name });
  return { ok: true };
});

export const removeAdministrator = onCall(async (request) => {
  await requireAdmin(request);
  const uid = String(request.data?.uid ?? '');
  if (!uid || uid === request.auth.uid) throw new HttpsError('failed-precondition', 'Não é possível excluir sua própria conta.');
  await getAuth().deleteUser(uid);
  await store.collection('admins').doc(uid).delete();
  return { ok: true };
});
