// Importamos las librerías necesarias
const express = require("express");
const { WebSocketServer } = require("ws");

// Configuramos el servidor de Express
const app = express();
const port = 3000;

// Creamos un servidor HTTP que usaremos para WebSockets
const server = app.listen(port, () => {
  console.log(`Servidor de WebSockets escuchando en el puerto ${port}`);
});

// Creamos el servidor WebSocket
const wss = new WebSocketServer({ server });

// Mantenemos un mapa de los clientes conectados
const clients = new Map();

// Función para generar un código único (simulación)
//const generateCode = () => Math.random().toString(36).substring(7);
const code = Math.random().toString(36).substring(7);

// Cuando un cliente se conecta al WebSocket
wss.on("connection", (ws) => {
  let clientId = "";

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    // Si el cliente se está registrando
    if (data.type === "register") {
      clientId = data.username;

      // Generamos un código único para este cliente
      //const code = generateCode();

      // Guardamos el cliente junto con el código de seguridad
      clients.set(clientId, { ws, code });
      console.log(`Usuario ${clientId} registrado con código ${code}`);

      // Si el cliente es la app principal, enviamos el código
      if (clientId === "app_principal") {
        ws.send(JSON.stringify({ type: "code", code }));
      }
    }

    // Si el cliente está enviando un mensaje
    if (data.type === "message" && clients.has(data.target)) {
      const targetClient = clients.get(data.target);

      // Verificamos si el código de seguridad coincide
      if (data.code === targetClient.code) {
        targetClient.ws.send(
          JSON.stringify({
            type: "message",
            from: clientId,
            content: data.content,
          })
        );
      } else {
        ws.send(
          JSON.stringify({ type: "error", message: "Código incorrecto" })
        );
      }
    }
  });

  // Al desconectar al cliente
  ws.on("close", () => {
    clients.delete(clientId);
    console.log(`Cliente ${clientId} desconectado`);
  });
});
