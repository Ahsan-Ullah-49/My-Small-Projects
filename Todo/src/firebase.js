import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC5wC6rdMnKRN3g2lkP3v_8ZO28gIlu1Ew",
  authDomain: "taskflow-53c3e.firebaseapp.com",
  projectId: "taskflow-53c3e",
  storageBucket: "taskflow-53c3e.firebasestorage.app",
  messagingSenderId: "438015874550",
  appId: "1:438015874550:web:96366eef3c71d61c3263d7",
  measurementId: "G-FC62BRSJYV"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

enableIndexedDbPersistence(db).catch((err) => {
  console.warn("Firestore offline persistence failed", err);
});
