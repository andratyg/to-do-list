import React, { createContext, useContext, useState, useEffect } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  ref,
  update
} from "../firebase/config";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        let rawName = user.displayName || user.email?.split("@")[0] || "User";
        const cleanName = rawName.replace(/[0-9]/g, "").trim() || rawName;

        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: cleanName,
          photoURL: user.photoURL
        });

        // Sync basic profile data to Firebase RTDB for Admin view
        try {
          update(ref(db, `users/${user.uid}`), {
            username: cleanName,
            email: user.email,
            lastLogin: new Date().toISOString()
          }).catch(() => {});
        } catch (e) {
          console.error("Error updating user record:", e);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function register(email, password, username) {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (res.user && username) {
      await updateProfile(res.user, { displayName: username });
      setCurrentUser((prev) => (prev ? { ...prev, displayName: username } : prev));
      await update(ref(db, `users/${res.user.uid}`), {
        username: username,
        email: email,
        createdAt: new Date().toISOString()
      });
    }
    return res;
  }

  async function loginWithGoogle() {
    const res = await signInWithPopup(auth, googleProvider);
    if (res.user) {
      const cleanName = res.user.displayName || res.user.email?.split("@")[0];
      await update(ref(db, `users/${res.user.uid}`), {
        username: cleanName,
        email: res.user.email,
        lastLogin: new Date().toISOString()
      });
    }
    return res;
  }

  async function logout() {
    return signOut(auth);
  }

  async function changeUsername(newUsername) {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: newUsername });
    await update(ref(db, `users/${auth.currentUser.uid}`), { username: newUsername });
    setCurrentUser((prev) => ({ ...prev, displayName: newUsername }));
  }

  const value = {
    currentUser,
    login,
    register,
    loginWithGoogle,
    logout,
    changeUsername,
    loading
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
