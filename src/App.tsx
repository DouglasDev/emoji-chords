import { styled } from '@linaria/react';
import { useEffect, useEffectEvent } from 'react';
import { noteName } from './harmony';
import { Keyboard } from './Keyboard';
import { moods, type Letter } from './moods';
import { Staff } from './Staff';
import { BPM, usePlayer } from './usePlayer';

const Page = styled.main`
  max-width: 890px;
  padding: 36px 23px 32px;
  margin: 0 auto;
  @media (max-width: 600px) {
    padding: 23px 13px;
  }
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 20px;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 11px;
`;

const Icon = styled.span`
  width: 43px;
  height: 43px;
  display: grid;
  place-items: center;
  color: #fff;
  background: #7546b5;
  border-radius: 12px;
  font-size: 26px;
  line-height: 1;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(24px, 5vw, 34px);
  letter-spacing: -0.045em;
  line-height: 1.12;
`;

const Stop = styled.button`
  border: 1px solid #dcd3ea;
  border-radius: 8px;
  min-height: 39px;
  padding: 0 13px;
  color: #35244d;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 650;
  &:hover {
    background: #eee5fa;
  }
`;

const Instrument = styled.section`
  border: 1px solid #e3d9ee;
  border-radius: 17px;
  padding: 20px 23px 23px;
  margin-bottom: 15px;
  background: #fff;
  box-shadow: 0 10px 24px #4430640c;
  @media (max-width: 600px) {
    padding: 13px;
  }
`;

const Display = styled.div`
  display: grid;
  grid-template-columns: minmax(150px, 1.45fr) repeat(3, minmax(0, 1fr));
  gap: 14px;
  min-height: 102px;
  padding: 18px;
  border-radius: 11px;
  background: #231932;
  color: #fff;
  @media (max-width: 600px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    padding: 13px;
    gap: 13px 8px;
  }
`;

const Mood = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 600px) {
    grid-column: 1 / -1;
  }
`;

const MoodIcon = styled.span`
  display: grid;
  place-items: center;
  flex: 0 0 49px;
  height: 49px;
  background: #3d2b51;
  color: #dfc9fc;
  border-radius: 10px;
  font-size: 27px;
`;

const Status = styled.div`
  display: grid;
  align-content: center;
  gap: 5px;
  overflow-wrap: anywhere;
`;

const Label = styled.span`
  color: #d3bfe9;
  font:
    500 10px/1.4 'IBM Plex Mono',
    monospace;
  letter-spacing: 0.065em;
  text-transform: uppercase;
`;

const Value = styled.strong`
  font-size: clamp(13px, 3vw, 18px);
  font-weight: 650;
  line-height: 1.16;
`;

const Help = styled.p`
  margin: 15px 0 0;
  color: #655775;
  font-size: 13px;
`;

const DesktopHelp = styled.span`
  @media (pointer: coarse) {
    display: none;
  }
`;

export function App() {
  const { staff, playing, notice, enqueue, stop, replay, clear } = usePlayer();
  const active = playing === null ? undefined : staff[playing.index];
  const mood = active ? moods[active] : undefined;
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
    <Page>
      <Header>
        <Brand>
          <Icon aria-hidden="true">♫</Icon>
          <Title>Emoji Chords</Title>
        </Brand>
        <Stop type="button" onClick={stop}>
          ■ Stop
        </Stop>
      </Header>
      <Instrument aria-label="Instrument">
        <Display>
          <Mood>
            <MoodIcon aria-hidden="true">{mood?.emoji ?? '♪'}</MoodIcon>
            <Status>
              <Label>Now playing</Label>
              <Value>{mood?.name ?? 'Ready'}</Value>
            </Status>
          </Mood>
          <Status>
            <Label>Musical key</Label>
            <Value>{playing ? noteName(playing.key.tonic) + ' ' + playing.key.mode : '—'}</Value>
          </Status>
          <Status>
            <Label>{playing?.pickup ? 'Pickup chord' : 'Chord'}</Label>
            <Value>{playing?.chord ?? '—'}</Value>
          </Status>
          <Status>
            <Label>{playing ? 'Queue' : 'Tempo'}</Label>
            <Value>{playing ? staff.length - playing.index - 1 : `${BPM} BPM`}</Value>
          </Status>
        </Display>
        <Keyboard active={active} onPlay={enqueue} />
        <Help>
          {notice || (
            <>
              Play an emoji<DesktopHelp> or press its letter</DesktopHelp>. Queued moods start at
              the end of the loop.
            </>
          )}
        </Help>
      </Instrument>
      <Staff staff={staff} index={playing?.index} onReplay={replay} onClear={clear} />
    </Page>
  );
}
