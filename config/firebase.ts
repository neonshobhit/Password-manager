import * as admin from 'firebase-admin';
import serviceAccount from './passwords.json';
const s: Object = serviceAccount;

let firebaseConfig: Object = {
    apiKey: "AIzaSyCg4LLmoKCGn_PSkqdqUrjAT1nlSQ4J9-E",
    authDomain: "passwords-aefdd.firebaseapp.com",
    projectId: "passwords-aefdd",
    storageBucket: "passwords-aefdd.appspot.com",
    messagingSenderId: "287441201494",
    appId: "1:287441201494:web:ff8b17e66f4cc875f04ef7",
    measurementId: "G-FQH1N5TD81",
    credential: admin.credential.cert(s)
};

// Initialize Firebase
admin.initializeApp(firebaseConfig);

export default admin;