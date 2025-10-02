import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase Config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Refresh Firebase auth session if stored credentials exist
 */
export const refreshFirebaseAuthSession = async () => {
  try {
    const sellerId = localStorage.getItem('sellerId');
    const sellerEmail = localStorage.getItem('sellerEmail');

    if (!sellerId || !sellerEmail) {
      return false;
    }

    if (!auth.currentUser || auth.currentUser.email !== sellerEmail) {
      try {
        const sellerDoc = await getDoc(doc(db, 'sellers', sellerId));
        if (!sellerDoc.exists()) return false;

        const sellerData = sellerDoc.data();
        const plainPassword = sellerData.plainPassword || sellerData.password;

        if (plainPassword && sellerEmail) {
          await signInWithEmailAndPassword(auth, sellerEmail, plainPassword);
          return true;
        }
      } catch (error) {
        console.error("Error refreshing auth session:", error);
        return false;
      }
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error in refreshFirebaseAuthSession:", error);
    return false;
  }
  return false;
};

// Admin Creation Flag
let adminCreationAttempted = false;

/**
 * Create or sign in admin user
 */
export const createAdminUser = async () => {
  if (adminCreationAttempted) return;
  adminCreationAttempted = true;

  try {
    const adminEmail = "novadelight@admin.com";
    const adminPassword = "NoveDelight$07";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      const adminDoc = await getDoc(doc(db, 'admins', userCredential.user.uid));

      if (!adminDoc.exists()) {
        await setDoc(doc(db, 'admins', userCredential.user.uid), {
          email: adminEmail,
          role: 'admin',
          createdAt: new Date().toISOString()
        });
      }

      await auth.signOut();
    } catch (signInError) {
      if (signInError.code === 'auth/user-not-found') {
        const newAdminCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        await setDoc(doc(db, 'admins', newAdminCredential.user.uid), {
          email: adminEmail,
          role: 'admin',
          createdAt: new Date().toISOString()
        });

        await auth.signOut();
        console.log("Admin user created successfully");
      } else {
        throw signInError;
      }
    }
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log("Admin user already exists");
    } else {
      console.error("Error in admin setup:", error);
    }
  }
};
