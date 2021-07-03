import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import firebaseConfig from "./firebaseConfig";


const init = firebase.initializeApp(firebaseConfig);
export const auth = init.auth();
export const db = init.database();