import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Ensure session persists across app restarts
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.error("Auth persistence error:", err);
    });

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setInitializing(false);

      // Optional safety: ensure user doc exists after login
      if (u) {
        const ref = doc(db, "users", u.uid);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          await setDoc(
            ref,
            {
              email: u.email ?? null,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            },
            { merge: true }
          );
        } else {
          // Update last login timestamp
          await setDoc(ref, { lastLoginAt: serverTimestamp() }, { merge: true });
        }
      }
    });

    return () => unsub();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Create user profile doc immediately on sign up
    await setDoc(
      doc(db, "users", cred.user.uid),
      {
        email: cred.user.email ?? email,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      },
      { merge: true }
    );

    return cred;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, initializing, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
