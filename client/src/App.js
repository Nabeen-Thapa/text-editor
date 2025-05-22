import React, { useEffect, useState, useRef } from 'react';
import './App.css';

function App() {
  const [document, setDocument] = useState("");
  const [socket, setSocket] = useState(null);
  const [chunks, setChunks] = useState([]);
  const textareaRef = useRef(null);
  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:4000');
    setSocket(newSocket);

    newSocket.onopen = () => {
      console.log("connection stablish");
    };

    newSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'init') {
          setChunks(message.data);
          setDocument(message.data.join(''));//join chunks
        }

        //When another user updates a part (chunk  
        else if (message.type === 'update') {
          const { index, data } = message;
          setChunks(prevChunks => {
            const updatedChunks = [...prevChunks];
            updatedChunks[index] = data;
            setDocument(updatedChunks.join(''));
            return updatedChunks;
          });

        }
      } catch (error) {
        console.log("error:", error);
      }
    };
    newSocket.onclose = () => {
      console.log("connection closed");
    };

    newSocket.onerror = (error) => {
      console.error("web socket error:", error);
    };
    return () => {
      newSocket.close();
    };
  }, []);

  const handdleChange = (e) => {
    const newDocument = e.target.value;
    const newChunks = newDocument.match(/.{1,1000}/gs) || [];
    // Compare each chunk with existing chunks and send only changed ones if changes
    newChunks.forEach((chunk, i) => {
      if (chunk !== chunks[i]) {
        socket?.send(JSON.stringify({
          type: 'chunk_update',
          index: i,
          data: chunk
        }));
      }
    });

    if (newChunks.length < chunks.length) {
      // Send empty updates for deleted chunks
      for (let i = newChunks.length; i < chunks.length; i++) {
        socket?.send(JSON.stringify({
          type: 'chunk_update',
          index: i,
          data: ''
        }));
      }
    }
    setChunks(newChunks);
    setDocument(newDocument);

  };
  const handleCopyAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      navigator.clipboard.writeText(textareaRef.current.value)

        .catch(err => alert('Failed to copy text: ' + err));
    }
  };
  return (
    <div className='App'>
      <h1>collaborative editor</h1>
      <button className="copy-btn" type="submit" onClick={handleCopyAll}>copy all</button>
      <textarea
        value={document}
        ref={textareaRef}
        onChange={handdleChange}
        rows="20"
        cols="80" />
    </div>
  );
}

export default App;
