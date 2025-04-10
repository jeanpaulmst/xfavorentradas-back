import axios from 'axios';
import db from '../config/firebase.js'; // Ajusta si es necesario
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';

const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

// Obtener datos de pago desde MercadoPago
async function getPaymentData(payment_id) {
  try {
    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener el pago:', error);
    throw error;
  }
}

// Webhook de MercadoPago
export const recibirWebhook = async (req, res) => {
  const paymentId = req.body.id;

  try {
    const paymentData = await getPaymentData(paymentId);

    const preferenceId = paymentData.additional_info.items.id;
    const clientName = `${paymentData.payer.first_name} ${paymentData.payer.last_name}`;

    const eventsCollRef = collection(db, "events");
    const q = query(eventsCollRef, where("id", "==", preferenceId));
    const querySnapshot = await getDocs(q);
    const eventDoc = querySnapshot.docs[0];

    if (!eventDoc) {
      return res.status(404).json({ error: "Evento no encontrado" });
    }

    const eventRef = doc(db, "events", eventDoc.id);
    const assistantRef = doc(eventRef, "assistants", paymentId); 
    const assistantData = { name: clientName }; 

    await setDoc(assistantRef, assistantData);

    res.status(200).json({ message: "Asistente registrado", id: preferenceId });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener asistentes de un evento
export const obtenerAsistentes = async (req, res) => {
  const { eventId } = req.params;

  try {
    const eventRef = doc(db, "events", eventId);
    const assistantsCollRef = collection(eventRef, "assistants");

    const assistantsSnapshot = await getDocs(assistantsCollRef);
    const assistants = assistantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json(assistants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Solo para pruebas
export const obtenerDatosPago = async (req, res) => {
  try {
    const response = await getPaymentData('104471046675');

    console.log("preference_id: ", response.additional_info.items.id);
    console.log("username: ", response.payer.first_name + ' ' + response.payer.last_name);

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
    recibirWebhook,
    obtenerAsistentes,
    obtenerDatosPago
}
