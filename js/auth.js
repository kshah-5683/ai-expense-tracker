import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { auth } from "./firebase.js";

// RENAMED: initAuth -> initAuthListener to match app.js
export function initAuthListener(onLogin, onLogout) {
    if (!auth) {
        console.error("Auth object is undefined. Check firebase.js initialization.");
        return;
    }
    onAuthStateChanged(auth, (user) => {
        if (user) {
            onLogin(user);
        } else {
            onLogout();
        }
    });
}

export async function registerUser(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

export async function loginUser(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

export async function logoutUser() {
    return await signOut(auth);
}