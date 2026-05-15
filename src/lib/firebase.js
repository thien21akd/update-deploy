import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB4a8xDb0hHjO8NsqklLxyLO0x6W1H59Go",
  authDomain: "learn-flow-a954f.firebaseapp.com",
  databaseURL:
    "https://learn-flow-a954f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "learn-flow-a954f",
  storageBucket: "learn-flow-a954f.firebasestorage.app",
  messagingSenderId: "81106421445",
  appId: "1:81106421445:web:777092424ac91939b9d2ac",
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "databaseURL",
  "projectId",
  "appId",
];
const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missingKeys.length) {
  // Keep the app bootable in dev while surfacing a clear setup issue.
  console.warn(`Firebase config is missing: ${missingKeys.join(", ")}`);
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export { app };
