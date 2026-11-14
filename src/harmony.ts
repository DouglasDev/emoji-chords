import type { Chord, Mode, Quality } from './moods';

const intervals: Record<Quality, number[]> = {
  M: [0, 4, 7],
  m: [0, 3, 7],
  M7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  '7': [0, 4, 7, 10],
  '6': [0, 4, 7, 9],
  add9: [0, 4, 7, 14],
  madd9: [0, 3, 7, 14],
  ø7: [0, 3, 6, 10],
  dim7: [0, 3, 6, 9],
  aug: [0, 4, 8],
  sus4: [0, 5, 7],
};

const suffix: Record<Quality, string> = {
  M: '',
  m: 'm',
  M7: 'maj7',
  m7: 'm7',
  '7': '7',
  '6': '6',
  add9: 'add9',
  madd9: 'm(add9)',
  ø7: 'ø7',
  dim7: 'dim7',
  aug: 'aug',
  sus4: 'sus4',
};

const names = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];

const pitch = (note: number) => ((note % 12) + 12) % 12;

export const noteName = (note: number) => names[pitch(note)];

export type Key = { tonic: number; mode: Mode };

export type Voicing = { name: string; notes: number[]; cost: number };

const home: Key = { tonic: 0, mode: 'major' };

export function voice(chord: Chord, key: Key, previous?: Voicing): Voicing {
  const [degree, quality, inversion = 0] = chord;
  const root = key.tonic + degree;
  const tones = intervals[quality].map((step) => pitch(root + step));
  const bassPitch = tones[inversion];
  const name = noteName(root) + suffix[quality] + (inversion ? '/' + noteName(bassPitch) : '');
  const candidates = Array.from({ length: 24 }, (_, index) => 52 + index).filter((note) =>
    tones.includes(pitch(note)),
  );
  const basses = Array.from({ length: 19 }, (_, index) => 35 + index).filter(
    (note) => pitch(note) === bassPitch,
  );
  const target = previous?.notes ?? [43, 55, 60, 64, 69];
  let best = { name, notes: target, cost: Infinity };

  for (const bass of basses) {
    for (const low of candidates) {
      for (const mid of candidates.filter((note) => note > low && note - low <= 10)) {
        for (const high of candidates.filter((note) => note > mid && note - mid <= 10)) {
          for (const top of candidates.filter((note) => note > high && note - high <= 9)) {
            const notes = [bass, low, mid, high, top];

            if (low <= bass || low - bass > 23 || new Set(notes.map(pitch)).size < tones.length)
              continue;
            const cost = notes.reduce(
              (sum, note, index) => {
                const distance = Math.abs(note - target[index]);

                return sum + distance * (index === 0 ? 0.7 : 1) + Math.max(0, distance - 5);
              },
              Math.abs(top - 69) * 0.13 + Math.abs(bass - 43) * 0.15,
            );

            if (cost < best.cost) best = { name, notes, cost };
          }
        }
      }
    }
  }

  return best;
}

export function transition(mode: Mode, opening: Chord, current?: Key, previous?: Voicing) {
  if (!current || !previous) return { key: { ...home, mode }, pickup: null };
  const relative = current.mode === 'major' ? -3 : 3;
  const options =
    mode === current.mode
      ? [
          [0, 0],
          [5, 5],
          [7, 5],
        ]
      : [
          [0, 0],
          [relative, 1.5],
          [5, 5],
          [7, 5],
        ];
  const routes = options.map(([offset, penalty]) => {
    const key = { tonic: pitch(current.tonic + offset), mode };
    const first = voice(opening, key, previous);
    const directCost = first.cost + penalty + (offset ? 4 : 0);
    const dominant = voice([7, '7'], key, previous);
    const resolution = voice(opening, key, dominant);
    const bridgeCost = (dominant.cost + resolution.cost) * 0.55 + penalty + 1;
    const usePickup = offset !== 0 && dominant.name !== previous.name && bridgeCost < directCost;

    return { key, pickup: usePickup ? dominant : null, cost: usePickup ? bridgeCost : directCost };
  });

  return routes.reduce((best, route) => (route.cost < best.cost ? route : best));
}
