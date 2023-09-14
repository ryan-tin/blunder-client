import Game from "@/components/Game";
import { playerType } from "@/types/Types";

const DEBUG = false;

export default function GameRoom({ params }: {
  params: {
    id: string,
    perspective: string
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
      />
    </main>
  );
}
