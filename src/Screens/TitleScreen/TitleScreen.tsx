import './TitleScreen.css';

interface Props {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: Props) {
  return (
    <div className="title-screen">
      <div className="title-main">PokéDice</div>
      <div className="title-sub">DICE&nbsp;&nbsp;VERSION</div>
      <button className="press-start-btn" onClick={onStart}>
        PRESS START
      </button>
      <div className="footer">© 2025 YOUR STUDIO</div>
    </div>
  );
}
