import { styled } from '@linaria/react';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { moods, parseEmojis, type Letter } from './moods';

const Section = styled.section`
  background: #fff;
  border: 1px solid #e3ddee;
  border-radius: 17px;
  padding: 20px 23px 18px;
  @media (max-width: 600px) {
    padding: 15px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 17px;
`;

const Actions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

const Action = styled.button`
  min-height: 34px;
  border: 1px solid #ded6ed;
  border-radius: 7px;
  padding: 4px 10px;
  background: #fff;
  color: #40335c;
  font-size: 12px;
  font-weight: 650;
  cursor: pointer;
  &:hover:enabled {
    background: #eee5fa;
  }
  &:disabled {
    opacity: 0.45;
    cursor: default;
  }
`;

const PrimaryAction = styled(Action)`
  border-color: #e9d9fd;
  background: #f5edff;
`;

const Transport = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 4px;
`;

const TransportButton = styled(PrimaryAction)`
  min-width: 66px;
`;

const Indicator = styled.span`
  width: 9px;
  height: 9px;
  border: 1px solid #8b7a9f;
  border-radius: 50%;
  &[data-running='true'] {
    border-color: #216e50;
    background: #27815d;
  }
`;

const ScreenReaderText = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
`;

const Track = styled.ol`
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 93px;
  list-style: none;
  margin: 12px 0 0;
  padding: 14px;
  overflow-x: auto;
  border-radius: 10px;
  background:
    repeating-linear-gradient(to bottom, #e3d9f0 0 1px, transparent 1px 8px) center / 100% 33px
      no-repeat,
    #f9f6fe;
`;

const Empty = styled.li`
  color: #655a75;
  background: #f9f6fe;
  padding: 6px 9px;
  margin: auto;
  border-radius: 6px;
  font-size: 13px;
`;

const Note = styled.li`
  flex: 0 0 43px;
  height: 43px;
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: #fff;
  border: 1px solid #e3dcee;
  font-size: 24px;
  &[data-queued='true'] {
    background: #f8f3ff;
  }
  &[aria-current='step'] {
    border-color: #8a57ca;
    background: #eee0ff;
  }
  &[aria-current='step']::before {
    content: '';
    position: absolute;
    top: -8px;
    left: calc(50% - 4px);
    border: 4px solid transparent;
    border-top-color: #7847b6;
  }
`;

const PasteForm = styled.form`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const PasteInput = styled.input`
  flex: 1;
  min-width: 80px;
  height: 36px;
  border: 1px solid #ded6ed;
  border-radius: 7px;
  padding: 0 10px;
  color: inherit;
  font-size: 14px;
  &::placeholder {
    color: #6e627e;
  }
`;

const Feedback = styled.p`
  margin: 8px 0 0;
  color: #584668;
  font-size: 13px;
`;

type Props = {
  staff: Letter[];
  index?: number;
  running: boolean;
  notice: string;
  onStop: () => void;
  onReplay: (sequence?: Letter[]) => void;
  onClear: () => void;
};

export function Staff({ staff, index, running, notice, onStop, onReplay, onClear }: Props) {
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const marker = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const note = marker.current;
    const track = note?.parentElement;

    if (!note || !track) return;
    const offset = note.getBoundingClientRect().left - track.getBoundingClientRect().left;

    if (offset < 0 || offset + note.offsetWidth > track.clientWidth) {
      track.scrollLeft += offset - 14;
    }
  }, [index]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(staff.map((letter) => moods[letter].emoji).join(''));
      setFeedback('Sequence copied.');
    } catch {
      setInput(staff.map((letter) => moods[letter].emoji).join(''));
      setFeedback('Select the sequence in the field to copy it.');
    }
  }

  function playPaste(event: FormEvent) {
    event.preventDefault();
    const letters = parseEmojis(input);

    if (!letters.length) {
      setFeedback('Paste at least one emoji from the keyboard.');

      return;
    }

    setInput('');
    setFeedback('');
    onReplay(letters);
  }

  return (
    <Section aria-labelledby="staff-heading">
      <Header>
        <Title id="staff-heading">Emoji staff</Title>
        <Actions>
          <Transport>
            <TransportButton
              type="button"
              disabled={!running && !staff.length}
              onClick={() => {
                setFeedback('');
                if (running) onStop();
                else onReplay();
              }}
            >
              {running ? 'Stop' : 'Replay'}
            </TransportButton>
            <Indicator aria-hidden="true" data-running={running} />
            <ScreenReaderText role="status">{running ? 'Playing' : 'Stopped'}</ScreenReaderText>
          </Transport>
          <Action disabled={!staff.length} onClick={() => void copy()}>
            Copy
          </Action>
          <Action
            disabled={!staff.length}
            onClick={() => {
              setFeedback('');
              onClear();
            }}
          >
            Clear
          </Action>
        </Actions>
      </Header>
      <Track aria-label="Recorded sequence">
        {staff.length === 0 && <Empty>Play a key to start a sequence.</Empty>}
        {staff.map((letter, position) => (
          <Note
            key={position}
            ref={position === index ? marker : null}
            aria-current={position === index ? 'step' : undefined}
            data-queued={index !== undefined && position > index}
            title={moods[letter].name}
          >
            <span role="img" aria-label={moods[letter].name}>
              {moods[letter].emoji}
            </span>
          </Note>
        ))}
      </Track>
      <PasteForm onSubmit={playPaste}>
        <PasteInput
          aria-label="Paste an emoji sequence"
          placeholder="Paste an emoji sequence"
          value={input}
          onChange={(event) => {
            setInput(event.target.value);
            setFeedback('');
          }}
        />
        <PrimaryAction type="submit">Play sequence</PrimaryAction>
      </PasteForm>
      {feedback && <Feedback role="status">{feedback}</Feedback>}
      {notice && <Feedback role="alert">{notice}</Feedback>}
    </Section>
  );
}
