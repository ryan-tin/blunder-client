import { boardSquare, coordinateType, pieceType } from "@/types/Types";

export function pieceToChessNotation(piece: pieceType): string {
  if (piece === 'p' || piece === 'P') {
    return "";
  } else {
    return piece.toUpperCase();
  }
}

export function coordToChessNotation(coordinate: coordinateType): boardSquare | null {
  if (coordinate === null) {
    return null;
  }
  const coordComponents = coordinate.split(',');
  const rank = parseInt(coordComponents[0]);
  const file = parseInt(coordComponents[1]);

  const t1 = String.fromCharCode('a'.charCodeAt(0) + file);
  const t2 = (rank + 1).toString();

  return `${t1}${t2}` as boardSquare;
}
