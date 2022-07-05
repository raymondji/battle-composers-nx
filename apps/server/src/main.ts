/**
 * This is not a production server yet!
 * This is only a minimal server to get started.
 */

import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('connected');
  ws.on('message', function message(data) {
    console.log('Server received data', data);
    const message = JSON.parse(data.toString());
    console.log('Server parsed message', message);

    switch (message.type) {
      case 'join':
        if (!message.roomId) {
          console.error('Invalid join message', message);
          const msg = {
            type: 'error',
            error: 'Invalid join message',
          };
          ws.send(JSON.stringify(msg));
          return;
        }
        joinRoom(message.roomId, ws);
        break;
      case 'ready':
        if (!message.roomId || !message.playerId || !message.composerIndex) {
          const msg = {
            type: 'error',
            error: 'Invalid ready message',
          };
          ws.send(JSON.stringify(msg));
          return;
        }
        readyToBattle(
          message.roomId,
          message.playerId,
          message.composerIndex,
          ws
        );
        break;
      case 'forwardInputs':
        forwardInputs(
          message.roomId,
          message.localPlayerId,
          message.keysDown,
          message.frame,
          ws
        );
        break;
      default:
        console.error('Unhandled message type', message);
    }
  });

  ws.on('close', (data) => {
    console.log('Server received close');
  });
});

const rooms = new Map();

function joinRoom(roomId: string, ws: WebSocket) {
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

  room.clients.push(ws);
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

function readyToBattle(
  roomId: string,
  playerId: string,
  composerKey: string,
  ws: WebSocket
) {
  const room = rooms.get(roomId);
  if (room.clients.length !== 2) {
    console.log('Error, room is not full', roomId);
    return;
  }

  room.composers.set(playerId, composerKey);
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

function forwardInputs(
  roomId: string,
  playerId: string,
  keysDown,
  frame: number,
  ws: WebSocket
) {
  const room = rooms.get(roomId);
  if (room.clients.length !== 2) {
    console.log('Error, room is not full', roomId);
    return;
  }

  room.clients.forEach((client) => {
    if (client === ws) {
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
