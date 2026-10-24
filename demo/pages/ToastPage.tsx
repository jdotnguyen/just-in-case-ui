import { Button, useToast } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

function Triggers() {
  const { toast } = useToast();
  return (
    <>
      <Button
        variant="secondary"
        onClick={() => toast({ title: 'Settings saved', description: 'Your changes are live.' })}
      >
        Info toast
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ title: 'Message sent', tone: 'success' })}
      >
        Success toast
      </Button>
      <Button
        variant="secondary"
        tone="destructive"
        onClick={() =>
          toast({
            title: 'Upload failed',
            description: 'The file is larger than 10 MB.',
            tone: 'danger',
          })
        }
      >
        Error toast
      </Button>
    </>
  );
}

function ActionTrigger() {
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        toast({
          title: 'Conversation archived',
          action: {
            label: 'Undo',
            onClick: () => toast({ title: 'Archive undone', tone: 'success' }),
          },
        });
      }}
    >
      Archive conversation
    </Button>
  );
}

function DurationTriggers() {
  const { toast } = useToast();
  return (
    <>
      <Button variant="secondary" onClick={() => toast({ title: 'Quick note', duration: 2500 })}>
        2.5 seconds
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ title: 'Stays until dismissed', duration: null })}
      >
        Until dismissed
      </Button>
    </>
  );
}

function StackTrigger() {
  const { toast } = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => {
        for (let i = 1; i <= 7; i += 1) toast({ title: `Notification ${i}`, duration: null });
      }}
    >
      Show seven
    </Button>
  );
}

export function ToastPage() {
  return (
    <>
      <Example
        title="Tones"
        description={
          <p>
            Info and success are announced politely, when the screen reader finishes what it's saying. Errors are announced
            immediately. Each tone has its own icon, not just a colour.
          </p>
        }
        code={`
const { toast } = useToast();
toast({ title: 'Settings saved', description: 'Your changes are live.' });
toast({ title: 'Message sent', tone: 'success' });
toast({ title: 'Upload failed', tone: 'danger' });`}
      >
        <Triggers />
      </Example>

      <Example
        title="With an action"
        description={<p>Toasts with an action stay until dismissed, so there's time to use it. Running the action closes the toast.</p>}
        code={`
toast({
  title: 'Conversation archived',
  action: { label: 'Undo', onClick: restore },
});`}
      >
        <ActionTrigger />
      </Example>

      <Example
        title="Duration"
        description={<p>Info and success disappear after 6 seconds. Hover or focus a toast to pause it; it restarts the full time when you leave.</p>}
        code={`
toast({ title: 'Quick note', duration: 2500 });
toast({ title: 'Stays until dismissed', duration: null });`}
      >
        <DurationTriggers />
      </Example>

      <Example
        title="Limit"
        description={<p>Only the five newest toasts are kept, so the screen never fills up.</p>}
      >
        <StackTrigger />
      </Example>

      <Example
        title="Setup"
        description={<p>Wrap your app once, then call <code>useToast()</code> from any component below it.</p>}
        code={`
<ToastProvider>
  <App />
</ToastProvider>`}
      >
        <span className="muted">This demo is already wrapped in a ToastProvider.</span>
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Toasts are at the end of the page. Their buttons are reached after the page content.' },
              { keys: ['Enter', 'Space'], action: 'Activates the action or dismiss button.' },
              { keys: ['Escape'], action: 'Dismisses the toast that contains focus and returns focus to where you were.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>Two live regions (<code>role="status"</code> and <code>role="alert"</code>) are always in the page, so screen readers pick up new toasts reliably.</li>
          <li>Toasts that vanish are a problem for people who read slowly or use magnifiers: hovering or focusing pauses the timer, and errors never time out.</li>
          <li>Don't put anything essential in a toast only. Errors that block progress should also appear next to the thing that failed.</li>
          <li>Toasts sit outside any modal dialog, which makes them inert while a dialog is open. Announce errors inside the dialog instead.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'title', type: 'ReactNode', description: 'Short headline.' },
          { name: 'description', type: 'ReactNode', description: 'Optional detail.' },
          { name: 'tone', type: "'info' | 'success' | 'danger'", defaultValue: "'info'", description: 'Appearance and announcement urgency.' },
          { name: 'duration', type: 'number | null', defaultValue: '6000', description: 'Milliseconds before auto-dismiss; null stays. Danger and action toasts default to null.' },
          { name: 'action', type: '{ label: string; onClick: () => void }', description: 'One optional action.' },
          { name: 'toast(options)', type: 'string', description: 'Returns the toast id.' },
          { name: 'dismiss(id)', type: 'void', description: 'Removes a toast.' },
        ]}
      />
    </>
  );
}
