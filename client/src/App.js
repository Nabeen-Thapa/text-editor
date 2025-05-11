import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
 const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(()=>{
    const newSocket = new WebSocket('ws://localhost:4000');
    setSocket(newSocket);

    newSocket.onopen=()=>{
      console.log("connection stablish");
    };

    newSocket.onmessage=(event)=>{
      try {
        const message = JSON.parse(event.data);
        if(message.type === 'init') setDocument(message.data);
        else if(message.type === 'update') setDocument(message.data);
      } catch (error) {
        console.log("error:", error);
      }
    };
    newSocket.onclose=()=>{
      console.log("connection closed");
    };

    newSocket.onerror= (error)=>{
      console.error("web socket error:", error);
    };
    return ()=>{
      newSocket.close();
    };
  },[]);

  const handdleChange = (e)=>{
    const newDocument = e.target.value;
    setDocument(newDocument);
    if(socket && socket.readyState === WebSocket.OPEN){
      socket.send(JSON.stringify({type: 'update', data: newDocument}));
    }
  };
  return (
    <div className='App'>
      <h1>collaborative editor</h1>
      <textarea
      value={document}
      onChange={handdleChange}
      rows="20"
      cols="80"/>
    </div>
  );
}

export default App;
