import { SpellDefinition, SpellDefinitionKeys } from '../spells/definitions';

export interface Character {
  name: string;
  sprite: string;
  spells: SpellDefinitionKeys[];
}

export const beethoven: Character = {
  name: 'Beethoven',
  sprite: '',
  spells: ['furElise'],
};

export const mozart: Character = {
  name: 'Mozart',
  sprite: '',
  spells: ['furElise'],
};

export const characters = {
  beethoven,
  mozart,
};

export type CharacterKeys = keyof typeof characters;
