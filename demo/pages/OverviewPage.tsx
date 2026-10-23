import { useEffect, useState } from 'react';
import { Button, contrastRatio } from '../../src';
import { Example, Notes } from '../components/Example';

interface Swatch {
  token: string;
  name: string;
  /** Token the swatch is checked against, and what for. */
  against: string;
  use: string;
  min: number;
}

const swatches: Swatch[] = [
  { token: 'color-action', name: 'Action', against: 'color-on-solid', use: 'White label on primary buttons', min: 4.5 },
  { token: 'color-action-hover', name: 'Action hover', against: 'color-on-solid', use: 'White label on hover', min: 4.5 },
  { token: 'color-action-soft', name: 'Action soft', against: 'color-action-active', use: 'Hover tint behind blue text', min: 4.5 },
  { token: 'color-danger', name: 'Danger', against: 'color-on-solid', use: 'White label on destructive buttons', min: 4.5 },
  { token: 'color-danger-hover', name: 'Danger hover', against: 'color-on-solid', use: 'White label on hover', min: 4.5 },
  { token: 'color-danger-soft', name: 'Danger soft', against: 'color-danger-hover', use: 'Hover tint behind red text', min: 4.5 },
  { token: 'color-text', name: 'Text', against: 'color-surface', use: 'Body text on white', min: 4.5 },
  { token: 'color-text-muted', name: 'Text muted', against: 'color-surface', use: 'Helper text and placeholders', min: 4.5 },
  { token: 'color-border', name: 'Border', against: 'color-surface', use: 'Input borders (non-text, 3:1)', min: 3 },
];

function readToken(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(`--jic-${name}`).trim();
}

function SwatchCard({ swatch }: { swatch: Swatch }) {
  const [values, setValues] = useState<{ hex: string; ratio: number } | null>(null);

  useEffect(() => {
    // Read the live token values, so this page always reflects tokens.css.
    const hex = readToken(swatch.token);
    const other = readToken(swatch.against);
    if (/^#[0-9a-f]{6}$/i.test(hex) && /^#[0-9a-f]{6}$/i.test(other)) {
      setValues({ hex, ratio: contrastRatio(hex, other) });
    }
  }, [swatch]);

  const passes = values ? values.ratio >= swatch.min : false;

  return (
    <li className="swatch">
      <div className="swatch-chip" style={{ background: `var(--jic-${swatch.token})` }} aria-hidden="true">
        <span style={{ color: `var(--jic-${swatch.against})` }}>Aa</span>
      </div>
      <div className="swatch-body">
        <p className="swatch-name">{swatch.name}</p>
        <p className="swatch-token">
          <code>--jic-{swatch.token}</code>
        </p>
        <p className="swatch-meta">{swatch.use}</p>
        {values && (
          <p className="swatch-meta">
            <code>{values.hex.toUpperCase()}</code> ·{' '}
            <span className={passes ? 'badge badge-pass' : 'badge badge-fail'}>
              {values.ratio.toFixed(2)}:1 {passes ? 'passes AA' : 'fails AA'}
            </span>
          </p>
        )}
      </div>
    </li>
  );
}

export function OverviewPage() {
  return (
    <>
      <Example
        title="Getting started"
        layout="stack"
        code={`
npm install just-in-case-ui

// once, at your app's entry point
import 'just-in-case-ui/styles.css';

import { Button, TextInput, Dropdown } from 'just-in-case-ui';

<Button onClick={save}>Save changes</Button>`}
      >
        <p className="intro">
          Six components so far, all built native-first and tested with keyboard and screen readers in
          mind. Use the menu to explore each one on its own page.
        </p>
        <ul className="pill-list">
          <li><a href="#/button">Button</a></li>
          <li><a href="#/text-input">Text input</a></li>
          <li><a href="#/dropdown">Dropdown</a></li>
          <li><a href="#/checkbox">Checkbox</a></li>
          <li><a href="#/radio-group">Radio group</a></li>
          <li><a href="#/dialog">Dialog</a></li>
        </ul>
      </Example>

      <Example
        title="Colour"
        description={
          <p>
            Soft blue for actions and red for destructive actions. Every pairing is checked against
            WCAG 2.2 AA, and the ratios below are calculated live from the tokens.
          </p>
        }
        layout="stack"
      >
        <ul className="swatches">
          {swatches.map((swatch) => (
            <SwatchCard key={swatch.token} swatch={swatch} />
          ))}
        </ul>
      </Example>

      <Example
        title="Shape"
        description={<p>Soft, rounded corners: 10px on controls, 12px on popups and 8px on list options.</p>}
      >
        <div className="radius-demo" style={{ borderRadius: 'var(--jic-radius-control)' }}>
          <code>--jic-radius-control</code>
          <span>10px</span>
        </div>
        <div className="radius-demo" style={{ borderRadius: 'var(--jic-radius-surface)' }}>
          <code>--jic-radius-surface</code>
          <span>12px</span>
        </div>
        <div className="radius-demo" style={{ borderRadius: 'var(--jic-radius-option)' }}>
          <code>--jic-radius-option</code>
          <span>8px</span>
        </div>
      </Example>

      <Example
        title="Focus ring"
        description={
          <p>
            A 2px blue outline with a 2px gap, shown when you use the keyboard. It's the same on every
            control, including destructive ones. Press Tab to see it.
          </p>
        }
      >
        <Button variant="secondary">Tab to me</Button>
        <Button tone="destructive">And me</Button>
      </Example>

      <Notes title="Principles">
        <ul>
          <li><strong>Native first.</strong> A real <code>&lt;button&gt;</code> and a real <code>&lt;input&gt;</code>. ARIA only where HTML has no equivalent (the dropdown).</li>
          <li><strong>Never colour alone.</strong> Errors have text and an icon, and destructive buttons say what they destroy.</li>
          <li><strong>Keyboard complete.</strong> Everything works without a mouse, with a visible focus ring.</li>
          <li><strong>Respect preferences.</strong> Reduced motion turns off transitions. Windows High Contrast keeps every state visible.</li>
          <li><strong>Overridable.</strong> Every value is a <code>--jic-*</code> CSS variable you can override.</li>
        </ul>
      </Notes>
    </>
  );
}
