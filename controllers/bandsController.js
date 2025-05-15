import { nanoid } from 'nanoid';
import axios from 'axios';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { preference } from '../config/mercadopago.js';
import db from '../config/firebase.js';

// FUNCIÓN DE PLACEHOLDER
const obtenerBandas = async (req, res) => {
    try {
        
        res.status(200).json({bands: ["Lista de bandas"]});
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

const crearBanda = async (req, res) => {

    const { bandData } = req.body;
    const bandId = nanoid(4);

    //Validar que exista por lo menos un Genero creado
    try {

        res.status(200).json({ message: `Band created with id ${bandId} successfully`, bandData: bandData });
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}

const modificarBanda = async (req, res) => {

    const { bandData } = req.body;
    const { bandId } = req.params;

    
    try {

        res.status(200).json({ message: `Band with id ${bandId} modified with info successfully`, bandData: bandData });
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}

const darBajabanda = async (req, res) => {

    const { bandId } = req.params;

    try {
        res.status(200).json({ message: `Band with id ${bandId} deleted successfully` });
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}

const obtenerGeneros = async (req, res) => {


}

const crearGenero = async (req, res) => {

    const { generoData } = req.body;
    const generoId = nanoid(4);

    try {

        res.status(200).json({ message: `Genero created with id ${generoId} successfully`, generoData: generoData });
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}

const modificarGenero = async (req, res) => {

}

const darBajaGenero = async (req, res) => {

}


export default { 
    obtenerBandas, 
    crearBanda, 
    modificarBanda, 
    darBajabanda,
    obtenerGeneros,
    crearGenero,
    modificarGenero,
    darBajaGenero

}; 