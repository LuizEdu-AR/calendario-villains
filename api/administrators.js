import { services } from './_lib/firebaseAdmin.js';
import { FieldValue } from 'firebase-admin/firestore';
import {
  ApiError,
  requireAdministrator,
  sendError,
  validateId,
  validateName,
  validatePassword,
} from './_lib/permissions.js';

const emailForId = (id) => `${id}@admins.villains.invalid`;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Allow', 'GET, POST, PATCH, DELETE');
  if (!['GET', 'POST', 'PATCH', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Método não permitido.' });
  }

  try {
    const actor = await requireAdministrator(req);
    const { auth, db } = services();

    if (req.method === 'GET') {
      const snapshot = await db.collection('admins').get();
      return res.status(200).json({
        admins: snapshot.docs.map((doc) => ({
          uid: doc.id,
          id: doc.data().id,
          name: doc.data().name,
          isOwner: doc.id === process.env.VILLAINS_OWNER_UID,
        })),
        isOwner: actor.owner,
      });
    }

    if (req.method === 'POST') {
      const id = validateId(req.body?.id);
      const name = validateName(req.body?.name);
      const password = validatePassword(req.body?.password);
      if (id === '194') throw new ApiError(403, 'O ID 194 é reservado.');

      const account = await auth.createUser({ email: emailForId(id), password, displayName: name });
      try {
        await db.collection('admins').doc(account.uid).set({
          id,
          name,
          firstAccessPending: true,
          createdAt: FieldValue.serverTimestamp(),
        });
        await auth.setCustomUserClaims(account.uid, { admin: true });
      } catch (error) {
        await db.collection('admins').doc(account.uid).delete().catch(() => {});
        await auth.deleteUser(account.uid).catch(() => {});
        throw error;
      }
      return res.status(201).json({ uid: account.uid });
    }

    const uid = String(req.body?.uid ?? '');
    if (!uid || uid.length > 128) throw new ApiError(400, 'Conta inválida.');
    const ref = db.collection('admins').doc(uid);
    const snapshot = await ref.get();
    if (!snapshot.exists) throw new ApiError(404, 'Administrador não encontrado.');
    const targetIsOwner = uid === process.env.VILLAINS_OWNER_UID;

    if (req.method === 'DELETE') {
      if (uid === actor.uid) throw new ApiError(403, 'Você não pode remover sua própria conta.');
      if (targetIsOwner) throw new ApiError(403, 'Não é possível remover o administrador principal.');
      await auth.deleteUser(uid);
      await ref.delete();
      return res.status(200).json({ ok: true });
    }

    if (uid !== actor.uid && !actor.owner) {
      throw new ApiError(403, 'Somente Chico pode editar outros administradores.');
    }

    if (req.body?.firstAccessComplete === true) {
      if (uid !== actor.uid) throw new ApiError(403, 'Operação não permitida.');
      await ref.update({ firstAccessPending: false });
      return res.status(200).json({ ok: true });
    }

    const id = validateId(req.body?.id);
    const name = validateName(req.body?.name);
    if (targetIsOwner && !actor.owner) throw new ApiError(403, 'Conta principal protegida.');
    if (targetIsOwner && id !== '194') throw new ApiError(403, 'O ID do administrador principal é fixo.');
    if (!targetIsOwner && id === '194') throw new ApiError(403, 'O ID 194 é reservado.');

    const changes = { displayName: name };
    if (id !== snapshot.data().id) changes.email = emailForId(id);
    if (req.body?.password) {
      if (uid === actor.uid) throw new ApiError(400, 'Altere sua senha na seção Perfil.');
      if (!actor.owner) throw new ApiError(403, 'Sem permissão para redefinir senhas.');
      changes.password = validatePassword(req.body.password);
    }

    await auth.updateUser(uid, changes);
    await ref.update({ id, name });
    return res.status(200).json({ ok: true });
  } catch (error) {
    return sendError(res, error);
  }
}
