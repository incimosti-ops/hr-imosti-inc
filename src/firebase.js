// Import Firebase core
import { initializeApp } from "firebase/app";

// (Optional but recommended services)
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyAZdmQHOU7griTeCspyQi91W5G70PxHJUY",
  authDomain: "hrimosti.firebaseapp.com",
  projectId: "hrimosti",
  storageBucket: "hrimosti.firebasestorage.app",
  messagingSenderId: "383650058255",
  appId: "1:383650058255:web:3be33953a2c4ed330a937a",
  measurementId: "G-LJEHGJV644"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;