// validate() is the trust boundary for model output.
import assert from 'node:assert/strict'
import { MAX_ACTS, MAX_SKILLS, validate } from './sheet.ts'

const warmOnlyNames = ['reassure', 'encourage', 'apologize', 'admit_fear', 'share_memory']
const provokeNames = ['mock', 'threaten', 'goad']

const every = [
  'state_flatly', 'insist', 'change_subject', 'dismiss', 'refuse_flatly',
  'mock', 'threaten', 'goad', 'reassure', 'encourage', 'apologize', 'admit_fear', 'share_memory',
].map((name) => ({ name, description: 'x' }))

// warmth 90 / nerve 90 open every gate, so only the caps cut here.
const god = validate({
  name: 'Omniel',
  attributes: { str: 99, dex: -4, wis: 12, cha: 12 },
  skills: ['force', 'lore', 'lore', 'stealth', 'medicine', 'perception', 'persuasion', 'flight'],
  speechActs: [...every, { name: 'sing', description: 'x' }],
  disposition: { warmth: 90, nerve: 90 },
  voice: { direction: 'booming', ttsVoiceId: 'not-a-voice' },
})

assert.equal(god.skills.length, MAX_SKILLS, 'skills capped')
assert.ok(!god.skills.includes('flight' as never), 'unknown skill dropped')
assert.equal(new Set(god.skills).size, god.skills.length, 'skills deduped')
assert.equal(god.speechActs.length, MAX_ACTS, 'acts capped')
assert.ok(!god.speechActs.some((a) => a.name === 'sing'), 'unknown act dropped')
assert.deepEqual(god.attributes, { str: 18, dex: 3, wis: 12, cha: 12 }, 'attributes clamped to 3..18')
assert.equal(god.voice.ttsVoiceId, 'onyx', 'unknown voice falls back')

// Warm acts go first so the cap cannot hide the gate: the gate must refuse them.
const warmFirst = [...every].sort((a, b) => Number(warmOnlyNames.includes(b.name)) - Number(warmOnlyNames.includes(a.name)))
const cold = validate({ speechActs: warmFirst, disposition: { warmth: 20, nerve: 90 } })
assert.ok(!cold.speechActs.some((a) => warmOnlyNames.includes(a.name)), 'gated acts dropped')
assert.ok(cold.speechActs.some((a) => a.name === 'mock'), 'nerve 90 keeps provoke')

// Timid: provoke closed too, leaving only the always-open families.
const provokeFirst = [...every].sort((a, b) => Number(provokeNames.includes(b.name)) - Number(provokeNames.includes(a.name)))
const timid = validate({ speechActs: provokeFirst, disposition: { warmth: 20, nerve: 10 } })
assert.ok(!timid.speechActs.some((a) => provokeNames.includes(a.name)), 'low nerve closes provoke')

// A character with no legal way to speak is a dead end, not a character.
const mute = validate({ disposition: { warmth: 0, nerve: 0 }, speechActs: [{ name: 'reassure', description: 'x' }] })
assert.equal(mute.speechActs.length, 1, 'always has one act')
assert.equal(mute.speechActs[0].name, 'state_flatly', 'falls back to an always-open act')

assert.equal(validate(null).name, 'Nameless', 'survives garbage')
assert.equal(validate(undefined).skills.length, 0, 'survives nothing at all')

console.log('sheet.check.ts ok')
