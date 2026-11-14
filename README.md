# Emoji Chords

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

Click a pad or press its QWERTY letter to play. Each emoji plays a short chord loop at 88 BPM, two beats per chord. New notes join the queue and get one full pass in order. The last mood keeps looping until another arrives or you stop. Stop keeps the staff. Replay starts it from the beginning. Copy shares it as plain emoji, and Play sequence replaces the staff with the supported emojis from the paste field.

## Harmony

`src/moods.ts` assigns one common emoji and a tonic-relative progression to each letter. For example, Happy uses I(add6)–IV(add9)–ii7–V7 in major, Sad uses i(add9)–♭VImaj7–iv7–V7 in minor, and Affectionate ends on borrowed iv7. The library also uses applied dominants, first inversions, half-diminished and diminished sevenths, and Neapolitan color.

Playback starts on C in the first mood's mode. At the next mood, the engine compares the same tonic, the relative key when changing modes, and destinations a fourth or fifth away. It favors the current tonic unless another destination offers enough improvement in voice leading. The voicer scores semitone motion across five ordered voices, keeps all the chord tones, and respects written inversions. A one-beat dominant pickup can lead into a new tonic when its combined motion scores better than a direct entry. A replay starts from C and advances after one pass through each queued mood.

The voicing algorithm uses voice distance and range. It does not enforce a full common-practice part-writing rule set. The sine synth plays a lightly rolled chord with a soft attack and overlapping release.

## Checks

```sh
pnpm run format
pnpm run format:check
pnpm run typecheck
pnpm run build
```
