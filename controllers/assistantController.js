import axios from 'axios';
import db from '../config/firebase.js'; // Ajusta si es necesario
import { collection, query, where, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';

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
    console.log("Error al obtener pago")
    throw error;
  }
}

// Webhook de MercadoPago
export const recibirWebhook = async (req, res) => {
  
  const topic = req.body.type; 
  if (topic !== "payment") {
    console.log("Webhook ignorado (no es de tipo 'payment')");
    return res.status(200).json({ message: "Webhook ignorado" });
  }

  console.log("Webhook recibido: ", req.body);

  const paymentId = parseInt(req.body.data.id);
  console.log("ID de pago:", paymentId);
  
  // Aceptar solo webhooks relacionados con pagos
  const isPaymentWebhook = 
  req.body?.type === "payment" || 
  req.body?.topic === "payment" || 
  req.body?.action === "payment.created";

  if (!isPaymentWebhook) {
    console.log("Webhook ignorado. Tipo no es 'payment'.");
    return res.status(200).json({ message: "Webhook ignorado" });
  }

  try {
    console.log("---ENTRE AL TRY---")

    //Obtener nombre del cleinte y id de la preferencia del pago recibido
    const paymentData = await getPaymentData(paymentId);

    const preferenceId = paymentData.additional_info.items[0].id;
    console.log("ID de preferencia:", preferenceId);

    const firstName = paymentData.payer.first_name;
    const lastName = paymentData.payer.last_name;

    let clientName;

    if(firstName === null & lastName === null){
      clientName = "Sin nombre";
    }else{
      clientName = firstName + ' ' + lastName;
    }
    
    console.log("Nombre del cliente:", clientName);
 
    //Guardar datos del cliente en el evento en la base de datos
    const eventsCollRef = collection(db, "events");
    const eventDoc = doc(eventsCollRef, preferenceId);

    console.log("Evento encontrado:", eventDoc);

    const eventRef = doc(db, "events", eventDoc.id);

    //Evento deja de ser modificable
    await updateDoc(eventRef, { not_modifiable: true });

    const assistantRef = collection(db, "events", eventDoc.id, "assistants");
    const assistantDocRef = doc(assistantRef, paymentId.toString()); 
    const assistantData = { name: clientName }; 

    await setDoc(assistantDocRef, assistantData);

    res.status(200).json({ message: "Asistente registrado", id: preferenceId });

  } catch (error) {
    console.log("Error en la solicitud:", "error");
    res.status(500).json({ error: "error.message" });
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
