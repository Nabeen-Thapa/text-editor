"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var http_1 = require("http");
var ws_1 = require("ws");
var cors_1 = require("cors");
var app = (0, express_1.default)();
app.use((0, cors_1.default)());
var server = http_1.default.createServer(app);
var wss = new ws_1.WebSocketServer({ server: server });
var document = "";
wss.on('connection', function (ws) {
    console.log("New client connected");
    ws.send(JSON.stringify({ type: 'init', data: document }));
    ws.on('message', function (message) {
        try {
            var parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.type === 'update') {
                document = parsedMessage.data;
                wss.clients.forEach(function (client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ type: 'update', data: document }));
                    }
                });
            }
        }
        catch (error) {
            console.error("Error:", error);
        }
    });
    ws.on('close', function () {
        console.log("Client disconnected");
    });
});
var PORT = process.env.PORT || 4000;
server.listen(PORT, function () {
    console.log("Server is running on port ".concat(PORT));
});
