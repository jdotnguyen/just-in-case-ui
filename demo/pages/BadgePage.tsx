import { Badge } from '../../src';
import { Example, Notes } from '../components/Example';
import { PropsTable } from '../components/KeyboardTable';

const CheckIcon = () => (
  <svg viewBox="0 0 20 20" focusable="false">
    <path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function BadgePage() {
  return (
    <>
      <Example
        title="Tones"
        description={<p>Each badge has words, so the meaning never depends on colour alone.</p>}
        code={`
<Badge>Draft</Badge>
<Badge tone="info">In review</Badge>
<Badge tone="success">Paid</Badge>
<Badge tone="warning">Overdue</Badge>
<Badge tone="danger">Failed</Badge>`}
      >
        <Badge>Draft</Badge>
        <Badge tone="info">In review</Badge>
        <Badge tone="success">Paid</Badge>
        <Badge tone="warning">Overdue</Badge>
        <Badge tone="danger">Failed</Badge>
      </Example>

      <Example
        title="With an icon"
        description={<p>Icons are decorative and hidden from screen readers; the text says it all.</p>}
        code={`<Badge tone="success" icon={<CheckIcon />}>Verified</Badge>`}
      >
        <Badge tone="success" icon={<CheckIcon />}>
          Verified
        </Badge>
      </Example>

      <Example
        title="In context"
        description={<p>A badge next to a heading becomes part of its name, so keep the text short.</p>}
        layout="stack"
      >
        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          Invoice #1042 <Badge tone="warning">Overdue</Badge>
        </h3>
      </Example>

      <Notes title="Accessibility notes">
        <ul>
          <li>A badge is just text in a span. It isn't focusable and has no role, so it reads as part of the surrounding content.</li>
          <li>Don't use it as a button. If it needs to be clickable, use a Button or Link.</li>
          <li>Every tone's text meets 4.5:1 contrast on its background.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'children', type: 'ReactNode', description: 'The text. Required.' },
          { name: 'tone', type: "'neutral' | 'info' | 'success' | 'warning' | 'danger'", defaultValue: "'neutral'", description: 'Colour set.' },
          { name: 'icon', type: 'ReactNode', description: 'Decorative icon before the text.' },
        ]}
      />
    </>
  );
}
