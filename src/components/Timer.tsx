import { playerType } from "@/types/Types";

interface timerProps {
  time: number
  player: playerType
}

export default function Timer(props: timerProps) {
  const time = props.time;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  return (
    <div>
      <h1>{/* `side: ${props.player}` */}</h1>
      <h1>{formatTime(time)}</h1>
    </div>
  );
}

