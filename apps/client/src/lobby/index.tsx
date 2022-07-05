import React, { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';
import { useMultiplayer } from '../multiplayer';
import { Page } from '../app/app';
import { Button, Container, Input } from '@nextui-org/react';
import { PlayerId } from 'libs/gameplay/src/lib/engine';

type LobbyProps = {
  setPage: (page: Page) => void;
};

export function Lobby({ setPage }: LobbyProps) {
  const { joinRoom } = useMultiplayer();
  const [roomId, setRoomId] = useState('');
  const [playerId, setPlayerId] = useState<PlayerId>('P2');

  const createRoom = () => {
    setRoomId(nanoid());
    setPlayerId('P1');
  };

  const play = () => {
    if (!roomId) {
      alert(
        'No room ID, please create a room and share the room code with your friend'
      );
      return;
    }
    joinRoom(roomId, playerId);
    setPage('characterSelect');
  };

  return (
    <Container>
      <Input value={roomId} onChange={(e) => setRoomId(e.target.value)} />
      <Button onClick={createRoom}>Create room</Button>
      <Button onClick={play}>Play</Button>
    </Container>
  );
}
