import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAeGfDFeMfgR5ZHPb4tQg4J1FOV39EdNbI",
  authDomain: "travel-717a3.firebaseapp.com",
  projectId: "travel-717a3",
  storageBucket: "travel-717a3.firebasestorage.app",
  messagingSenderId: "787669442283",
  appId: "1:787669442283:web:d0240789309551137528ae",
  measurementId: "G-SK0CW3SNK9"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
export const storage = getStorage(app);
export { auth, firestore };
