"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.vapidKey = exports.db = exports.auth = void 0;
// Import the functions you need from the SDKs you need
const app_1 = require("firebase/app");
const auth_1 = require("firebase/auth");
const firestore_1 = require("firebase/firestore");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const firebaseConfig = {
    apiKey: "AIzaSyCxY6lyiIsoP6iFXXN-0EfHXPmqO98V7Z8",
    authDomain: "careersupport-33838.firebaseapp.com",
    projectId: "careersupport-33838",
    storageBucket: "careersupport-33838.firebasestorage.app",
    messagingSenderId: "303152535810",
    appId: "1:303152535810:web:beb93764a5e562283fca1b",
    measurementId: "G-MCGT2RVL2E"
};
// Initialize Firebase
const app = (0, app_1.initializeApp)(firebaseConfig);
exports.auth = (0, auth_1.getAuth)(app);
exports.db = (0, firestore_1.getFirestore)(app);
exports.vapidKey = process.env.FIREBASE_VAPID_KEY || "";
