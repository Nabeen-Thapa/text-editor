import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

export class SocketManager {
    private wss: WebSocketServer;
    private documentChunks: string[] = [];

    constructor(server: http.Server) {
        this.wss = new WebSocketServer({ server });
        this.setupConnectionHandlers();
    }

    private setupConnectionHandlers() {

        //this will run if new user added
        this.wss.on('connection', (ws) => {
            console.log("New client connected");
            this.handleInitialConnection(ws);//Sends the current document to the new client.

            //this will run if user write something
            ws.on('message', (message) => this.handleMessage(ws, message));
            ws.on('close', () => console.log("Client disconnected"));
        });
    }

    private handleInitialConnection(ws: WebSocket) {
        //view prevous corrent content to user
        ws.send(JSON.stringify({ 
            type: 'init', 
            data: this.documentChunks 
        }));
    }

    private broadcastChunksUpdate(index:number, data: string){
        this.wss.clients.forEach((client)=>{
            if(client.readyState === WebSocket.OPEN){
                client.send(JSON.stringify({
                    type: "update",
                    index,
                     data
                }))
            }
        })
    }

    private handleMessage(ws: WebSocket, message: any) {
        try {
            
            //Processes incoming messages from clients
            const parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.type === 'chunk_update') {
                const {index, data }= parsedMessage;
                this.documentChunks[index]= data;
                this.broadcastChunksUpdate(index, data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }

    private broadcastUpdate() {
        //send updated content to connected users
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ 
                    type: 'update', 
                    data: this.documentChunks 
                }));
            }
        });
    }
}