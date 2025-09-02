// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAnjUSbEUkd9DxbfAK19TuCjceUzbLCvXw",
  authDomain: "seltest-51511.firebaseapp.com",
  projectId: "seltest-51511",
  storageBucket: "seltest-51511.firebasestorage.app",
  messagingSenderId: "960734737998",
  appId: "1:960734737998:web:2b5c6fa06c6baa896b751f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app);
export {db, storage}