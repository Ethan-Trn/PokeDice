import './FightScreen.css';

interface Props {
  onBack: () => void;
}

export default function FightScreen({ onBack }: Props) {
  return (
    <div className="fight-screen">
      <div className="fight-label">FIGHT SCENE</div>
      <button className="back-btn" onClick={onBack}>← BACK</button>
    </div>
  );
}
