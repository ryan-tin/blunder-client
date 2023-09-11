import Game from "@/components/Game";
import { playerType } from "@/types/Types";

export default function GameRoom({ params }: {
  params: {
    id: string,
    perspective: string
  }
}) {
  // console.log('params', params);

  return (
    <main>
      <h1>
        {`welcome to game room: ${params.id}`}
      </h1>
      <Game
        perspective={params.perspective as playerType}
        roomId={params.id}
      />
    </main>
  );
}
