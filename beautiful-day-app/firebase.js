// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqm7pyLbYBi9IXGosv6VQYKruv3odkUkw",
  authDomain: "note-908b7.firebaseapp.com",
  databaseURL: "https://note-908b7-default-rtdb.firebaseio.com",
  projectId: "note-908b7",
  storageBucket: "note-908b7.firebasestorage.app",
  messagingSenderId: "319427675686",
  appId: "1:319427675686:web:4e5dbe368225afa4e148e7",
  measurementId: "G-C5V78X40GX"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };