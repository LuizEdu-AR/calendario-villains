import { auth } from './firebase';

async function request(method, data) {
  if (!auth?.currentUser) throw new Error('Faça login para continuar.');

  const token = await auth.currentUser.getIdToken();
  let response;
  try {
    response = await fetch('/api/administrators', {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(data ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Verifique se está executando pela Vercel.');
  }

  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Falha na operação administrativa.');
  return result;
}

export const listAdministrators = () => request('GET');
export const createAdministrator = (data) => request('POST', data);
export const updateAdministrator = (data) => request('PATCH', data);
export const removeAdministrator = (uid) => request('DELETE', { uid });
export const completeFirstAccess = (uid) => request('PATCH', { uid, firstAccessComplete: true });
