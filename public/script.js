const socket = new WebSocket('ws://localhost:3000');

const devicesContainer = document.getElementById('devices');
const fileInput = document.getElementById('fileInput');

// Detect devices and update UI
socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);

    // Jika menerima daftar perangkat
    if (Array.isArray(data)) {
        devicesContainer.innerHTML = '';
        if (data.length === 0) {
            devicesContainer.innerHTML = '<p>No devices found. Waiting for connections...</p>';
        } else {
            data.forEach(device => {
                const deviceElement = document.createElement('div');
                deviceElement.className = 'device';
                deviceElement.textContent = `Device ${device.id}`;
                deviceElement.addEventListener('click', () => sendFile(device.id));
                devicesContainer.appendChild(deviceElement);
            });
        }
    } 
    // Jika menerima file
    else if (data.file && data.fileName) {
        receiveFile(data.file, data.fileName);
    }
});

// Handle file selection and send to server
function sendFile(deviceId) {
    fileInput.click();
    fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                socket.send(JSON.stringify({ deviceId, file: reader.result, fileName: file.name }));
            };
            reader.readAsDataURL(file);
        }
    };
}

// Handle file reception
function receiveFile(fileData, fileName) {
    const link = document.createElement('a');
    link.href = fileData;
    link.download = fileName;
    link.textContent = `Download ${fileName}`;
    link.style.display = 'block';
    document.body.appendChild(link);
}
