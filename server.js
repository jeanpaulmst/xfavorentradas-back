import express, { response } from 'express';
import axios from "axios";
import cors from "cors";
import { MercadoPagoConfig, Preference } from 'mercadopago';
import mercadopago from 'mercadopago';
import { nanoid } from 'nanoid';
import { initializeApp } from "firebase/app";
import { collection, getFirestore, doc, setDoc, query, where, getDocs, updateDoc } from "firebase/firestore";

import fs from 'fs';
const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));


const appFirebase = initializeApp(config.firebaseConfig);
const db = getFirestore(appFirebase);

const app = express();
app.use(express.json());

app.use(cors({
  origin: '*', // Permite cualquier origen
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'] // Headers permitidos
}));

const client = new MercadoPagoConfig({ accessToken: config.MP_ACCESS_TOKEN });
const preference = new Preference(client);
const PORT = 8080

app.get("/", (req, res) => {
  res.send("Servidor corriendo correctamente 🚀");
});


//Crear preferencia -- Llamada por el ABM de Evento
app.post("/generar-preferencia/:name/:place/:price", async (req, res) => {
  
  const { name, place, price } = req.params;

  try {
    const preference_id = nanoid(); 

    //Crear preferencia en MP
    const response = await preference.create({
      body: {
        items: [
          {
            id : preference_id,
            title: name,
            quantity: 1,
            unit_price: Number(price)
          }
        ]
      }
    });

    res.json( { url : response.init_point,
                id : response.items[0].id,
                state : "activo",
                title : response.items[0].title,
                unit_price : response.items[0].unit_price,
                place : place
    });

  } catch (error) {
    console.error("Error al crear preferencia:", error);
    res.status(500).json({ error: "Error al crear la preferencia" });
  }

});

app.post("/crear-evento", async (req, res) => {

  const event = req.body;

  //Crear evento en la BD
  try{

    await setDoc(doc(db, "events", event.title), event);

    const asistentesRef = doc(collection(db, "events", event.title, "assistants"));
    await setDoc(asistentesRef, { placeholder: true });
    res.status(200).json(event)

  }catch(e){
    console.error("Error al crear evento: ", e)
  }

});

app.post("/dar-baja-evento", async (req, res) => {

  const { eventName } = req.body;

  try{
    const eventRef = doc(db, "events", eventName);
    await setDoc(eventRef, { state: "inactivo" }, { merge: true });
    res.status(200).json({ message: "El evento ha pasado a estado inactivo" });
  }catch(e){
    console.error("Error al eliminar evento: ", e)
  }

});

app.post("eliminar-evento", async (req, res) => {
  
    const { eventName } = req.body;
  
    try{
      const docRef = doc(db, "events", eventName);
      const collRef = collection(docRef, "assistants");
      const assistantsSnapshot = await getDocs(collRef);

      assistantsSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      await deleteDoc(docRef);

      res.status(200).json({ message: "El evento ha sido eliminado correctamente" });
      
    }catch(e){
      console.error("Error al eliminar evento: ", e)
    }

});

app.post("/modificar-evento", async (req, res) => {

  const { eventToModifyName, eventName, eventPlace} = req.body;

  console.log("evento a modificar", eventToModifyName)
  console.log("nombre nuevo", eventName)
  console.log("Lugar nuevo: ",eventPlace)
  
  try{

    const eventRef = doc(db, "events", eventToModifyName)

    await updateDoc(eventRef, {title: eventName, place: eventPlace});
    
    res.status(200).json({ message: "El evento ha sido modificado correctamente" });

  }catch(e){
    console.error("Error al modificar evento: ", e)
  }

});


//Obtiene los eventos activos
app.get("/obtenerEventos", async (req, res) => {

  let events = [];
  try{
    const q = query(collection(db, "events"));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      events.push(doc.data());
    });
    res.status(200).json(events);
  }catch(e){
    console.error("Error al obtener eventos: ", e)
  }
  
});


//Obtiene datos de pago realizdo, usado por el webhook
async function getPaymentData(payment_id) {

  try { 
      const response = await axios.get(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ACCESS_TOKEN}`
        }
        
      })
      return response.data; // Aquí obtienes los datos del pago

  } catch (error) {
      console.error('Error al obtener el cliente:', error);
      return error
  }
}


//llamada de webhook, MP envía una solicitud a mi sistema, mi sistema lo recibe con este post
//El webhook me debe enviar 
app.post('/webhook', async (req, res) => {
  console.log('📩 Webhook recibido:', req.body);

  const paymentId = req.body.id //Id del pago notificado

  try {
    //let paymentData = await getPaymentData('105118577079'); //-- ID-placeholder: '105118577079'
    //console.log("###### HOLA ###### :", paymentData)
    
    //PLACEHOLDER - SACAR EN PRODUCCIÓN
    let paymentData = { payer: {first_name: 'Juan', last_name: 'Perez'}, additional_info: {items : {id: '33YSTrlafVRuHfjP5N2E0'}}}

    const preferenceId = paymentData.additional_info.items.id;
    const clientName = paymentData.payer.first_name + ' ' + paymentData.payer.last_name;


    //TO DO: conectarse con la base de datos y registrar el pago

    // Buscar el evento cn la collection "events" que tenga el mismo id que el de la preferencia 
    const eventsCollRef = collection(db, "events");
    const q = query(eventsCollRef, where("id", "==", preferenceId));
    const querySnapshot = await getDocs(q);
    const eventDoc = querySnapshot.docs[0];
    const eventRef = doc(db, "events", eventDoc.id);

    // Guardar el asistente, con nombre del paymentData y con el nombre del doc como el Payment id
    // Referencia a la subcolección 'assistants' dentro del evento
    const assistantRef = doc(eventRef, "assistants", preferenceId); 
    const assistantData = { name: clientName }; 

    await setDoc(assistantRef, assistantData);  

    console.log("paymentData: ", preferenceId)
    
    res.status(200).json(preferenceId);

  } catch (error) {
    console.error("Error en la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

//Obtener los asistentes de un evento
app.get("/getAssistants/:eventName", async (req, res) => {

  const { eventName } = req.params

  try{
    const eventRef  = doc(db, "events", eventName)
    const assistantsCollRef = collection(eventRef, "assistants"); 

    const assistantsSnapshot = await getDocs(assistantsCollRef); 
    const assistants = assistantsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log("Asistentes:", assistants);
    res.status(200).json(assistants)
  }catch(e){
    console.error("Error buscando asistentes: ", e)
  }
});

//Solo para probar el funcionamiento correcto de obtenerCliente. Si hacia la prueba con el webhook de mp me daba un error
//porque no encontraba el pago con el id especificado
app.get("/getUser", async (req, res) => {
  
  try {
    const response = await getPaymentData('104471046675'); 
    console.log(response);

    console.log("preference_id: ", response.additional_info.items.id)
    console.log("username: ", response.payer.first_name + ' ' + response.payer.last_name)

    res.json(response);
  } catch (error) {
    console.error("Error en la solicitud:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
  
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});