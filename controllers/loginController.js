import { nanoid } from 'nanoid';
import axios from 'axios';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { preference } from '../config/mercadopago.js';
import firebase from '../config/firebase.js';
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail  } from "firebase/auth";

const login = async (req, res) => {

    const { email, password } = req.body;

    const auth = getAuth(firebase.appFirebase);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        const user = userCredential.user;

        res.status(200).json(user);
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}

const resetPassword = async (req, res) => {
    const { email } = req.body;
    const auth = getAuth(firebase.appFirebase);

    try {
        
        await sendPasswordResetEmail(auth, email);
        res.status(200).json({ message: "Password reset email sent" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const test = async (req, res) => {
    res.status(200).json({ message: "Login test" });
}

export default { login, test, resetPassword }; 