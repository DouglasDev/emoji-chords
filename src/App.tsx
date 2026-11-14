import { styled } from '@linaria/react';
import { useEffect, useEffectEvent, useState } from 'react';
import { noteName } from './harmony';
import { Keyboard } from './Keyboard';
import { moods, type Letter } from './moods';
import { Staff } from './Staff';
import { BPM, usePlayer } from './usePlayer';

const Page = styled.main`
  max-width: 890px;
  padding: 18px 23px 32px;
  margin: 0 auto;
  @media (max-width: 600px) {
    padding: 12px 13px 23px;
  }
`;

const Harmony = styled.dl`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin: 0 0 10px;
  padding: 9px 14px;
  border: 1px solid #e3d9ee;
  border-radius: 11px;
  background: #fbf8ff;
`;

const Metric = styled.div`
  min-width: 0;
`;

const MetricLabel = styled.dt`
  color: #655775;
  font-size: 11px;
`;

const MetricValue = styled.dd`
  margin: 2px 0 0;
  font-size: 13px;
  font-weight: 650;
  overflow-wrap: anywhere;
`;

const Instrument = styled.section`
  border: 1px solid #e3d9ee;
  border-radius: 17px;
  padding: 20px 23px 23px;
  margin-top: 15px;
  background: #fff;
  box-shadow: 0 10px 24px #4430640c;
  @media (max-width: 600px) {
    padding: 13px;
  }
`;

const Help = styled.p`
  margin: 15px 0 0;
  color: #655775;
  font-size: 13px;
`;

const DesktopHelp = styled.span`
  @media (pointer: coarse), (max-width: 480px) {
    display: none;
  }
`;

export function App() {
  const { staff, playing, running, notice, enqueue, stop, replay, clear } = usePlayer();
  const [showNames, setShowNames] = useState(false);
  const active = playing ? staff[playing.index] : undefined;
  const handleKey = useEffectEvent((event: KeyboardEvent) => {
    if (
      event.repeat ||
      event.isComposing ||
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      (event.target instanceof HTMLElement &&
        (event.target.isContentEditable || event.target.matches('input,textarea,select')))
    )
      return;

    const letter = event.key.toLowerCase();

    if (Object.hasOwn(moods, letter)) {
      event.preventDefault();
      enqueue(letter as Letter);
    }
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => handleKey(event);

    window.addEventListener('keydown', listener);

    return () => window.removeEventListener('keydown', listener);
  }, []);

  return (
    <Page aria-label="Emoji Chords">
      <Harmony aria-label="Playback details">
        <Metric>
          <MetricLabel>Musical key</MetricLabel>
          <MetricValue>
            {playing ? noteName(playing.key.tonic) + ' ' + playing.key.mode : '—'}
          </MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>{playing?.pickup ? 'Pickup chord' : 'Chord'}</MetricLabel>
          <MetricValue>{playing?.chord ?? '—'}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Queue</MetricLabel>
          <MetricValue>{playing ? staff.length - playing.index - 1 : 0}</MetricValue>
        </Metric>
        <Metric>
          <MetricLabel>Tempo</MetricLabel>
          <MetricValue>{BPM} BPM</MetricValue>
        </Metric>
      </Harmony>
      <Staff
        staff={staff}
        index={playing?.index}
        running={running}
        notice={notice}
        onStop={stop}
        onReplay={replay}
        onClear={clear}
      />
      <Instrument aria-label="Instrument">
        <Keyboard
          active={active}
          showNames={showNames}
          onShowNames={setShowNames}
          onPlay={enqueue}
        />
        <Help>
          Play an emoji<DesktopHelp> or press its letter</DesktopHelp>. Queued moods start at the
          end of the loop.
        </Help>
      </Instrument>
    </Page>
  );
}
