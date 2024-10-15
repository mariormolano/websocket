import React, { useState, useEffect } from "react";

const App: React.FC = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [receivedCode, setReceivedCode] = useState("");

  useEffect(() => {
    // Conectamos al servidor WebSocket
    const ws = new WebSocket("ws://localhost:3000");
    setSocket(ws);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // Guardamos el código que recibimos del servidor
      if (data.type === "code") {
        setReceivedCode(data.code);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const registerUser = () => {
    if (socket) {
      // Registramos el usuario enviando su nombre al servidor
      socket.send(
        JSON.stringify({
          type: "register",
          username,
        })
      );
    }
  };

  const sendMessage = () => {
    if (socket && message && code) {
      // Enviamos un mensaje a la app principal junto con el código de seguridad
      socket.send(
        JSON.stringify({
          type: "message",
          target: "app_principal", // Aquí debe estar el nombre del receptor
          content: message,
          code, // Incluimos el código de seguridad en el mensaje
        })
      );
      setMessage("");
    }
  };

  return (
    <div>
      <h1>Aplicación Cliente</h1>
      <div>
        <label>Nombre de usuario:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={registerUser}>Registrar</button>
      </div>

      <div>
        <label>Código de seguridad:</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
      </div>

      <div>
        <label>Mensaje:</label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>

      {receivedCode && <p>Código asignado por el servidor: {receivedCode}</p>}
    </div>
  );
};

export default App;
