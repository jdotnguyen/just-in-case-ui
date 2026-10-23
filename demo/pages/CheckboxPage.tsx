import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Button, Checkbox, CheckboxGroup } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const toppings = ['Cheese', 'Mushrooms', 'Olives', 'Peppers'];

function SelectAllExample() {
  const [selected, setSelected] = useState<string[]>(['Cheese']);
  const all = selected.length === toppings.length;
  const some = selected.length > 0 && !all;

  return (
    <CheckboxGroup legend="Pizza toppings" helperText="“Select all” shows a dash when only some are picked.">
      <Checkbox
        label="Select all"
        checked={all}
        indeterminate={some}
        onChange={() => setSelected(all ? [] : toppings)}
      />
      <div className="nested-choices">
        {toppings.map((topping) => (
          <Checkbox
            key={topping}
            label={topping}
            checked={selected.includes(topping)}
            onChange={(event) =>
              setSelected((current) =>
                event.target.checked
                  ? [...current, topping]
                  : current.filter((t) => t !== topping),
              )
            }
          />
        ))}
      </div>
    </CheckboxGroup>
  );
}

function ValidationExample() {
  const [picked, setPicked] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState('');
  const error = submitted && picked.length === 0 ? 'Choose at least one way to hear from us.' : undefined;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (picked.length === 0) {
      setResult('');
      // Send focus to the first checkbox in the group so it can be fixed.
      (event.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>('input[type=checkbox]')?.focus();
      return;
    }
    setResult(`Saved: ${picked.join(', ')}.`);
  }

  const toggle = (value: string) => (event: ChangeEvent<HTMLInputElement>) =>
    setPicked((current) =>
      event.target.checked ? [...current, value] : current.filter((v) => v !== value),
    );

  return (
    <form className="demo-form" onSubmit={handleSubmit} noValidate>
      <CheckboxGroup legend="Contact preferences" required error={error}>
        <Checkbox label="Email" checked={picked.includes('email')} onChange={toggle('email')} />
        <Checkbox label="Text message" checked={picked.includes('sms')} onChange={toggle('sms')} />
        <Checkbox label="Phone call" checked={picked.includes('phone')} onChange={toggle('phone')} />
      </CheckboxGroup>
      <div className="form-actions">
        <Button type="submit">Save preferences</Button>
      </div>
      <p className="action-log" role="status">
        {result}
      </p>
    </form>
  );
}

export function CheckboxPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>A real checkbox with soft corners. Click the box or its label.</p>}
        layout="stack"
        code={`
<Checkbox label="Email me product updates" />
<Checkbox label="Remember me" defaultChecked />`}
      >
        <Checkbox label="Email me product updates" />
        <Checkbox label="Remember me on this device" defaultChecked />
      </Example>

      <Example
        title="With a description"
        description={<p>The description is read when the checkbox is focused, and clicking it toggles too.</p>}
        layout="stack"
        code={`<Checkbox label="Weekly digest" description="One email every Monday morning. Unsubscribe anytime." />`}
      >
        <Checkbox
          label="Weekly digest"
          description="One email every Monday morning. Unsubscribe anytime."
        />
        <Checkbox
          label="Beta features"
          description="Try new things early. They might be a little rough."
          defaultChecked
        />
      </Example>

      <Example
        title="Indeterminate: select all"
        description={<p>When some, but not all, items are checked, “Select all” shows a dash and is announced as “mixed”.</p>}
        layout="stack"
        code={`<Checkbox label="Select all" checked={all} indeterminate={some} onChange={toggleAll} />`}
      >
        <SelectAllExample />
      </Example>

      <Example
        title="Required and error"
        description={<p>A single required checkbox uses native validation. The error is text plus an icon, not just a red border.</p>}
        layout="stack"
        code={`
<Checkbox label="I accept the terms of service" required />
<Checkbox label="I accept the terms of service" required error="You need to accept the terms to continue." />`}
      >
        <Checkbox label="I accept the terms of service" required />
        <Checkbox
          label="I'm at least 18 years old"
          required
          error="You need to confirm this to continue."
        />
      </Example>

      <Example
        title="Disabled"
        layout="stack"
        code={`<Checkbox label="Two-factor authentication" disabled defaultChecked description="Required by your organization." />`}
      >
        <Checkbox label="Share usage data" disabled />
        <Checkbox
          label="Two-factor authentication"
          disabled
          defaultChecked
          description="Required by your organization."
        />
      </Example>

      <Example
        title="Groups"
        description={<p>A group is a <code>&lt;fieldset&gt;</code> whose legend names it. Lay it out vertically (default) or horizontally.</p>}
        layout="grid"
        code={`
<CheckboxGroup legend="Notify me about">
  <Checkbox label="Comments" />
  <Checkbox label="Mentions" />
  <Checkbox label="New followers" />
</CheckboxGroup>

<CheckboxGroup legend="Days available" orientation="horizontal">…</CheckboxGroup>`}
      >
        <CheckboxGroup legend="Notify me about" helperText="We'll never send more than one email a day.">
          <Checkbox label="Comments" defaultChecked />
          <Checkbox label="Mentions" defaultChecked />
          <Checkbox label="New followers" />
        </CheckboxGroup>
        <CheckboxGroup legend="Days available" orientation="horizontal">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <Checkbox key={day} label={day} name="days" value={day.toLowerCase()} />
          ))}
        </CheckboxGroup>
      </Example>

      <Example
        title="Group validation"
        description={
          <p>
            Browsers can't check “pick at least one”, so validate it yourself and pass <code>error</code>.
            Every checkbox in the group is then marked invalid. Submit without choosing anything to see it.
          </p>
        }
        layout="stack"
      >
        <ValidationExample />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves to the next checkbox. Each checkbox is its own Tab stop.' },
              { keys: ['Space'], action: 'Checks or unchecks the focused checkbox.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>The visible box is the real <code>&lt;input type="checkbox"&gt;</code>, restyled with CSS. Nothing is hidden or faked.</li>
          <li>Labels and descriptions are part of the click target, so it's much bigger than the 20px box.</li>
          <li>In Windows High Contrast mode, checked boxes use the system highlight colour.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'description', type: 'ReactNode', description: 'Extra detail; becomes the accessible description.' },
          { name: 'indeterminate', type: 'boolean', defaultValue: 'false', description: 'Shows a dash and exposes the mixed state.' },
          { name: 'error', type: 'ReactNode', description: 'Error message; sets aria-invalid.' },
          { name: 'required / disabled', type: 'boolean', defaultValue: 'false', description: 'Native attributes.' },
          { name: '…input props', type: 'InputHTMLAttributes', description: 'checked, defaultChecked, onChange, name, value and the rest.' },
          { name: 'CheckboxGroup', type: 'legend, helperText, error, required, disabled, orientation', description: 'Fieldset wrapper for several checkboxes.' },
        ]}
      />
    </>
  );
}
