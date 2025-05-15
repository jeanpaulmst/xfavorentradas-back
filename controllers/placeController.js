import { nanoid } from 'nanoid';
import axios from 'axios';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { preference } from '../config/mercadopago.js';
import db from '../config/firebase.js';

// FUNCIÓN DE PLACEHOLDER
const obtenerLugares = async (req, res) => {

    const places = await getDocs(query(collection(db, "places"), where("termination_date", "==", null)));

    if(places.empty){
        return res.status(404).json({ error: "No hay lugares disponibles" });
    }

    for(i = 0; i < places.docs.length; i++){
        const place = places.docs[i];
        const placeData = place.data();
        const placeId = place.id;

        //agregar el id al objeto
        placeData.id = placeId;
    }

    try {
        
        res.status(200).json({places: ["Lista de Lugares"]});
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

const crearLugar = async (req, res) => {

    const { placeData } = req.body;
    const placeId = nanoid(4);

    try {

        res.status(200).json({ message: `Place created with id ${placeId} successfully`, placeData: placeData });
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}

const modificarLugar = async (req, res) => {

    const { placeData } = req.body;
    const { placeId } = req.params;

    try {

        res.status(200).json({ message: `Place with id ${placeId} modified with info successfully`, placeData: placeData });
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}

const darBajaLugar = async (req, res) => {

    const { bandId } = req.params;

    //verificar que no existe ningún evento activo asociado al lugar


    try {
        res.status(200).json({ message: `Band with id ${bandId} deleted successfully` });
    }catch(e){
        res.status(500).json({ error: e.message });
    }

}


export default { obtenerLugares, crearLugar, modificarLugar, darBajaLugar }; 