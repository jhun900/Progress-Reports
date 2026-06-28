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

// Sign in anonymously
signInAnonymously(auth);

// Function to update the UI counter
export async function updateTrialDisplay(userId) {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    // Default values if user doesn't exist yet
    const used = userDoc.exists() ? (userDoc.data().exportCount || 0) : 0;
    const total = 3;
    const remaining = Math.max(0, total - used);
    
    const counterElement = document.getElementById('trial-counter');
    if (counterElement) {
        counterElement.innerText = `Free Tries Left: ${remaining}/${total}`;
    }
}

// Automatically update the UI once the user is signed in
onAuthStateChanged(auth, (user) => {
    if (user) {
        updateTrialDisplay(user.uid);
    }
});

// Export the limit check function
export async function checkExportLimit() {
  const user = auth.currentUser;
  if (!user) return false;

  const userRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(userRef);

  let count = docSnap.exists() ? (docSnap.data().exportCount || 0) : 0;

  if (count >= 3) {
    alert("Free limit reached! Please upgrade to continue.");
    window.location.href = 'Subscription button.html';
    return false;
  }

  await updateDoc(userRef, { exportCount: increment(1) }, { merge: true });
  
  // Refresh the UI counter after incrementing
  updateTrialDisplay(user.uid);
  return true;
}
