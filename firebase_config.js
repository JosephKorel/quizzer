import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAu94vQK5bWyuVsrPO9_qRYdr_iSAhaqC4",
  authDomain: "ezstudy-k.firebaseapp.com",
  projectId: "ezstudy-k",
  storageBucket: "ezstudy-k.appspot.com",
  messagingSenderId: "494904537547",
  appId: "1:494904537547:web:059f9e77609445dd45464e",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
