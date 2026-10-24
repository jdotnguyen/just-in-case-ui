import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, PasswordInput } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

function SignUpForm() {
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState(false);
  const [done, setDone] = useState('');
  const error = touched && password.length < 12 ? 'Use at least 12 characters.' : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (password.length < 12) {
      setDone('');
      event.currentTarget.querySelector<HTMLInputElement>('input')?.focus();
      return;
    }
    setDone('Account created.');
  }

  return (
    <form className="demo-form" onSubmit={handleSubmit} noValidate>
      <PasswordInput
        label="New password"
        autoComplete="new-password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        onBlur={() => setTouched(true)}
        helperText="At least 12 characters."
        error={error}
      />
      <div className="form-actions">
        <Button type="submit">Create account</Button>
      </div>
      <p className="action-log" role="status">
        {done}
      </p>
    </form>
  );
}

export function PasswordInputPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>The eye button shows or hides what you typed. Focus stays on the button and nothing you typed changes.</p>}
        layout="grid"
        code={`<PasswordInput label="Password" />`}
      >
        <PasswordInput label="Password" />
      </Example>

      <Example
        title="Helper text and required"
        layout="grid"
        code={`<PasswordInput label="Password" required helperText="At least 12 characters." autoComplete="new-password" />`}
      >
        <PasswordInput
          label="Password"
          required
          helperText="At least 12 characters."
          autoComplete="new-password"
        />
      </Example>

      <Example title="Error and disabled" layout="grid">
        <PasswordInput label="Password" defaultValue="short" error="Use at least 12 characters." />
        <PasswordInput label="Password" disabled placeholder="Unavailable" />
      </Example>

      <Example
        title="In a form"
        description={<p>Use <code>autoComplete="new-password"</code> when creating a password and <code>"current-password"</code> (the default) when signing in, so password managers behave.</p>}
        layout="stack"
      >
        <SignUpForm />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves from the field to the Show password button, then on.' },
              { keys: ['Enter', 'Space'], action: 'On the button: shows or hides the password.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>The button is always named "Show password" and uses <code>aria-pressed</code> for its state. A name that changes as well as a state would be announced as a contradiction.</li>
          <li>The icon also changes (a slash while visible), so sighted users see the state without colour.</li>
          <li>Don't block pasting into password fields: it breaks password managers, which many people rely on.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'helperText / error', type: 'ReactNode', description: 'Same as TextInput.' },
          { name: 'autoComplete', type: 'string', defaultValue: "'current-password'", description: "Use 'new-password' when creating one." },
          { name: 'required / disabled', type: 'boolean', defaultValue: 'false', description: 'Native attributes. Disabled also disables the toggle.' },
          { name: '…input props', type: 'InputHTMLAttributes', description: 'value, onChange, name and the rest (not type).' },
        ]}
      />
    </>
  );
}
