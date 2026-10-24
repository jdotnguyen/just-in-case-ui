import { describe, expect, it } from 'vitest';
import { contrastRatio } from '../utils/contrast';
import { readFileSync } from 'node:fs';

// Vitest runs from the project root, so a relative path works. Read the file directly: Vitest replaces imported CSS (even `?raw`) with an empty string.
const css = readFileSync('src/styles/tokens.css', 'utf8');

function token(name: string): string {
  const match = css.match(new RegExp(`--jic-${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`Token --jic-${name} is missing or not a hex colour`);
  return match[1];
}

// [foreground, background, minimum ratio, why]
const TEXT = 4.5;
const NON_TEXT = 3;
const pairs: Array<[string, string, number, string]> = [
  ['on-solid', 'action', TEXT, 'primary button label'],
  ['on-solid', 'action-hover', TEXT, 'primary button hover'],
  ['on-solid', 'action-active', TEXT, 'primary button pressed'],
  ['on-solid', 'danger', TEXT, 'destructive primary label'],
  ['on-solid', 'danger-hover', TEXT, 'destructive primary hover'],
  ['action', 'surface', TEXT, 'secondary/tertiary label'],
  ['action-active', 'action-soft', TEXT, 'secondary/tertiary hover'],
  ['danger', 'surface', TEXT, 'destructive secondary/tertiary label'],
  ['danger-hover', 'danger-soft', TEXT, 'destructive hover'],
  ['text', 'surface', TEXT, 'body text'],
  ['text', 'surface-muted', TEXT, 'body text on muted surface'],
  ['text-muted', 'surface', TEXT, 'helper text and placeholder'],
  ['danger', 'surface', TEXT, 'error message'],
  ['action-active', 'action-soft', TEXT, 'active dropdown option'],
  ['border', 'surface', NON_TEXT, 'input border'],
  ['action', 'surface', NON_TEXT, 'focus ring'],
  ['action', 'surface', NON_TEXT, 'checked checkbox / radio'],
  ['danger', 'surface', NON_TEXT, 'invalid checkbox / radio border'],
  ['success', 'surface', TEXT, 'success toast title and icon'],
  ['success', 'success-soft', TEXT, 'success badge'],
  ['warning', 'surface', TEXT, 'warning icon and border on page'],
  ['warning', 'warning-soft', TEXT, 'warning alert title and icon'],
  ['text', 'warning-soft', TEXT, 'warning alert body'],
  ['surface', 'text', TEXT, 'tooltip text on its dark surface'],
  ['border', 'surface', NON_TEXT, 'switch off track and thumb'],
  ['on-solid', 'action', NON_TEXT, 'switch thumb on the on track'],
];

describe('design tokens', () => {
  it.each(pairs)('%s on %s meets %s:1 (%s)', (fg, bg, min) => {
    expect(contrastRatio(token(`color-${fg}`), token(`color-${bg}`))).toBeGreaterThanOrEqual(min);
  });

  it('uses soft rounded corners', () => {
    expect(css).toMatch(/--jic-radius-control:\s*10px/);
    expect(css).toMatch(/--jic-radius-surface:\s*12px/);
    expect(css).toMatch(/--jic-radius-checkbox:\s*6px/);
    expect(css).toMatch(/--jic-radius-pill:\s*999px/);
  });

  it('turns off motion for reduced-motion users', () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce[\s\S]*--jic-duration:\s*0ms/);
  });
});
