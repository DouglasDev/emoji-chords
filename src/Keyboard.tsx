import { styled } from '@linaria/react';
import { moods, rows, type Letter } from './moods';

const NamesToggle = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: #524463;
  font-size: 13px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin: 0;
  width: 15px;
  height: 15px;
  accent-color: #7546b5;
`;

const Board = styled.div`
  --gap: 9px;
  display: grid;
  gap: var(--gap);
  margin-top: 12px;
  @media (max-width: 650px) {
    --gap: 4px;
  }
`;

const Row = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--gap);
`;

const Pad = styled.button`
  position: relative;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 6px;
  width: calc((100% - 9 * var(--gap)) / 10);
  min-width: 0;
  height: 76px;
  padding: 0;
  border: 1px solid #d9d1eb;
  border-radius: 10px;
  background: #fbf9ff;
  box-shadow: 0 3px 0 #d9d1eb;
  cursor: pointer;
  transition:
    background 120ms,
    transform 120ms,
    box-shadow 120ms;

  &:hover {
    background: #efe7ff;
  }
  &:active {
    transform: translateY(2px);
    box-shadow: none;
  }
  &[data-show-names='true'] {
    height: 92px;
    grid-template-rows: 26px auto auto;
  }
  &[aria-pressed='true'] {
    background: #e6d6ff;
    border-color: #9d73db;
    box-shadow: 0 3px 0 #9d73db;
  }

  @media (max-width: 650px) {
    height: clamp(40px, 11vw, 66px);
    gap: 2px;
    border-radius: 7px;
    &[data-show-names='true'] {
      height: 78px;
      grid-template-rows: 32px auto auto;
    }
  }
`;

const PadName = styled.span`
  align-self: center;
  max-width: 100%;
  padding: 0 1px;
  overflow-wrap: anywhere;
  color: #4f4160;
  font-size: clamp(8px, 1.7vw, 11px);
  font-weight: 650;
  line-height: 1.16;
  text-align: center;
`;

const Emoji = styled.span`
  font-size: clamp(19px, 4.9vw, 29px);
  line-height: 1.16;
`;

const Keycap = styled.kbd`
  font:
    600 10px/1 'IBM Plex Mono',
    monospace;
  color: #665b79;
  @media (pointer: coarse), (max-width: 480px) {
    display: none;
  }
`;

type Props = {
  active?: Letter;
  showNames: boolean;
  onShowNames: (show: boolean) => void;
  onPlay: (letter: Letter) => void;
};

export function Keyboard({ active, showNames, onShowNames, onPlay }: Props) {
  return (
    <>
      <NamesToggle>
        <Checkbox
          type="checkbox"
          checked={showNames}
          onChange={(event) => onShowNames(event.target.checked)}
        />
        Show emotion names
      </NamesToggle>
      <Board aria-label="QWERTY emoji keyboard">
        {rows.map((row) => (
          <Row key={row[0]}>
            {row.map((letter) => {
              const mood = moods[letter];

              return (
                <Pad
                  key={letter}
                  type="button"
                  title={mood.name}
                  aria-label={mood.name}
                  aria-pressed={active === letter}
                  data-show-names={showNames}
                  onClick={() => onPlay(letter)}
                >
                  {showNames && <PadName aria-hidden="true">{mood.name}</PadName>}
                  <Emoji aria-hidden="true">{mood.emoji}</Emoji>
                  <Keycap aria-hidden="true">{letter.toUpperCase()}</Keycap>
                </Pad>
              );
            })}
          </Row>
        ))}
      </Board>
    </>
  );
}
