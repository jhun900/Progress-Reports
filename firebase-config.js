import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "deped-educator-s-toolkit.firebaseapp.com",
  projectId: "deped-educator-s-toolkit",
  storageBucket: "deped-educator-s-toolkit.appspot.com",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

signInAnonymously(auth);

export async function updateTrialDisplay(userId) {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    // Default to 0 if document is missing
    const data = userDoc.exists() ? userDoc.data() : { exportCount: 0, isPremium: false };
    const used = data.exportCount || 0;
    const total = 3;
    const remaining = Math.max(0, total - used);
    
    const counterElement = document.getElementById('trial-counter');
    if (counterElement) {
        counterElement.innerText = `Free Tries Left: ${remaining}/${total}`;
    }
}

onAuthStateChanged(auth, (user) => {
    if (user) updateTrialDisplay(user.uid);
});

export async function checkExportLimit() {
  const user = auth.currentUser;
  if (!user) return false;

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  // 1. If user doesn't exist, create them immediately so they aren't blocked
  if (!docSnap.exists()) {
      await setDoc(userRef, { exportCount: 1, isPremium: false }, { merge: true });
      updateTrialDisplay(user.uid);
      return true; // First generation allowed
  }

  const data = docSnap.data();
  
  // 2. Premium users bypass all limits
  if (data.isPremium === true) return true;

  // 3. Limit check for non-premium users
  let count = data.exportCount || 0;
  if (count >= 3) return false;

  // 4. Increment for returning free users
  await updateDoc(userRef, { exportCount: increment(1) });
  
  updateTrialDisplay(user.uid);
  return true;
}
