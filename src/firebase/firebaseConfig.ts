// src/firebase/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase Configuration
 * Medical Home Project
 */
const firebaseConfig = {
  apiKey: "AIzaSyCarCSHjHzNsI4_q5PRUW-wzyfmch-i-o8",
  authDomain: "medical-home-ae490.firebaseapp.com",
  projectId: "medical-home-ae490",
  storageBucket: "medical-home-ae490.firebasestorage.app",
  messagingSenderId: "995005599633",
  appId: "1:995005599633:web:6f54ea64b0be31c7b21430",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
