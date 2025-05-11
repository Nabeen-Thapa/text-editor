import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

export class SocketManager {
    private wss: WebSocketServer;
    private document: string = "";

    constructor(server: http.Server) {
        this.wss = new WebSocketServer({ server });
        this.setupConnectionHandlers();
    }

    private setupConnectionHandlers() {
        this.wss.on('connection', (ws) => {
            console.log("New client connected");
            this.handleInitialConnection(ws);
            
            ws.on('message', (message) => this.handleMessage(ws, message));
            ws.on('close', () => console.log("Client disconnected"));
        });
    }

    private handleInitialConnection(ws: WebSocket) {
        ws.send(JSON.stringify({ 
            type: 'init', 
            data: this.document 
        }));
    }

    private handleMessage(ws: WebSocket, message: any) {
        try {
            const parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.type === 'update') {
                this.document = parsedMessage.data;
                this.broadcastUpdate();
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    private broadcastUpdate() {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                    type: 'update', 
                    data: this.document 
                }));
            }
        });
    }
}