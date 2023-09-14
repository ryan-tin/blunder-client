import { coordinateType } from "@/types/Types";

/** 
  * @returns true if the input is a letter
  */
export function isLetter(input: string): boolean {
  const letterRegex = /^[A-Za-z]{1}$/;
  return letterRegex.test(input);
}

/**
  * utility function that parses the a coordinate into its component parts
  * a coordinate has format '{rank},{file}'
  * @returns an object with {rank: rank, file: file}
  */
export function getCoordFromCoordType(coordinate: coordinateType) {
  const matches = /(?<rank>[\d]),(?<file>[\d])/.exec(coordinate!);
  const rank = matches?.groups!.rank!;
  const file = matches?.groups!.file!;
  return {
    rank: rank,
    file: file
  }
}
