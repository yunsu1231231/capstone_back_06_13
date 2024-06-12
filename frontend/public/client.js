const WebSocket = require('websocket').client;

const client = new WebSocket();

client.on('connectFailed', (error) => {
  console.error('WebSocket connection failed:', error);
});

client.on('connect', (connection) => {
  console.log('WebSocket client connected');

  connection.on('error', (error) => {
    console.error('Connection error:', error);
  });

  connection.on('close', () => {
    console.log('WebSocket connection closed');
  });

  connection.on('message', (message) => {
    if (message.type === 'utf8') {
      console.log('Received message:', message.utf8Data);
    }
  });

  // 테스트를 위해 메시지 전송
  connection.sendUTF(JSON.stringify({
    type: 'chat',
    receiver: 'receiver_id_here',  // 메시지를 받을 클라이언트 ID
    content: 'Hello, WebSocket server!',
  }));
});

client.connect('ws://localhost:3000');  // 서버의 WebSocket 주소

