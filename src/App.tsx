import { styled } from '@linaria/react';
import { useEffect, useEffectEvent, useState } from 'react';
import { Keyboard } from './Keyboard';
import { moods, type Letter } from './moods';
import { Staff } from './Staff';
import { usePlayer } from './usePlayer';

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
  const { staff, index, running, notice, enqueue, stop, replay, clear } = usePlayer();
  const [showNames, setShowNames] = useState(false);
  const active = index === null ? undefined : staff[index];
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
      </Header>
      <Staff
        staff={staff}
        index={index ?? undefined}
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
