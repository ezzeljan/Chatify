import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyBd4LuzCnlJ4btfGWw9rkwwncXKajMG5WM",
  authDomain: "appdev-86a96.firebaseapp.com",
  databaseURL: "https://appdev-86a96-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "appdev-86a96",
  storageBucket: "appdev-86a96.appspot.com",
  messagingSenderId: "808437266046",
  appId: "1:808437266046:web:7926787aef998b7d19ca2f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app); // Initialize and export Firebase Storage
