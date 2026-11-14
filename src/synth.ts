export class SineSynth {
  private context: AudioContext | null = null;
  private output: GainNode | null = null;

  async start() {
    const context = (this.context ??= new AudioContext());

    if (context.state !== 'running') await context.resume();
    if (this.output) return;
    this.output = context.createGain();
    this.output.connect(context.destination);
    this.output.gain.value = 0.65;
  }

  get ready() {
    return this.context?.state === 'running' && this.output !== null;
  }

  get time() {
    return this.context?.currentTime ?? 0;
  }

  play(notes: number[], time: number, duration: number) {
    const context = this.context;
    const output = this.output;

    if (!context || !output) return;

    notes.forEach((note, index) => {
      const oscillator = context.createOscillator();
      const envelope = context.createGain();
      const onset = time + index * 0.026;
      const end = time + duration + 0.12;
      const gain = index === 0 ? 0.14 : 0.084;

      oscillator.type = 'sine';
      oscillator.frequency.value = 440 * 2 ** ((note - 69) / 12);
      envelope.gain.setValueAtTime(0, onset);
      envelope.gain.linearRampToValueAtTime(gain, onset + 0.065);
      envelope.gain.exponentialRampToValueAtTime(gain * 0.3, end - 0.23);
      envelope.gain.exponentialRampToValueAtTime(0.0001, end);
      oscillator.connect(envelope).connect(output);
      oscillator.start(onset);
      oscillator.stop(end + 0.01);

      oscillator.onended = () => {
        oscillator.disconnect();
        envelope.disconnect();
      };
    });
  }

  stop() {
    const context = this.context;
    const output = this.output;

    if (!context || !output) return;

    output.gain.cancelScheduledValues(context.currentTime);
    output.gain.setTargetAtTime(0, context.currentTime, 0.013);
    window.setTimeout(() => output.disconnect(), 90);
    this.output = null;
  }
}
