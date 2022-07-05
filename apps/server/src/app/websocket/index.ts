import { Server } from 'http';
import * as ws from 'ws';

export function setupWebsocket(server: Server) {
  const socket = new ws.Server({ server: server, path: '/ws' });
  console.log('WebSocket server started');

  socket.on('connection', (conn) => {
    console.log('Server received connection');
    // function broadcast(data) {
    // 	socket.clients.forEach((client) => {
    // 		if (client !== conn && client.readyState === ws.OPEN) {
    // 			client.send(data);
    // 		}
    // 	});
    // }

    conn.on('message', (data) => {
      const message = JSON.parse(data.toString());
      console.log('Server received message', message);

      switch (message.type) {
        case 'join':
          joinRoom(message.roomId, conn);
          break;
        case 'ready':
          readyToBattle(
            message.roomId,
            message.playerId,
            message.composerIndex,
            conn
          );
          break;
        case 'forwardInputs':
          forwardInputs(
            message.roomId,
            message.localPlayerId,
            message.keysDown,
            message.frame,
            conn
          );
          break;
        default:
          console.error('Unhandled message type', message);
      }
    });

    conn.on('close', (data) => {
      console.log('Server received close');
    });
  });
}

const rooms = new Map();

function joinRoom(roomId, conn) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      clients: [],
      composers: new Map(),
    });
  }
  const room = rooms.get(roomId);

  if (room.clients.length > 1) {
    console.log('Error, 3rd participant trying to join room', roomId);
    return;
  }

  room.clients.push(conn);
  console.log('Room # participants: ', room.clients.length, roomId);
  if (room.clients.length == 2) {
    room.clients.forEach((client) => {
      const msg = {
        type: 'allJoined',
      };

      client.send(JSON.stringify(msg));
    });
  }
}

function readyToBattle(roomId, playerId, composerIndex, conn) {
  const room = rooms.get(roomId);
  if (room.clients.length !== 2) {
    console.log('Error, room is not full', roomId);
    return;
  }

  room.composers.set(playerId, composerIndex);
  if (room.composers.size === 2) {
    room.clients.forEach((client) => {
      const msg = {
        type: 'startBattle',
        p1ComposerIndex: room.composers.get('P1'),
        p2ComposerIndex: room.composers.get('P2'),
      };

      client.send(JSON.stringify(msg));
    });
  }
}

function forwardInputs(roomId, playerId, keysDown, frame, conn) {
  const room = rooms.get(roomId);
  if (room.clients.length !== 2) {
    console.log('Error, room is not full', roomId);
    return;
  }

  room.clients.forEach((client) => {
    if (client === conn) {
      return;
    }
    const msg = {
      type: 'remoteInputs',
      playerId,
      keysDown,
      frame,
    };
    client.send(JSON.stringify(msg));
  });
}
