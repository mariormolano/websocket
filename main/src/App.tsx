import React, { useState, useEffect } from "react";

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    // Conectamos al servidor WebSocket
    const ws = new WebSocket("ws://localhost:3000");
    setSocket(ws);

    ws.onopen = () => {
      // Al abrir la conexión, registramos la app como 'app_principal'
      ws.send(JSON.stringify({ type: "register", username: "app_principal" }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Si recibimos un código de seguridad del servidor
      if (data.type === "code") {
        setCode(data.code);
      }

      // Si recibimos un mensaje de otra app
      if (data.type === "message") {
        setMessages((prevMessages) => [
          ...prevMessages,
          `Mensaje de ${data.from}: ${data.content}`,
        ]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div>
      <h1>Aplicación Principal</h1>
      <h2>Código de Seguridad</h2>
      <p>{code ? code : "Esperando código..."}</p>
      <h2>Mensajes recibidos</h2>
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;
