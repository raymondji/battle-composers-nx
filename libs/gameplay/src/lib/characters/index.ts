import { SpellDefinition, SpellDefinitionKeys } from '../spells/definitions';

export interface Character {
  name: string;
  sprite: string;
  spells: SpellDefinitionKeys[];
}
