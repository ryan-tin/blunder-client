export function isLetter(input: string): boolean {
  const letterRegex = /^[A-Za-z]{1}$/;
  return letterRegex.test(input);
}
