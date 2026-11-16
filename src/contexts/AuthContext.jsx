import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, updatePassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) return undefined;

    return onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      setIsAdmin(false);
      setProfile(null);

      if (currentUser) {
        try {
          const permission = await getDoc(doc(db, 'admins', currentUser.uid));
          setIsAdmin(permission.exists());
          if (permission.exists()) setProfile(permission.data());
        } catch (error) {
          console.error('Falha ao verificar administrador:', error);
        }
      }

      setLoading(false);
    });
  }, []);

  const login = (id, password) => {
    if (!/^\d+$/.test(id.trim())) throw new Error('ID inválido.');
    return signInWithEmailAndPassword(auth, `${id.trim()}@admins.villains.invalid`, password);
  };
  const changePassword = (password) => updatePassword(auth.currentUser, password);
  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, isAdmin, loading, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
