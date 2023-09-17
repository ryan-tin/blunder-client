import Game from "@/components/Game";
import { playerType } from "@/types/Types";

const DEBUG = false;

export default function GameRoom({ params }: {
  params: {
    id: string,
    perspective: string
    time: number
    increment: number
  }
}) {

  return (
    <main>
      <h1>
        {DEBUG && `welcome to game room: ${params.id}`}
      </h1>
      <Game
        perspective={params.perspective as playerType}
        roomId={params.id}
        timeControl={{
          totalTime: params.time,
          increment: params.increment
        }}
      />
    </main>
  );
}
