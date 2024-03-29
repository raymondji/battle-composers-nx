import { PlayerInputs } from '@battle-composers-nx/gameplay';
import { CharacterKeys } from 'libs/gameplay/src/lib/characters';
import { PlayerId } from 'libs/gameplay/src/lib/engine';
import { environment } from '../environments/environment';
import React, { useState, useContext, useEffect } from 'react';
import { getOpponent } from 'libs/gameplay/src/lib/player/definitions';

interface Multiplayer {
  joinRoom: (roomId: string, player: PlayerId) => void;
  setReady: (character: CharacterKeys) => void;
  sendInputs: (inputs: PlayerInputs) => void;
  setRemoteInputListener: (callback: PlayerInputsListener) => void;
  localPlayerId: PlayerId | undefined;
  remotePlayerId: PlayerId | undefined;
  p1Character: CharacterKeys | undefined;
  p2Character: CharacterKeys | undefined;
  status: Status;
}

type PlayerInputsListener = (inputs: PlayerInputs, frame: number) => void;

type Status = 'pre-join' | 'joined' | 'error';

const MultiplayerContext = React.createContext<Multiplayer | undefined>(
  undefined
);

type MultiplayerProviderProps = { children: React.ReactNode };

export function MultiplayerProvider({ children }: MultiplayerProviderProps) {
  const [status, setStatus] = useState<Status>('pre-join');
  const [websocket, setWebsocket] = useState<WebSocket | undefined>(undefined);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [localPlayerId, setLocalPlayerId] = useState<PlayerId | undefined>(
    undefined
  );
  const [remotePlayerId, setRemotePlayerId] = useState<PlayerId | undefined>(
    undefined
  );
  const [p1Character, setP1Character] = useState<CharacterKeys | undefined>(
    undefined
  );
  const [p2Character, setP2Character] = useState<CharacterKeys | undefined>(
    undefined
  );
  const [remoteInputListener, setRemoteInputListener] = useState<
    PlayerInputsListener | undefined
  >(undefined);

  // Init websocket connection
  useEffect(() => {
    console.log(`connecting to url ${environment.backendWebsocketEndpoint}`);
    const ws = new WebSocket(environment.backendWebsocketEndpoint);
    const handler = () => {
      console.log(`websocket connected`);
      setWebsocket(ws);
    };
    ws.addEventListener('open', handler);
    return () => {
      ws.removeEventListener('open', handler);
    };
  }, []);

  // Subscribe to events from the server
  useEffect(() => {
    if (!websocket) {
      return;
    }

    websocket.onmessage = (event) => {
      console.log('Received event, ', event);
      const message = JSON.parse(event.data);
      console.log('Received msg: ', message);

      switch (message.type) {
        case 'error':
          setStatus('error');
          console.error('something went wrong', message.error);
          break;
        case 'startBattle':
          setP1Character(message.p1Character);
          setP2Character(message.p2Character);
          break;
        case 'remoteInputs':
          if (!remoteInputListener) {
            console.error('no remote input listener', message);
            return;
          }
          remoteInputListener(message.inputs, message.frame);
          break;
        default:
          console.error('Client received unknown message', message);
          break;
      }
    };
  });

  const joinRoom = (roomId: string, player: PlayerId) => {
    if (!websocket) {
      console.error('websocket not initialized');
      return;
    }

    console.log(`Joining room, roomId: ${roomId}, player: ${player}`);
    var msg = {
      type: 'join',
      roomId,
    };

    websocket.send(JSON.stringify(msg));
    setRoomId(roomId);
    setLocalPlayerId(player);
    setRemotePlayerId(getOpponent(player));
  };

  const setReady = (character: CharacterKeys) => {
    if (!websocket) {
      console.error('websocket not initialized');
      return;
    }

    console.log(`Joining room, roomId: ${roomId}, player: ${localPlayerId}`);
    var msg = {
      type: 'ready',
      roomId,
      localPlayerId,
      character,
    };

    websocket.send(JSON.stringify(msg));
  };

  const sendInputs = (inputs: PlayerInputs) => {
    if (!websocket) {
      throw new Error('websocket not initialized');
    }

    console.log(
      `Sending inputs, roomId: ${roomId}, player: ${localPlayerId}, inputs: ${inputs}`
    );
    var msg = {
      type: 'sendInputs',
      roomId,
      localPlayerId,
      inputs,
    };

    websocket.send(JSON.stringify(msg));
  };

  return (
    <MultiplayerContext.Provider
      value={{
        joinRoom,
        setReady,
        sendInputs,
        setRemoteInputListener,
        p1Character,
        p2Character,
        status,
        localPlayerId,
        remotePlayerId,
      }}
    >
      {children}
    </MultiplayerContext.Provider>
  );
}

export function useMultiplayer() {
  const context = useContext(MultiplayerContext);
  if (context === undefined) {
    throw new Error(
      'useMultiplayer must be used within MultiplayerContext.Provider'
    );
  }
  return context;
}
