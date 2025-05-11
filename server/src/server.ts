import express from 'express';
import http from 'http';
import cors from 'cors';
import { SocketManager } from './secket/socketManager';

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize WebSocket server
new SocketManager(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});