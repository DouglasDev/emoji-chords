export type Mode = 'major' | 'minor';

export type Quality =
  | 'M'
  | 'm'
  | 'M7'
  | 'm7'
  | '7'
  | '6'
  | 'add9'
  | 'madd9'
  | 'ø7'
  | 'dim7'
  | 'aug'
  | 'sus4';

export type Chord = readonly [root: number, quality: Quality, inversion?: number];

type Mood = { emoji: string; name: string; mode: Mode; chords: readonly Chord[] };

const major = (emoji: string, name: string, ...chords: Chord[]): Mood => ({
  emoji,
  name,
  mode: 'major',
  chords,
});

const minor = (emoji: string, name: string, ...chords: Chord[]): Mood => ({
  emoji,
  name,
  mode: 'minor',
  chords,
});

export const moods = {
  q: major('😇', 'Innocent', [0, 'add9'], [5, 'M7', 1], [7, 'sus4']),
  w: minor('😟', 'Worried', [0, 'madd9'], [2, 'ø7', 1], [7, '7']),
  e: major('🤩', 'Excited', [0, '6'], [9, '7'], [2, 'm7'], [7, '7']),
  r: minor('🙂', 'Relieved', [0, 'm'], [5, 'm7'], [8, 'M7'], [7, 'sus4'], [0, 'madd9']),
  t: minor('😰', 'Tense', [0, 'm'], [1, 'M', 1], [11, 'dim7'], [7, '7']),
  y: minor('😔', 'Longing', [0, 'madd9'], [8, 'M7'], [5, 'm', 1], [7, '7']),
  u: minor('🙄', 'Annoyed', [0, 'm7'], [6, '7'], [7, '7']),
  i: major('🥰', 'Affectionate', [0, 'M7'], [4, 'm7'], [5, 'M7'], [5, 'm7']),
  o: major('😮', 'Surprised', [0, 'M'], [0, 'aug'], [9, 'm', 1], [7, '7']),
  p: major('😎', 'Confident', [0, '6'], [5, 'add9'], [2, '7'], [7, '7']),
  a: minor('😡', 'Angry', [0, 'm'], [6, '7'], [1, 'M'], [7, '7']),
  s: minor('😢', 'Sad', [0, 'madd9'], [8, 'M7'], [5, 'm7'], [7, '7']),
  d: major('😴', 'Sleepy', [0, '6']),
  f: minor('😨', 'Afraid', [0, 'madd9'], [11, 'dim7'], [8, 'M', 1], [7, '7']),
  g: major('😊', 'Grateful', [0, 'M7'], [9, 'm7'], [2, 'm7', 1], [5, 'M', 1]),
  h: major('😀', 'Happy', [0, '6'], [5, 'add9'], [2, 'm7'], [7, '7']),
  j: major('😂', 'Amused', [0, '6'], [3, 'dim7'], [4, 'm7'], [7, '7']),
  k: major('🤔', 'Curious', [0, 'add9'], [2, '7'], [5, 'M7', 1]),
  l: major('😍', 'In love', [0, 'M7'], [4, '7'], [9, 'm7'], [5, 'm', 1]),
  z: major('😮‍💨', 'Tired', [0, 'M7'], [0, '7'], [5, 'M7'], [5, 'm7']),
  x: minor('😖', 'Frustrated', [0, 'm'], [5, '7'], [6, 'dim7'], [7, 'sus4']),
  c: major('😌', 'Calm', [0, 'add9'], [5, 'M7', 1]),
  v: minor('🥺', 'Vulnerable', [0, 'madd9'], [3, 'M7', 1], [2, 'ø7'], [7, 'sus4']),
  b: major('😳', 'Embarrassed', [0, 'M7'], [1, 'dim7'], [2, 'm7'], [5, 'm', 1]),
  n: minor('🥹', 'Nostalgic', [0, 'm7'], [3, 'M7'], [5, 'm7'], [10, '7']),
  m: minor('🫥', 'Lonely', [0, 'madd9'], [8, 'M7', 1], [2, 'ø7']),
} satisfies Record<string, Mood>;

export type Letter = keyof typeof moods;

export const rows = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'].map((row) => [...row] as Letter[]);

const emojiKeys = new Map<string, Letter>(
  Object.entries(moods).map(([letter, mood]) => [
    mood.emoji.replace(/\uFE0F/g, ''),
    letter as Letter,
  ]),
);

export function parseEmojis(text: string): Letter[] {
  return [...new Intl.Segmenter().segment(text)].flatMap(({ segment }) => {
    const letter = emojiKeys.get(segment.replace(/\uFE0F/g, ''));

    return letter ? [letter] : [];
  });
}
