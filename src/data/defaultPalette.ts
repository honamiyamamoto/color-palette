import type { Palette } from '../types/palette'
import { createId } from '../utils/colorUtils'

const PRESET_GROUPS = [
  {
    name: 'Blue',
    colors: [
      ['Blue 900', '#0B3A75'],
      ['Blue 700', '#1E5CA8'],
      ['Blue 500', '#3C86D9'],
      ['Blue 300', '#91C0F2'],
    ],
  },
  {
    name: 'Gray',
    colors: [
      ['Gray 900', '#30343B'],
      ['Gray 700', '#535A66'],
      ['Gray 500', '#788090'],
      ['Gray 200', '#D6DBE6'],
    ],
  },
  {
    name: 'Green',
    colors: [
      ['Green 900', '#1E5E3B'],
      ['Green 700', '#2E8C59'],
      ['Green 500', '#4FB87A'],
      ['Green 200', '#BEE8CC'],
    ],
  },
  {
    name: 'Red',
    colors: [
      ['Red 900', '#7D1D20'],
      ['Red 700', '#B13339'],
      ['Red 500', '#DE575D'],
      ['Red 200', '#F3C2C4'],
    ],
  },
  {
    name: 'Orange',
    colors: [
      ['Orange 900', '#8A4B13'],
      ['Orange 700', '#BF6A1D'],
      ['Orange 500', '#E3913D'],
      ['Orange 200', '#F6D4AD'],
    ],
  },
]

export function createDefaultPalette(): Palette {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    groups: PRESET_GROUPS.map((group) => ({
      id: createId('group'),
      name: group.name,
      colors: group.colors.map(([name, hex]) => ({
        id: createId('color'),
        name,
        hex,
      })),
    })),
  }
}
