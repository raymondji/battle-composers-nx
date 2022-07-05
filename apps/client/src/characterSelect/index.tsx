import { Button } from '@nextui-org/react';
import { CharacterKeys, characters } from 'libs/gameplay/src/lib/characters';
import React, { useState } from 'react';
import { Page } from '../app/app';
import { useMultiplayer } from '../multiplayer';

type CharacterSelectionProps = {
  setPage: (page: Page) => void;
};

export function CharacterSelection({ setPage }: CharacterSelectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const characterKeys = Object.keys(characters);
  const { setReady } = useMultiplayer();

  const selectedCharacterKey = characterKeys[selectedIndex] as CharacterKeys;
  const selectedCharacter = characters[selectedCharacterKey];

  const cycleLeft = () => {
    let newIndex = selectedIndex - 1;
    if (newIndex < 0) {
      newIndex = characterKeys.length - 1;
    }
    setSelectedIndex(newIndex);
  };
  const cycleRight = () => {
    let newIndex = selectedIndex + 1;
    if (newIndex >= characterKeys.length) {
      newIndex = 0;
    }
    setSelectedIndex(newIndex);
  };

  const startBattle = () => {
    setReady(selectedCharacterKey);
    setPage('combat');
  };

  return (
    <div>
      <h2>Select Character</h2>
      <p>{selectedCharacter.name}</p>
      <Button onClick={cycleLeft}>Left</Button>
      <Button onClick={cycleRight}>Right</Button>
      <Button onClick={startBattle}>Let's Battle!</Button>
    </div>
  );
}
