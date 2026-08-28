export type Skill = 'force' | 'intimidation' | 'perception' | 'lore' | 'lockpicking'

export type Prop = {
  id: string
  label: string
  onExamine: string
  requires?: Skill
  reveals?: string
}

export type Challenge = {
  id: string
  description: string
  skill: Skill
  attr: 'str' | 'dex' | 'wis' | 'cha'
  dc: number
  success: string
  fail: string
  sets?: string
  failSets?: string
  gone?: string
}

export type Room = {
  id: string
  name: string
  description: string
  props: Prop[]
  exits: { to: string; needs?: string }[]
  challenges?: Challenge[]
}

export const START = 'landing'

export const rooms: Record<string, Room> = {
  landing: {
    id: 'landing',
    name: 'The Sealed Landing',
    description:
      'Six steps down from a doorway that is no longer there. A slab of a door fills ' +
      'the far wall, banded in iron gone the colour of old blood.',
    props: [
      {
        id: 'door_seal',
        label: 'the seal on the door',
        onExamine:
          'Concentric script, cut not carved. It names a debt and the year it comes due. ' +
          'The year was a long time ago.',
        requires: 'lore',
        reveals: 'read_seal',
      },
      { id: 'rubble', label: 'the rubble', onExamine: 'Ceiling, mostly. Something under it stopped moving a while ago.' },
      { id: 'bracket', label: 'an empty lantern bracket', onExamine: 'Empty. The wall behind it is scorched in a neat oval.' },
    ],
    exits: [{ to: 'hall', needs: 'door_open' }],
    challenges: [
      {
        id: 'force_door',
        description:
          'Put your shoulder through the sealed door. It is a door and you are you. ' +
          'Loud, and you know it.',
        skill: 'force',
        attr: 'str',
        dc: 14,
        success: 'The band shears and the slab swings in.',
        fail: 'The frame holds. Loud.',
        sets: 'door_open',
        failSets: 'noise',
        gone: 'door_open',
      },
    ],
  },

  hall: {
    id: 'hall',
    name: 'The Long Hall',
    description:
      'A corridor built for a procession that never came back. Murals run the length ' +
      'of both walls. Water moves somewhere below.',
    props: [
      {
        id: 'murals',
        label: 'the murals',
        onExamine:
          'A ledger, painted. Debts paid in kind. The last panel shows a sigil pressed ' +
          'into a door — and you know where that door is.',
        requires: 'lore',
        reveals: 'sigil',
      },
      { id: 'bones', label: 'bones against the wall', onExamine: 'Sat down. Never got up. No wounds worth the name.' },
      { id: 'brazier', label: 'a cold brazier', onExamine: 'Cold. Ash, and under the ash, teeth.' },
    ],
    exits: [{ to: 'landing' }, { to: 'cistern' }, { to: 'vault', needs: 'sigil' }],
  },

  cistern: {
    id: 'cistern',
    name: 'The Drowned Cistern',
    description:
      'Black water to the ankle and a vaulted dark above it. Something is standing in ' +
      'the middle of the room that has been standing there a very long time.',
    props: [
      { id: 'water', label: 'the water', onExamine: 'Ankle-deep, and it does not ripple where you walk.' },
      {
        id: 'scribe',
        label: 'the drowned scribe',
        onExamine: 'A clerk, or was. Holds a tally-stick. Watches you the way a door watches a key.',
      },
    ],
    exits: [{ to: 'hall' }],
    challenges: [
      {
        id: 'intimidate_scribe',
        description:
          'Make the dead thing understand you are a worse problem than whatever it is ' +
          'guarding. Works on the living. Worth a try.',
        skill: 'intimidation',
        attr: 'cha',
        dc: 12,
        success: 'It steps aside and holds out the tally-stick.',
        fail: 'It does not blink. It has no eyelids. It writes something down.',
        sets: 'tally',
        gone: 'tally',
      },
    ],
  },

  vault: {
    id: 'vault',
    name: 'The Vault of Small Hours',
    description:
      'Not treasure. Shelves of stoppered jars, each one holding an hour somebody did ' +
      'not get to live. One shelf is empty and swept clean.',
    props: [
      { id: 'reliquary', label: 'the empty shelf', onExamine: 'Swept clean, recently. Someone got here first, or is coming.' },
      { id: 'ledger', label: 'a ledger on a stand', onExamine: 'Open to today. Two names. One of them is yours.' },
    ],
    exits: [{ to: 'hall' }],
  },
}

const mod = (attr: number) => Math.floor((attr - 10) / 2)

export type Roll = { d20: number; total: number; dc: number; ok: boolean }

export const roll = (attr: number, dc: number): Roll => {
  const d20 = 1 + Math.floor(Math.random() * 20)
  const total = d20 + mod(attr)
  return { d20, total, dc, ok: total >= dc }
}
