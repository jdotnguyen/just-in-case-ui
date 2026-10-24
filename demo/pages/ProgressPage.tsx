import { useEffect, useState } from 'react';
import { Button, Progress } from '../../src';
import { Example, Notes } from '../components/Example';
import { PropsTable } from '../components/KeyboardTable';

function LiveProgress() {
  const [value, setValue] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => {
      setValue((current) => {
        if (current >= 100) {
          setRunning(false);
          return 100;
        }
        return current + 5;
      });
    }, 250);
    return () => clearInterval(timer);
  }, [running]);

  return (
    <div className="stack-sm">
      <Progress label="Uploading photos" value={value} showValue />
      <div className="form-actions">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            setValue(0);
            setRunning(true);
          }}
        >
          {value === 100 ? 'Run again' : 'Start'}
        </Button>
      </div>
    </div>
  );
}

export function ProgressPage() {
  return (
    <>
      <Example
        title="Determinate"
        description={<p>When you know how far along things are, pass a <code>value</code>.</p>}
        layout="stack"
        code={`<Progress label="Uploading photos" value={40} showValue />`}
      >
        <Progress label="Uploading photos" value={40} showValue />
        <Progress label="Storage used" value={92} showValue />
        <Progress label="Complete" value={100} showValue />
      </Example>

      <Example
        title="Custom range and spoken text"
        description={<p>Use <code>max</code> and <code>valueText</code> when "percent" isn't how people think about it.</p>}
        layout="stack"
        code={`<Progress label="Files" value={3} max={12} valueText="3 of 12 files" />`}
      >
        <Progress label="Files" value={3} max={12} valueText="3 of 12 files" />
      </Example>

      <Example
        title="Indeterminate"
        description={<p>When you can't tell how long it will take. It stops moving for people who prefer reduced motion.</p>}
        layout="stack"
        code={`<Progress label="Preparing your report" />`}
      >
        <Progress label="Preparing your report" />
      </Example>

      <Example title="Live" layout="stack">
        <LiveProgress />
      </Example>

      <Notes title="Accessibility notes">
        <ul>
          <li>It uses <code>role="progressbar"</code> with <code>aria-valuemin</code>, <code>aria-valuemax</code> and <code>aria-valuenow</code>. An indeterminate bar leaves out <code>aria-valuenow</code>, which is how screen readers know the value is unknown.</li>
          <li>Screen readers don't announce progress as it changes. For long tasks, also announce milestones with a status message or toast, and the finish.</li>
          <li>The label is always visible, and the track has a border so its full length is visible too.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'value', type: 'number', description: 'Current amount. Leave out for indeterminate.' },
          { name: 'max', type: 'number', defaultValue: '100', description: 'The amount that means done.' },
          { name: 'showValue', type: 'boolean', defaultValue: 'false', description: 'Shows the percentage.' },
          { name: 'valueText', type: 'string', description: 'Spoken instead of the number.' },
        ]}
      />
    </>
  );
}
