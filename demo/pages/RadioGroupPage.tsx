import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, RadioGroup } from '../../src';
import type { RadioOption } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const plans: RadioOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
];

const delivery: RadioOption[] = [
  { value: 'standard', label: 'Standard', description: 'Arrives in 5–7 business days. Free.' },
  { value: 'express', label: 'Express', description: 'Arrives in 2 business days. $12.' },
  { value: 'overnight', label: 'Overnight', description: 'Sold out today.', disabled: true },
  { value: 'pickup', label: 'Pick up in store', description: 'Ready in about an hour.' },
];

const sizes: RadioOption[] = [
  { value: 's', label: 'S' },
  { value: 'm', label: 'M' },
  { value: 'l', label: 'L' },
  { value: 'xl', label: 'XL' },
];

function FormExample() {
  const [result, setResult] = useState('');
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(`Submitted: ${JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))}`);
  }
  return (
    <form className="demo-form" onSubmit={handleSubmit}>
      <RadioGroup legend="Delivery speed" name="delivery" options={delivery} required />
      <RadioGroup legend="Size" name="size" options={sizes} defaultValue="m" orientation="horizontal" />
      <div className="form-actions">
        <Button type="submit">Place order</Button>
      </div>
      <p className="action-log" role="status">
        {result}
      </p>
    </form>
  );
}

function ControlledExample() {
  const [plan, setPlan] = useState<string | null>('pro');
  return (
    <div className="stack-sm">
      <RadioGroup legend="Plan" options={plans} value={plan} onChange={setPlan} />
      <p className="muted">
        Current value: <output>{plan ?? 'none'}</output>
      </p>
      <div>
        <Button variant="tertiary" size="sm" onClick={() => setPlan(null)}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}

export function RadioGroupPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>Tab into the group, then use the arrow keys to change the selection.</p>}
        layout="grid"
        code={`<RadioGroup legend="Plan" options={[{ value: 'free', label: 'Free' }, …]} />`}
      >
        <RadioGroup legend="Plan" options={plans} />
        <RadioGroup legend="Billing" options={[
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly (save 20%)' },
        ]} defaultValue="yearly" />
      </Example>

      <Example
        title="With descriptions and a disabled option"
        description={<p>Descriptions are read when an option is focused. Arrow keys skip disabled options.</p>}
        layout="grid"
        code={`
<RadioGroup
  legend="Delivery speed"
  defaultValue="standard"
  options={[
    { value: 'standard', label: 'Standard', description: 'Arrives in 5–7 business days. Free.' },
    { value: 'overnight', label: 'Overnight', description: 'Sold out today.', disabled: true },
    …
  ]}
/>`}
      >
        <RadioGroup legend="Delivery speed" options={delivery} defaultValue="standard" />
      </Example>

      <Example
        title="Horizontal"
        layout="stack"
        code={`<RadioGroup legend="Size" options={sizes} orientation="horizontal" defaultValue="m" />`}
      >
        <RadioGroup legend="Size" options={sizes} orientation="horizontal" defaultValue="m" />
      </Example>

      <Example
        title="Helper text and error"
        layout="grid"
        code={`<RadioGroup legend="Contact method" options={…} required helperText="…" error="Choose how we should contact you." />`}
      >
        <RadioGroup
          legend="Contact method"
          options={[
            { value: 'email', label: 'Email' },
            { value: 'phone', label: 'Phone' },
          ]}
          required
          helperText="We'll only contact you about this order."
          error="Choose how we should contact you."
        />
      </Example>

      <Example
        title="Disabled group"
        layout="grid"
        code={`<RadioGroup legend="Data region" options={…} defaultValue="ca" disabled helperText="Set when your account was created." />`}
      >
        <RadioGroup
          legend="Data region"
          options={[
            { value: 'ca', label: 'Canada' },
            { value: 'us', label: 'United States' },
            { value: 'eu', label: 'European Union' },
          ]}
          defaultValue="ca"
          disabled
          helperText="Set when your account was created."
        />
      </Example>

      <Example
        title="Controlled"
        layout="grid"
        code={`
const [plan, setPlan] = useState<string | null>('pro');
<RadioGroup legend="Plan" options={plans} value={plan} onChange={setPlan} />`}
      >
        <ControlledExample />
      </Example>

      <Example
        title="In a form"
        description={<p>Required uses native validation. Submit without picking a delivery speed to try it.</p>}
        layout="stack"
      >
        <FormExample />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves into the group, landing on the selected option (or the first one), then out of it. The whole group is one Tab stop.' },
              { keys: ['Down Arrow', 'Right Arrow'], action: 'Selects the next enabled option, wrapping at the end.' },
              { keys: ['Up Arrow', 'Left Arrow'], action: 'Selects the previous enabled option, wrapping at the start.' },
              { keys: ['Space'], action: 'Selects the focused option if it isn’t already.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>Built on native radio buttons, so the browser provides the arrow keys and the single Tab stop.</li>
          <li>The group is a <code>&lt;fieldset role="radiogroup"&gt;</code>, so <code>aria-invalid</code> and <code>aria-required</code> are valid on it.</li>
          <li>Use radios for 2–6 options that are all worth seeing at once. For longer lists, use the Dropdown.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'legend', type: 'ReactNode', description: 'Required visible name for the group.' },
          { name: 'options', type: 'RadioOption[]', description: '{ value, label, description?, disabled? }' },
          { name: 'value / defaultValue', type: 'string | null', description: 'Controlled or initial value.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called with the newly selected value.' },
          { name: 'name', type: 'string', description: 'Shared input name (generated if omitted).' },
          { name: 'helperText / error', type: 'ReactNode', description: 'Describe the group; error sets aria-invalid.' },
          { name: 'required / disabled', type: 'boolean', defaultValue: 'false', description: 'Native validation / disable all options.' },
          { name: 'orientation', type: "'vertical' | 'horizontal'", defaultValue: "'vertical'", description: 'Layout of the options.' },
        ]}
      />
    </>
  );
}
