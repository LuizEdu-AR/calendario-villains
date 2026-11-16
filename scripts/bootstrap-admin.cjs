const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

async function main() {
  const path = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const password = process.env.VILLAINS_INITIAL_PASSWORD;

  if (!path || !password || password.length < 6) {
    throw new Error(
      'Configure GOOGLE_APPLICATION_CREDENTIALS e ' +
      'VILLAINS_INITIAL_PASSWORD (mínimo 6 caracteres).'
    );
  }

  // Inicializa o Firebase Admin SDK
  initializeApp({
    credential: cert(require(path)),
  });

  const auth = getAuth();
  const db = getFirestore();

  // Administrador principal
  const email = '194@admins.villains.invalid';

  let account;

  try {
    account = await auth.getUserByEmail(email);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') {
      throw error;
    }

    account = await auth.createUser({
      email,
      password,
      displayName: 'Chico D. Wind',
    });
  }

  // Atribui permissão administrativa no Firebase Auth
  await auth.setCustomUserClaims(account.uid, {
    ...account.customClaims,
    admin: true,
  });

  // Registra o administrador no Firestore
  await db.collection('admins').doc(account.uid).set(
    {
      id: '194',
      name: 'Chico D. Wind',
      firstAccessPending: false,
    },
    {
      merge: true,
    }
  );

  // Categorias iniciais do calendário
  const categories = [
    ['Reunião', '#3B82F6'],
    ['Estudo Villains', '#A78BFA'],
    ['Lore Interna', '#D946EF'],
    ['Recrutamento', '#F59E0B'],
    ['Evento Interno', '#22C55E'],
    ['Aniversário', '#EC4899'],
    ['Evento Fraternidades', '#06B6D4'],
    ['Evento Cidade', '#F97316'],
  ];

  const batch = db.batch();

  let created = 0;

  for (const [name, color] of categories) {
    const id = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const ref = db.collection('categories').doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      batch.set(ref, {
        name,
        color,
      });

      created += 1;
    }
  }

  if (created > 0) {
    await batch.commit();
  }

  console.log('Administrador principal configurado:', account.uid);
  console.log('Permissão administrativa atribuída: admin = true');
  console.log(
    `Categorias iniciais criadas: ${created} (sem duplicar existentes).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
