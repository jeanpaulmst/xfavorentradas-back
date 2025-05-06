import { nanoid } from 'nanoid';
import axios from 'axios';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { preference } from '../config/mercadopago.js';
import db from '../config/firebase.js';

const NOTIF_URL = process.env.NOTIF_URL

const generarPreferencia = async (req, res) => {
  const { name, place, price, expiration } = req.body;

  try {
    const item_id = nanoid();
    console.log("preference_input_data: ",{ name, place, price, expiration })

    const response = await preference.create({
      body: {
        items: [
          {
            id: item_id,
            title: name,
            quantity: 1,
            unit_price: Number(price),
          }
        ],
        notification_url: NOTIF_URL, //Cambiarlo en producción
        date_of_expiration: expiration
      }
    });

    console.log(response)

    res.json({
      url: response.init_point,
      item_id: response.items[0].id,
      pref_id: response.id,
      state: "activo",
      title: response.items[0].title,
      unit_price: response.items[0].unit_price,
      place: place,
      date_of_expiration: expiration,
      not_modifiable: false
    });

  } catch (e) {
    console.log("Error al crear la preferencia:", e.message);
    res.status(500).json({ error: e.message });
  }
};

const crearEvento = async (req, res) => {
  const event = req.body;
  try {
    await setDoc(doc(db, "events", event.item_id), event);
    res.status(200).json(event);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//Baja logica
const darBajaEvento = async (req, res) => {
  const { eventId } = req.params;
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { state: "inactivo" });
    res.status(200).json({ message: "El evento ha pasado a estado inactivo" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//Baja física
const eliminarEvento = async (req, res) => {
  const { eventId } = req.params;
  try {
    const docRef = doc(db, "events", eventId);
    const collRef = collection(docRef, "assistants");
    const assistantsSnapshot = await getDocs(collRef);

    assistantsSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });

    await deleteDoc(docRef);
    res.status(200).json({ message: "El evento ha sido eliminado correctamente" });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//Modifica el evento guardado en la bd
const modificarEvento = async (req, res) => {
  const eventId = req.params.eventId;
  const { name, place, price, expiration} = req.body;

  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, { title: name, place: place, unit_price: price, date_of_expiration: expiration });
    res.status(200).json({ message: "El evento ha sido modificado correctamente" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

//Modifica la prefenrecia de Mercado Pago
const modificarPreferencia = async (req,res) => {
  const prefId = req.params.preferenceId;
  const { item_id, name, price, expiration } = req.body;

  const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

  try {
    const body = {
      items: [
        {
          id: item_id,
          title: name,
          quantity: 1,
          unit_price: Number(price) 
        }
      ],
      date_of_expiration: expiration
    };

    const headers = {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    };

    const response = await axios.put(
      `https://api.mercadopago.com/checkout/preferences/${prefId}`,
      body,
      { headers }
    );

    res.status(200).json(response.data); // devolvés la respuesta de MP al frontend

  } catch (error) {
    console.error('Error al modificar la preferencia:', error.response?.data || error.message);
    res.status(500).json({ error: 'No se pudo modificar la preferencia' });
  }
};


const obtenerEventos = async (req, res) => {
  let events = [];
  try {
    const q = query(collection(db, "events"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      events.push(doc.data());
    });
    res.status(200).json(events);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

const obtenerEvento = async (req, res) => {
  const { eventId } = req.params;

  try {
    const eventRef = doc(db, "events", eventId.trim());
    const eventSnap = await getDoc(eventRef);

    if (!eventSnap.exists()) {
      res.status(404).json({ error: "No existe el evento" });
    } else {
      res.status(200).json(eventSnap.data());
    }

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export default {
  generarPreferencia,
  crearEvento,
  darBajaEvento,
  eliminarEvento,
  modificarEvento,
  modificarPreferencia,
  obtenerEventos,
  obtenerEvento
};
