import { Button } from '@nextui-org/react';
import { CharacterKeys, characters } from 'libs/gameplay/src/lib/characters';
import React, { useEffect, useState } from 'react';
import { Page } from '../app/app';
import { useMultiplayer } from '../multiplayer';

type CharacterSelectionProps = {
  setPage: (page: Page) => void;
};

export function CharacterSelection({ setPage }: CharacterSelectionProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const characterKeys = Object.keys(characters);
  const { setReady, p1Character, p2Character } = useMultiplayer();

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
    // TODO: show loading state until the other player has also selected
    setReady(selectedCharacterKey);
  };

  useEffect(() => {
    // TODO: maybe make in-battle a status to make this check nicer
    if (p1Character && p2Character) {
      setPage('combat');
    }
  });

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
