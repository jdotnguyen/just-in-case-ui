// Minimal typing for the one Node API the token test uses, so the project
// doesn't need all of @types/node.
declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8'): string;
}
