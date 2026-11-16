import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const store = getFirestore();
const emailForId = (id) => `${id}@admins.villains.invalid`;

async function requireAdmin(request) {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Faça login.');
  const snapshot = await store.collection('admins').doc(request.auth.uid).get();
  if (!snapshot.exists) throw new HttpsError('permission-denied', 'Acesso restrito.');
  return { uid: request.auth.uid, ...snapshot.data() };
}

async function isOwner(admin) {
  const account = await getAuth().getUser(admin.uid);
  return admin.id === '194' && account.email === emailForId('194');
}

function validateId(id) {
  if (!/^\d{1,20}$/.test(String(id ?? ''))) throw new HttpsError('invalid-argument', 'ID inválido.');
  return String(id);
}

function validatePassword(password) {
  if (String(password ?? '').length < 6) throw new HttpsError('invalid-argument', 'A senha deve ter pelo menos 6 caracteres (exigência do Firebase).');
  return String(password);
}

export const listAdministrators = onCall(async (request) => {
  await requireAdmin(request);
  const snapshot = await store.collection('admins').get();
  return { admins: snapshot.docs.map((entry) => ({ uid: entry.id, id: entry.data().id, name: entry.data().name })) };
});

export const createAdministrator = onCall(async (request) => {
  await requireAdmin(request);
  const id = validateId(request.data?.id);
  if (id === '194') throw new HttpsError('permission-denied', 'ID reservado ao administrador principal.');
  const name = String(request.data?.name ?? '').trim();
  const password = validatePassword(request.data?.password);
  if (!name) throw new HttpsError('invalid-argument', 'Informe o nome.');
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
  const actor = await requireAdmin(request);
  const uid = String(request.data?.uid ?? '');
  if (!uid) throw new HttpsError('invalid-argument', 'Conta inválida.');
  if (uid !== actor.uid && !(await isOwner(actor))) throw new HttpsError('permission-denied', 'Somente Chico pode editar outros administradores.');
  const target = await store.collection('admins').doc(uid).get();
  if (!target.exists) throw new HttpsError('not-found', 'Administrador não encontrado.');
  const name = String(request.data?.name ?? '').trim();
  const id = validateId(request.data?.id);
  if (!name) throw new HttpsError('invalid-argument', 'Informe o nome.');
  const targetOwner = target.data().id === '194';
  if ((targetOwner && id !== '194') || (!targetOwner && id === '194')) throw new HttpsError('permission-denied', 'O ID 194 é reservado.');
  const changes = { displayName: name };
  if (id !== target.data().id) changes.email = emailForId(id);
  if (request.data?.password) {
    if (uid === actor.uid) throw new HttpsError('failed-precondition', 'Altere sua própria senha no Perfil.');
    if (!(await isOwner(actor))) throw new HttpsError('permission-denied', 'Sem permissão para redefinir senha.');
    changes.password = validatePassword(request.data.password);
  }
  await getAuth().updateUser(uid, changes);
  await store.collection('admins').doc(uid).update({ name, id });
  return { ok: true };
});

export const removeAdministrator = onCall(async (request) => {
  const actor = await requireAdmin(request);
  const uid = String(request.data?.uid ?? '');
  if (!uid || uid === actor.uid) throw new HttpsError('failed-precondition', 'Não é possível excluir sua própria conta.');
  const target = await store.collection('admins').doc(uid).get();
  if (!target.exists) throw new HttpsError('not-found', 'Administrador não encontrado.');
  if (target.data().id === '194') throw new HttpsError('permission-denied', 'Não é possível excluir o administrador principal.');
  await getAuth().deleteUser(uid);
  await store.collection('admins').doc(uid).delete();
  return { ok: true };
});
