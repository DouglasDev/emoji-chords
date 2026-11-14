import { styled } from '@linaria/react';
import { moods, rows, type Letter } from './moods';

const Board = styled.div`
  --gap: 9px;
  display: grid;
  gap: var(--gap);
  margin-top: 18px;
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
  &[aria-pressed='true'] {
    background: #e6d6ff;
    border-color: #9d73db;
    box-shadow: 0 3px 0 #9d73db;
  }

  @media (max-width: 650px) {
    height: clamp(40px, 11vw, 66px);
    gap: 2px;
    border-radius: 7px;
  }
`;

const Emoji = styled.span`
  font-size: clamp(19px, 4.9vw, 29px);
  line-height: 1.12;
`;

const Keycap = styled.kbd`
  font:
    600 10px/1 'IBM Plex Mono',
    monospace;
  color: #665b79;
  @media (pointer: coarse) {
    display: none;
  }
`;

type Props = { active?: Letter; onPlay: (letter: Letter) => void };

export function Keyboard({ active, onPlay }: Props) {
  return (
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
                onClick={() => onPlay(letter)}
              >
                <Emoji aria-hidden="true">{mood.emoji}</Emoji>
                <Keycap aria-hidden="true">{letter.toUpperCase()}</Keycap>
              </Pad>
            );
          })}
        </Row>
      ))}
    </Board>
  );
}
