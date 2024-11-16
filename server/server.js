const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    const id = clients.length + 1;
    clients.push({ id, ws });

    console.log(`Client ${id} connected.`);

    // Notify all clients of the updated device list
    const updateClients = () => {
        const devices = clients.map(client => ({ id: client.id }));
        clients.forEach(client => {
            if (client.ws.readyState === WebSocket.OPEN) {
                client.ws.send(JSON.stringify(devices));
            }
        });
    };
    updateClients();

    // Handle incoming messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // Validasi data pesan
            if (data.file && data.fileName && data.deviceId) {
                const targetClient = clients.find(client => client.id === data.deviceId);
                if (targetClient && targetClient.ws.readyState === WebSocket.OPEN) {
                    // Kirim file ke klien tujuan
                    targetClient.ws.send(JSON.stringify({ file: data.file, fileName: data.fileName }));
                    console.log(`File sent from Client ${id} to Client ${data.deviceId}`);
                } else {
                    console.error(`Client ${data.deviceId} not found or disconnected.`);
                }
            } else {
                console.error("Invalid message format received.");
            }
        } catch (error) {
            console.error("Error parsing message:", error.message);
        }
    });

    // Handle disconnection
    ws.on('close', () => {
        clients = clients.filter(client => client.id !== id);
        console.log(`Client ${id} disconnected.`);
        updateClients();
    });
});

// Start the server
server.listen(3000, () => console.log('Server running on http://localhost:3000'));
