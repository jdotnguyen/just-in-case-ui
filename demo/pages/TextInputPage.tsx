import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, TextInput } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(value: string): string | undefined {
  if (!value.trim()) return 'Enter your email address.';
  if (!EMAIL_PATTERN.test(value)) return 'Enter an email address like name@example.com.';
  return undefined;
}

function LiveValidationExample() {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const error = touched ? validateEmail(email) : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setTouched(true);
    if (validateEmail(email)) {
      setStatus('');
      // Send people straight to the field that needs fixing.
      inputRef.current?.focus();
      return;
    }
    setStatus(`Thanks! We'll send updates to ${email}.`);
  }

  return (
    <form className="demo-form" onSubmit={handleSubmit} noValidate>
      <TextInput
        ref={inputRef}
        label="Email"
        type="email"
        autoComplete="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setStatus('');
        }}
        onBlur={() => setTouched(true)}
        helperText="We'll only use this for product updates."
        error={error}
      />
      <div className="form-actions">
        <Button type="submit">Subscribe</Button>
      </div>
      <p className="action-log" role="status">
        {status}
      </p>
    </form>
  );
}

export function TextInputPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>Every input has a visible label. Clicking the label focuses the field.</p>}
        layout="grid"
        code={`<TextInput label="Full name" autoComplete="name" />`}
      >
        <TextInput label="Full name" autoComplete="name" />
        <TextInput label="Search" type="search" placeholder="Try “dropdown”" />
      </Example>

      <Example
        title="Helper text"
        description={<p>Helper text is linked with <code>aria-describedby</code>, so it's read when the field is focused.</p>}
        layout="grid"
        code={`<TextInput label="Email" type="email" helperText="We'll only use this to send your receipt." />`}
      >
        <TextInput
          label="Email"
          type="email"
          autoComplete="email"
          helperText="We'll only use this to send your receipt."
        />
      </Example>

      <Example
        title="Required"
        description={
          <p>
            The asterisk is visual only. The native <code>required</code> attribute tells screen
            readers, so “required” isn't announced twice.
          </p>
        }
        layout="grid"
        code={`<TextInput label="Username" required />`}
      >
        <TextInput label="Username" required autoComplete="username" />
      </Example>

      <Example
        title="Error"
        description={
          <p>
            Errors set <code>aria-invalid</code> and are described first. They use text and an icon,
            not just red.
          </p>
        }
        layout="grid"
        code={`<TextInput label="Postal code" defaultValue="K1A" error="Enter a full postal code, like K1A 0B1." />`}
      >
        <TextInput
          label="Postal code"
          defaultValue="K1A"
          autoComplete="postal-code"
          helperText="Canadian format: A1A 1A1."
          error="Enter a full postal code, like K1A 0B1."
        />
      </Example>

      <Example
        title="Disabled and read-only"
        description={<p>Disabled fields can't be focused. Read-only fields can be focused and copied, but not edited.</p>}
        layout="grid"
        code={`
<TextInput label="Account ID" disabled defaultValue="ACC-0042" />
<TextInput label="Invite link" readOnly defaultValue="https://example.com/i/just-in-case" />`}
      >
        <TextInput label="Account ID" disabled defaultValue="ACC-0042" />
        <TextInput label="Invite link" readOnly defaultValue="https://example.com/i/just-in-case" />
      </Example>

      <Example
        title="Validation on blur and submit"
        description={
          <p>
            The error appears after you leave the field or submit. On a failed submit, focus moves
            back to the field.
          </p>
        }
        layout="stack"
      >
        <LiveValidationExample />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves focus into and out of the field.' },
              { keys: ['Typing'], action: 'Standard text editing. Nothing is overridden.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>Placeholders are hints, never labels. A label is always rendered.</li>
          <li>Inputs use a 16px font, so iOS won't zoom in on focus.</li>
          <li>Pass <code>autoComplete</code> for personal data (WCAG 1.3.5).</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'helperText', type: 'ReactNode', description: 'Guidance under the field.' },
          { name: 'error', type: 'ReactNode', description: 'Error message; marks the field invalid.' },
          { name: 'required', type: 'boolean', defaultValue: 'false', description: 'Native required plus a visual mark.' },
          { name: 'wrapperClassName', type: 'string', description: 'Class name for the outer wrapper.' },
          { name: '…input props', type: 'InputHTMLAttributes', description: 'type, name, value, onChange, autoComplete and the rest.' },
        ]}
      />
    </>
  );
}
