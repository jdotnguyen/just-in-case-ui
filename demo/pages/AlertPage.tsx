import { useState } from 'react';
import { Alert, Button } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

function DismissibleExample() {
  const [visible, setVisible] = useState(true);
  return (
    <div className="stack-sm">
      {visible ? (
        <Alert tone="info" title="New version available" onDismiss={() => setVisible(false)}>
          Reload the page to get the latest improvements.
        </Alert>
      ) : (
        <div className="form-actions">
          <Button variant="secondary" size="sm" onClick={() => setVisible(true)}>
            Show the alert again
          </Button>
        </div>
      )}
    </div>
  );
}

function LiveExample() {
  const [errors, setErrors] = useState(0);
  return (
    <div className="stack-sm">
      <div className="form-actions">
        <Button variant="secondary" tone="destructive" onClick={() => setErrors((n) => n + 1)}>
          Simulate a failed save
        </Button>
      </div>
      {errors > 0 && (
        <Alert key={errors} tone="danger" title="Couldn't save your changes" live>
          Check your connection and try again. (Attempt {errors})
        </Alert>
      )}
    </div>
  );
}

export function AlertPage() {
  return (
    <>
      <Example
        title="Tones"
        description={
          <p>
            Each tone has its own icon and text, so meaning never depends on colour alone. Alerts are plain page content: screen
            readers find them by reading the page.
          </p>
        }
        layout="stack"
        code={`
<Alert tone="info" title="Heads up">Your trial ends in 3 days.</Alert>
<Alert tone="success" title="Payment received">Thanks!</Alert>
<Alert tone="warning" title="Storage almost full">You've used 92% of your space.</Alert>
<Alert tone="danger" title="Upload failed">The file is larger than 10 MB.</Alert>`}
      >
        <Alert tone="info" title="Heads up">
          Your trial ends in 3 days.
        </Alert>
        <Alert tone="success" title="Payment received">
          Thanks! A receipt is on its way to your inbox.
        </Alert>
        <Alert tone="warning" title="Storage almost full">
          You've used 92% of your space.
        </Alert>
        <Alert tone="danger" title="Upload failed">
          The file is larger than 10 MB.
        </Alert>
      </Example>

      <Example
        title="With an action"
        layout="stack"
        code={`<Alert tone="danger" title="Sync failed" action={{ label: 'Try again', onClick: retry }}>…</Alert>`}
      >
        <Alert
          tone="danger"
          title="Sync failed"
          action={{ label: 'Try again', onClick: () => {} }}
        >
          We couldn't reach the server. Your changes are saved on this device.
        </Alert>
      </Example>

      <Example
        title="Message only"
        description={<p>The title is optional for short messages.</p>}
        layout="stack"
        code={`<Alert tone="info">Changes are saved automatically.</Alert>`}
      >
        <Alert tone="info">Changes are saved automatically.</Alert>
      </Example>

      <Example
        title="Dismissible"
        layout="stack"
        code={`<Alert title="New version available" onDismiss={() => setVisible(false)}>…</Alert>`}
      >
        <DismissibleExample />
      </Example>

      <Example
        title="Announced to screen readers"
        description={
          <p>
            Static alerts stay quiet. Add <code>live</code> only when an alert <em>appears</em> after something the person did:
            errors and warnings use <code>role="alert"</code>, other tones <code>role="status"</code>.
          </p>
        }
        layout="stack"
        code={`{failed && <Alert tone="danger" title="Couldn't save" live>…</Alert>}`}
      >
        <LiveExample />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Reaches the action and dismiss buttons, when present.' },
              { keys: ['Enter', 'Space'], action: 'Activates the focused button.' },
            ],
          },
        ]}
      />

      <Notes title="Alert, toast or dialog?">
        <ul>
          <li><strong>Alert:</strong> stays on the page until the problem is gone or the person closes it. Use it for form-level errors and important notices.</li>
          <li><strong>Toast:</strong> a brief confirmation that doesn't need to be there later.</li>
          <li><strong>Alert dialog:</strong> something that must be answered before continuing.</li>
          <li>Don't set <code>live</code> on alerts that are already on the page when it loads, or screen readers will announce them on every visit.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'tone', type: "'info' | 'success' | 'warning' | 'danger'", defaultValue: "'info'", description: 'Icon and colour.' },
          { name: 'title', type: 'ReactNode', description: 'Short bold headline.' },
          { name: 'children', type: 'ReactNode', description: 'The message.' },
          { name: 'action', type: '{ label: string; onClick: () => void }', description: 'One optional button.' },
          { name: 'onDismiss', type: '() => void', description: 'Shows a Dismiss button.' },
          { name: 'live', type: 'boolean', defaultValue: 'false', description: 'Announce when it appears.' },
        ]}
      />
    </>
  );
}
