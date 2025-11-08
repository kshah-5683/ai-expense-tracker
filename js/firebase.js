import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- Configuration ---
// REPLACE WITH YOUR ACTUAL FIREBASE CONFIG FROM YOUR ORIGINAL FILE
const firebaseConfig = {
    apiKey: "AIzaSyDZy2U3T3dPFepklILdR9q3W5XJ3OgRpFY",
    authDomain: "ai-expense-tracker-b8335.firebaseapp.com",
    projectId: "ai-expense-tracker-b8335",
    storageBucket: "ai-expense-tracker-b8335.firebasestorage.app",
    messagingSenderId: "203162708463",
    appId: "1:203162708463:web:3315f19b33bb13a50aee1a",
};

export const APP_ID = 'ai-expense-tracker';

// --- Initialization ---
let app, auth, db;
try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
} catch (error) {
    console.error("Firebase initialization failed:", error);
    // We'll let the UI handle showing this error if possible, 
    // or it will be caught when trying to use auth/db.
}

export { auth, db };