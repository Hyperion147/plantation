import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCVVu2mxf6S7KOE1T4e4AHwg0Qz8oRs1SU",
  authDomain: "plantation-501.firebaseapp.com",
  projectId: "plantation-501",
  storageBucket: "plantation-501.firebasestorage.app",
  messagingSenderId: "235908757329",
  appId: "1:235908757329:web:332074564b7084eb0a4570",
  measurementId: "G-NV3XNDM5GW"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();