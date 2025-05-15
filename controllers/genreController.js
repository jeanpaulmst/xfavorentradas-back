import { nanoid } from 'nanoid';
import axios from 'axios';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { preference } from '../config/mercadopago.js';
import db from '../config/firebase.js';

const obtenerGeneros = async (req, res) => {

}

const crearGenero = async (req, res) => {

}

const modificarGenero = async (req, res) => {

}

const darBajagenero = async (req, res) => {

}

export default {
    obtenerGeneros,
    crearGenero,
    modificarGenero,
    darBajagenero
}