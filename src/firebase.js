import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDicVCPXh3CQmQR5ELRSafEMCQcmKBNYmI",
    authDomain: "irshad-portfolio-c3009.firebaseapp.com",
    databaseURL: "https://irshad-portfolio-c3009-default-rtdb.firebaseio.com",
    projectId: "irshad-portfolio-c3009",
    storageBucket: "irshad-portfolio-c3009.firebasestorage.app",
    messagingSenderId: "742027853978",
    appId: "1:742027853978:web:bd13d2ac17a5d753275f23"
};

const app = initializeApp(firebaseConfig);

export const rtdb = getDatabase(app);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;