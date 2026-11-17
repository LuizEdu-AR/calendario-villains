import { services } from './firebaseAdmin.js';

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export async function requireAdministrator(req) {
  const authorization = req.headers.authorization || '';
  if (!authorization.startsWith('Bearer ')) throw new ApiError(401, 'Faça login novamente.');

  const { auth, db } = services();
  let decoded;
  try {
    decoded = await auth.verifyIdToken(authorization.slice(7), true);
  } catch (error) {
    console.error('Falha na validação Firebase:', {
      code: error.code || 'unknown',
      message: error.message || 'Erro desconhecido'
    });
    throw new ApiError(401, 'Sessão inválida ou expirada.');
  }

  const snapshot = await db.collection('admins').doc(decoded.uid).get();
  if (!snapshot.exists) throw new ApiError(403, 'Acesso restrito a administradores.');

  const user = await auth.getUser(decoded.uid);
  if (user.disabled) throw new ApiError(403, 'Conta desativada.');

  const ownerUid = process.env.VILLAINS_OWNER_UID;
  if (!ownerUid) throw new Error('VILLAINS_OWNER_UID não configurado.');

  const owner = decoded.uid === ownerUid && user.email === '194@admins.villains.invalid';
  return { uid: decoded.uid, owner, profile: snapshot.data(), auth, db };
}

export function validateId(value) {
  const id = String(value ?? '').trim();
  if (!/^\d{1,20}$/.test(id)) throw new ApiError(400, 'ID inválido.');
  return id;
}

export function validateName(value) {
  const name = String(value ?? '').trim();
  if (!name || name.length > 100) throw new ApiError(400, 'Informe um nome de até 100 caracteres.');
  return name;
}

export function validatePassword(value) {
  if (typeof value !== 'string' || value.length < 6 || value.length > 128) {
    throw new ApiError(400, 'A senha deve ter entre 6 e 128 caracteres (limite mínimo do Firebase).');
  }
  return value;
}

export function sendError(res, error) {
  if (error instanceof ApiError) return res.status(error.status).json({ error: error.message });
  if (error.code === 'auth/email-already-exists') return res.status(409).json({ error: 'Este ID já está cadastrado.' });
  if (error.code === 'auth/uid-already-exists') return res.status(409).json({ error: 'Conta já existente.' });
  console.error('Falha na API administrativa:', error);
  return res.status(500).json({ error: 'Não foi possível concluir a operação.' });
}
