// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Container } from '@nextui-org/react';
import { useState } from 'react';
import { CharacterSelection } from '../characterSelect';
import { Combat } from '../combat';
import { Lobby } from '../lobby';
import styles from './app.module.scss';

export type Page = 'lobby' | 'characterSelect' | 'combat' | 'gameOver';

export function App() {
  const [page, setPage] = useState<Page>('lobby');

  switch (page) {
    case 'lobby':
      return <Lobby setPage={setPage} />;
    case 'characterSelect':
      return <CharacterSelection setPage={setPage} />;
    case 'combat':
      return <Combat setPage={setPage} />;
    default:
      return <Container>Not implemented</Container>;
  }
}

export default App;
