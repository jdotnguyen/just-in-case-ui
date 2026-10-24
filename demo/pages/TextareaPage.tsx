import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Textarea } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState('');
  const error =
    touched && message.trim().length < 10
      ? 'Please write at least 10 characters so we can help.'
      : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (message.trim().length < 10) {
      setResult('');
      // Send people straight to the field that needs fixing.
      event.currentTarget.querySelector('textarea')?.focus();
      return;
    }
    setResult(`Thanks! We received ${message.trim().length} characters of feedback.`);
  }

  return (
    <form className="demo-form" onSubmit={handleSubmit} noValidate>
      <Textarea
        label="Your feedback"
        required
        maxLength={280}
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onBlur={() => setTouched(true)}
        helperText="What worked, and what didn't?"
        error={error}
      />
      <div className="form-actions">
        <Button type="submit">Send feedback</Button>
      </div>
      <p className="action-log" role="status">
        {result}
      </p>
    </form>
  );
}

export function TextareaPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>The same label and messaging as the text input, for longer answers. Drag the corner to make it taller.</p>}
        layout="grid"
        code={`<Textarea label="Bio" />`}
      >
        <Textarea label="Bio" />
        <Textarea label="Notes" rows={6} placeholder="Anything else we should know?" />
      </Example>

      <Example
        title="Helper text and required"
        layout="grid"
        code={`<Textarea label="Describe the problem" required helperText="Include what you expected to happen." />`}
      >
        <Textarea
          label="Describe the problem"
          required
          helperText="Include what you expected to happen."
        />
      </Example>

      <Example
        title="Character counter"
        description={
          <p>
            With <code>maxLength</code>, a count appears and is read as part of the field's description.
            It is not announced on every keystroke, and typing stops at the limit.
          </p>
        }
        layout="grid"
        code={`<Textarea label="Short bio" maxLength={120} defaultValue="Senior frontend developer in Ottawa." />`}
      >
        <Textarea
          label="Short bio"
          maxLength={120}
          defaultValue="Senior frontend developer in Ottawa."
          helperText="Shown on your public profile."
        />
      </Example>

      <Example
        title="Error"
        description={<p>Errors set <code>aria-invalid</code> and are described first. They use text and an icon, not just red.</p>}
        layout="grid"
        code={`<Textarea label="Reason" defaultValue="Too short" error="Please write at least 20 characters." />`}
      >
        <Textarea
          label="Reason"
          defaultValue="Too short"
          error="Please write at least 20 characters."
          helperText="This is shown to the reviewer."
        />
      </Example>

      <Example
        title="Disabled and read-only"
        description={<p>Disabled fields can't be focused. Read-only fields can be focused and copied, but not edited.</p>}
        layout="grid"
        code={`
<Textarea label="Archived note" disabled defaultValue="…" />
<Textarea label="Terms summary" readOnly defaultValue="…" />`}
      >
        <Textarea label="Archived note" disabled defaultValue="This note was archived and can no longer be edited." />
        <Textarea
          label="Terms summary"
          readOnly
          defaultValue="You can copy this text, but you can't change it."
        />
      </Example>

      <Example
        title="Validation on blur and submit"
        description={<p>The error appears after you leave the field or submit. On a failed submit, focus moves back to the field.</p>}
        layout="stack"
      >
        <FeedbackForm />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves focus into and out of the field. Tab does not insert a tab character.' },
              { keys: ['Enter'], action: 'Starts a new line. It does not submit the form.' },
              { keys: ['Typing'], action: 'Standard text editing. Nothing is overridden.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>A label is always rendered. Placeholders are hints, never labels.</li>
          <li>Resizing is vertical only: horizontal resizing breaks layouts and reflow at high zoom.</li>
          <li>The 16px font prevents iOS from zooming in on focus.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'helperText', type: 'ReactNode', description: 'Guidance under the field.' },
          { name: 'error', type: 'ReactNode', description: 'Error message; marks the field invalid.' },
          { name: 'rows', type: 'number', defaultValue: '3', description: 'Visible lines of text.' },
          { name: 'maxLength', type: 'number', description: 'Limits input and shows a counter.' },
          { name: 'required / disabled / readOnly', type: 'boolean', defaultValue: 'false', description: 'Native attributes.' },
          { name: '…textarea props', type: 'TextareaHTMLAttributes', description: 'value, defaultValue, onChange, name, autoComplete and the rest.' },
        ]}
      />
    </>
  );
}
