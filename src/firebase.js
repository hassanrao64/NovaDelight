// firebase.js
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// 🔹 Firebase Config from .env
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,


  
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);

// 🔹 Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// ----------------------------------------------------
// ✅ USER FUNCTIONS
// ----------------------------------------------------

// 🔹 Sign Up New User
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Sign Up Error:", error.code, error.message);
    throw error;
  }
};

// 🔹 Sign In Existing User
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Login Error:", error.code, error.message);
    throw error;
  }
};

// 🔹 Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

// 🔹 Auth State Listener (for auto login check)
export const listenAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// 🔹 Refresh Firebase Auth Session
export const refreshFirebaseAuthSession = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      // Get a fresh token
      await user.getIdToken(true);
      console.log("Auth session refreshed successfully");
      return true;
    } else {
      console.log("No user logged in");
      return false;
    }
  } catch (error) {
    console.error("Error refreshing auth session:", error);
    return false;
  }
};

// 🔹 Create Admin User (for setup purposes)
export const createAdminUser = async () => {
  try {
    // This is a placeholder function - implement actual admin creation logic as needed
    console.log("Admin user creation requested");
    return true;
  } catch (error) {
    console.error("Error creating admin user:", error);
    throw error;
  }
};
