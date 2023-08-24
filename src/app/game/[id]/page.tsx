export default function GameRoom({ params }: { params: { id: string } }) {
  console.log(params);

  return (
    <main>
      <h1>
        { `welcome to game room: ${params.id}` }
      </h1>
    </main>
  );
}
