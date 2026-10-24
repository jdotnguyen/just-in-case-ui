import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

// Keeps the version shown in the kitchen-sink sidebar in step with package.json.
describe('demo version', () => {
  it('matches the version in package.json', () => {
    const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
    const app = readFileSync('demo/App.tsx', 'utf8');
    expect(app).toContain(`Kitchen sink · v${version}`);
  });
});
