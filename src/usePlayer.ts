import { useCallback, useEffect, useRef, useState } from 'react';
import { transition, voice, type Key, type Voicing } from './harmony';
import { moods, type Letter } from './moods';
import { SineSynth } from './synth';

export const BPM = 88;

const chordDuration = 120 / BPM;
const pickupDuration = 60 / BPM;

type Playback = { index: number; key: Key; chord: string; pickup: boolean };

export function usePlayer() {
  const [staff, setStaff] = useState<Letter[]>([]);
  const [playing, setPlaying] = useState<Playback | null>(null);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState('');
  const engine = useRef({
    synth: new SineSynth(),
    sequence: [] as Letter[],
    active: false,
    run: 0,
    index: -1,
    inPickup: false,
    step: 0,
    key: undefined as Key | undefined,
    previous: undefined as Voicing | undefined,
    nextTime: 0,
    timer: 0,
    displayTimer: 0,
  }).current;

  function schedule() {
    const { synth, sequence } = engine;

    if (!engine.active) return;
    let pickup: Voicing | null = null;
    const canAdvance = engine.step === 0 && !engine.inPickup && engine.index < sequence.length - 1;

    if (canAdvance) {
      const next = moods[sequence[++engine.index]];
      const route = transition(next.mode, next.chords[0], engine.key, engine.previous);

      engine.key = route.key;
      pickup = route.pickup;
    }

    const key = engine.key!;
    const mood = moods[sequence[engine.index]];
    const step = engine.step;
    const chord = pickup ?? voice(mood.chords[step], key, engine.previous);

    engine.inPickup = !!pickup;
    const time = Math.max(engine.nextTime, synth.time + 0.008);
    const duration = pickup ? pickupDuration : chordDuration;

    synth.play(chord.notes, time, duration);
    engine.previous = chord;
    engine.nextTime = time + duration;
    if (!pickup) engine.step = (step + 1) % mood.chords.length;
    const snapshot = { index: engine.index, key, chord: chord.name, pickup: !!pickup };

    engine.displayTimer = window.setTimeout(
      () => setPlaying(snapshot),
      Math.max(0, (time - synth.time) * 1000),
    );

    engine.timer = window.setTimeout(
      schedule,
      Math.max(0, (engine.nextTime - synth.time) * 1000 - 30),
    );
  }

  async function begin(index = 0) {
    engine.active = true;
    setRunning(true);
    const run = ++engine.run;

    engine.index = index - 1;
    engine.inPickup = false;
    engine.step = 0;
    engine.key = undefined;
    engine.previous = undefined;
    engine.nextTime = 0;
    setNotice('');

    try {
      if (!engine.synth.ready) await engine.synth.start();
      if (run !== engine.run) return;
      schedule();
    } catch {
      if (run !== engine.run) return;
      engine.active = false;
      setRunning(false);
      setNotice('Audio could not start. Try playing again.');
    }
  }

  const stop = useCallback(() => {
    engine.active = false;
    engine.run++;
    window.clearTimeout(engine.timer);
    window.clearTimeout(engine.displayTimer);
    engine.synth.stop();
    setPlaying(null);
    setRunning(false);
  }, [engine]);

  function enqueue(letter: Letter) {
    engine.sequence.push(letter);
    setStaff([...engine.sequence]);

    if (!engine.active) void begin(engine.sequence.length - 1);
  }

  function replay(sequence = engine.sequence) {
    if (!sequence.length) return;
    stop();
    engine.sequence = [...sequence];
    setStaff([...sequence]);
    void begin();
  }

  function clear() {
    stop();
    engine.sequence = [];
    setStaff([]);
    setNotice('');
  }

  useEffect(() => stop, [stop]);

  return { staff, playing, running, notice, enqueue, stop, replay, clear };
}
