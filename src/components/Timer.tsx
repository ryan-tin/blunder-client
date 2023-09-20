import { playerType } from "@/types/Types";
import timerstyles from "@/styles/Timer.module.css";

interface timerProps {
  time: number
  player: playerType
  isActive: boolean
}

const DEBUG = false;

export default function Timer(props: timerProps) {

  const time = props.time;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  let className = timerstyles.timer;
  if (!props.isActive) {
    className += " " + timerstyles['timer-inactive'];
  }
  if (props.time <= 0) {
    className += " " + timerstyles['timer-timeout'];
  }

  return (
    <div className={className}>
      {DEBUG &&
        <h1>{`side: ${props.player}`}</h1>
      }
      <h1
        className={timerstyles['timer-font']}
      >{formatTime(time)}</h1>
    </div>
  );
}

