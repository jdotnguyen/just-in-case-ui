import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dialog, Dropdown, TextInput } from '../../src';
import type { DialogSize } from '../../src';
import { useActionLog } from '../components/ActionLog';
import { Example, Notes } from '../components/Example';
import { TrashIcon } from '../components/icons';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

type Say = (message: string) => void;

function BasicExample({ say }: { say: Say }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        What is Just In Case UI?
      </Button>
      <Dialog
        open={open}
        onClose={(reason) => {
          say(`Dialog closed (${reason}).`);
          setOpen(false);
        }}
        title="About Just In Case UI"
        footer={
          <Button
            onClick={() => {
              say('Dialog closed (Got it).');
              setOpen(false);
            }}
          >
            Got it
          </Button>
        }
      >
        <p>
          A small React component library built just in case anyone needs it, so everyone can use it.
          Every component works with a keyboard and a screen reader, and meets WCAG 2.2 AA contrast.
        </p>
        <p>Close this with Escape, the × button, a click outside, or “Got it”.</p>
      </Dialog>
    </>
  );
}

function DestructiveExample({ say }: { say: Say }) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <Button tone="destructive" startIcon={<TrashIcon />} onClick={() => setOpen(true)}>
        Delete project
      </Button>
      <Dialog
        role="alertdialog"
        open={open}
        onClose={(reason) => {
          say(`Kept the project (${reason}).`);
          setOpen(false);
        }}
        title="Delete “Pokédex”?"
        description="This permanently deletes the project and its 24 files. You can't undo this."
        initialFocusRef={cancelRef}
        size="sm"
        footer={
          <>
            <Button
              ref={cancelRef}
              variant="secondary"
              onClick={() => {
                say('Kept the project (Cancel).');
                setOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              tone="destructive"
              onClick={() => {
                say('Deleted “Pokédex”. (Not really, it’s a demo.)');
                setOpen(false);
              }}
            >
              Delete project
            </Button>
          </>
        }
      />
    </>
  );
}

const roles = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'editor', label: 'Editor' },
  { value: 'admin', label: 'Admin' },
];

function FormExample({ say }: { say: Say }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>('editor');
  const [error, setError] = useState<string>();
  const emailRef = useRef<HTMLInputElement>(null);

  function close() {
    setOpen(false);
    setEmail('');
    setError(undefined);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter an email address like name@example.com.');
      emailRef.current?.focus();
      return;
    }
    say(`Invited ${email} as ${roles.find((r) => r.value === role)?.label ?? 'Viewer'}.`);
    close();
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>Invite teammate</Button>
      <Dialog
        open={open}
        onClose={close}
        title="Invite a teammate"
        description="They'll get an email with a link to join."
        footer={
          <>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" form="invite-form">
              Send invite
            </Button>
          </>
        }
      >
        <form id="invite-form" className="dialog-form" onSubmit={handleSubmit} noValidate>
          <TextInput
            ref={emailRef}
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(undefined);
            }}
            error={error}
          />
          <Dropdown label="Role" options={roles} value={role} onChange={setRole} />
        </form>
      </Dialog>
    </>
  );
}

function LongExample({ say }: { say: Say }) {
  const [open, setOpen] = useState(false);
  const decide = (choice: string) => () => {
    say(`Terms ${choice}.`);
    setOpen(false);
  };
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Read the terms
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Terms of service"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={decide('declined')}>
              Decline
            </Button>
            <Button onClick={decide('accepted')}>Accept</Button>
          </>
        }
      >
        {Array.from({ length: 12 }, (_, i) => (
          <section key={i} className="terms-section">
            <h3>{i + 1}. Section heading</h3>
            <p>
              This is placeholder text for a long dialog. The body scrolls while the title and the
              action buttons stay in view, so people never lose track of where they are or what they
              can do.
            </p>
          </section>
        ))}
      </Dialog>
    </>
  );
}

function SizesExample() {
  const [size, setSize] = useState<DialogSize | null>(null);
  return (
    <>
      {(['sm', 'md', 'lg'] as const).map((s) => (
        <Button key={s} variant="secondary" onClick={() => setSize(s)}>
          Open {s === 'sm' ? 'small' : s === 'md' ? 'medium' : 'large'}
        </Button>
      ))}
      <Dialog
        open={size !== null}
        onClose={() => setSize(null)}
        size={size ?? 'md'}
        title={`${size === 'sm' ? 'Small' : size === 'lg' ? 'Large' : 'Medium'} dialog`}
        description={`${size === 'sm' ? '400' : size === 'lg' ? '720' : '560'}px wide, and never wider than the screen minus 32px.`}
        footer={<Button onClick={() => setSize(null)}>Done</Button>}
      />
    </>
  );
}

function NoCloseButtonExample({ say }: { say: Say }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Simulate session timeout
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          say('Stayed signed in (Escape).');
          setOpen(false);
        }}
        title="Still there?"
        description="You'll be signed out in 2 minutes to keep your account safe."
        hideCloseButton
        closeOnBackdropClick={false}
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                say('Signed out.');
                setOpen(false);
              }}
            >
              Sign out
            </Button>
            <Button
              onClick={() => {
                say('Stayed signed in.');
                setOpen(false);
              }}
            >
              Stay signed in
            </Button>
          </>
        }
      />
    </>
  );
}

export function DialogPage() {
  const [log, say] = useActionLog('Open a dialog. What happens will be reported here.');

  return (
    <>
      {log}

      <Example
        title="Basic"
        description={<p>Focus moves into the dialog, Tab stays inside it, and focus comes back to the button when it closes.</p>}
        code={`
const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Open</Button>
<Dialog
  open={open}
  onClose={() => setOpen(false)}
  title="About Just In Case UI"
  footer={<Button onClick={() => setOpen(false)}>Got it</Button>}
>
  …
</Dialog>`}
      >
        <BasicExample say={say} />
      </Example>

      <Example
        title="Confirm a destructive action"
        description={
          <p>
            An <code>alertdialog</code>: it needs a description and ignores backdrop clicks. Focus starts on
            Cancel, so pressing Enter by accident is safe.
          </p>
        }
        code={`
const cancelRef = useRef<HTMLButtonElement>(null);

<Dialog
  role="alertdialog"
  open={open}
  onClose={() => setOpen(false)}
  title="Delete “Pokédex”?"
  description="This permanently deletes the project and its 24 files. You can't undo this."
  initialFocusRef={cancelRef}
  size="sm"
  footer={<>
    <Button ref={cancelRef} variant="secondary" onClick={cancel}>Cancel</Button>
    <Button tone="destructive" onClick={deleteProject}>Delete project</Button>
  </>}
/>`}
      >
        <DestructiveExample say={say} />
      </Example>

      <Example
        title="With a form"
        description={<p>Focus lands on the first field. The footer's submit button is linked to the form with <code>form="…"</code>.</p>}
        code={`
<Dialog open={open} onClose={close} title="Invite a teammate"
  footer={<>
    <Button variant="secondary" onClick={close}>Cancel</Button>
    <Button type="submit" form="invite-form">Send invite</Button>
  </>}>
  <form id="invite-form" onSubmit={handleSubmit}>
    <TextInput label="Email" type="email" required />
    <Dropdown label="Role" options={roles} />
  </form>
</Dialog>`}
      >
        <FormExample say={say} />
      </Example>

      <Example
        title="Long content"
        description={<p>The body scrolls while the header and footer stay put.</p>}
      >
        <LongExample say={say} />
      </Example>

      <Example title="Sizes" code={`<Dialog size="sm" … />  // 400px · md (default) 560px · lg 720px`}>
        <SizesExample />
      </Example>

      <Example
        title="Without a close button"
        description={
          <p>
            For a decision that needs an explicit answer, hide the × and turn off backdrop clicks. Escape still
            works unless you turn it off with <code>closeOnEscape={'{false}'}</code>.
          </p>
        }
        code={`<Dialog hideCloseButton closeOnBackdropClick={false} … />`}
      >
        <NoCloseButtonExample say={say} />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab', 'Shift + Tab'], action: 'Moves between the controls inside the dialog. Focus never reaches the page behind it.' },
              { keys: ['Escape'], action: 'Asks to close the dialog (onClose("escape")).' },
              { keys: ['Enter', 'Space'], action: 'Activates the focused button.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>Built on the native <code>&lt;dialog&gt;</code> with <code>showModal()</code>: the page behind is inert, and the dialog sits in the top layer above everything.</li>
          <li>The title names the dialog and the description describes it, so both are announced on open.</li>
          <li>The dialog never closes on its own. It calls <code>onClose(reason)</code>, and you decide by setting <code>open</code>.</li>
          <li>Page scrolling is locked while it's open, and there's no animation for people who prefer reduced motion.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'open', type: 'boolean', description: 'Whether the dialog is shown.' },
          { name: 'onClose', type: "(reason: 'escape' | 'backdrop' | 'close-button') => void", description: 'Called when the user asks to close.' },
          { name: 'title', type: 'ReactNode', description: 'Required; names the dialog.' },
          { name: 'description', type: 'ReactNode', description: 'Describes the dialog. Required for alertdialog.' },
          { name: 'role', type: "'dialog' | 'alertdialog'", defaultValue: "'dialog'", description: 'Use alertdialog for urgent confirmations.' },
          { name: 'footer', type: 'ReactNode', description: 'Action buttons, in reading order.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: '400, 560 or 720px wide.' },
          { name: 'initialFocusRef / returnFocusRef', type: 'RefObject<HTMLElement>', description: 'Where focus goes on open and on close.' },
          { name: 'closeOnEscape', type: 'boolean', defaultValue: 'true', description: 'Escape asks to close.' },
          { name: 'closeOnBackdropClick', type: 'boolean', defaultValue: 'true (false for alertdialog)', description: 'A click outside asks to close.' },
          { name: 'hideCloseButton', type: 'boolean', defaultValue: 'false', description: 'Hides the × button.' },
        ]}
      />
    </>
  );
}
