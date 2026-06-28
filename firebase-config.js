// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "deped-educator-s-toolkit.firebaseapp.com",
  projectId: "deped-educator-s-toolkit",
  storageBucket: "deped-educator-s-toolkit.appspot.com",
  // ... (fill in the rest from your Firebase console)
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Sign in anonymously for easy tracking
signInAnonymously(auth);

// Export a function to be used by all your pages
export async function checkExportLimit() {
  const user = auth.currentUser;
  if (!user) return false;

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  let count = docSnap.exists() ? (docSnap.data().exportCount || 0) : 0;

  if (count >= 3) {
    alert("Free limit reached! Please upgrade to continue.");
    window.location.href = 'pricing.html'; // Or your subscription page
    return false;
  }

  await updateDoc(userRef, { exportCount: increment(1) }, { merge: true });
  return true;
}
