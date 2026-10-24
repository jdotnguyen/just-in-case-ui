import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Combobox } from '../../src';
import type { ComboboxOption } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const countries: ComboboxOption[] = [
  'Australia', 'Brazil', 'Canada', 'Chile', 'China', 'Denmark', 'Egypt', 'Finland', 'France', 'Germany',
  'Ghana', 'Greece', 'India', 'Ireland', 'Italy', 'Japan', 'Kenya', 'Mexico', 'Netherlands', 'New Zealand',
  'Nigeria', 'Norway', 'Peru', 'Poland', 'Portugal', 'South Africa', 'Spain', 'Sweden', 'Switzerland',
  'United Kingdom', 'United States',
].map((label) => ({ value: label.toLowerCase().replace(/\s+/g, '-'), label }));

const plans: ComboboxOption[] = [
  { value: 'free', label: 'Free' },
  { value: 'pro', label: 'Pro' },
  { value: 'team', label: 'Team' },
  { value: 'enterprise', label: 'Enterprise (contact sales)', disabled: true },
];

function ControlledExample() {
  const [value, setValue] = useState<string | null>('canada');
  return (
    <div className="stack-sm">
      <Combobox label="Country" options={countries} value={value} onChange={setValue} />
      <p className="muted">
        Value: <output>{value ?? 'none'}</output>
      </p>
      <div className="form-actions">
        <Button size="sm" variant="secondary" onClick={() => setValue('japan')}>
          Set to Japan
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => setValue(null)}>
          Clear
        </Button>
      </div>
    </div>
  );
}

function FormExample() {
  const [country, setCountry] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState('');
  const error = touched && !country ? 'Choose a country from the list.' : undefined;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!country) {
      setResult('');
      event.currentTarget.querySelector<HTMLInputElement>('[role="combobox"]')?.focus();
      return;
    }
    const data = new FormData(event.currentTarget);
    setResult(`Submitted country = ${String(data.get('country'))}`);
  }

  return (
    <form className="demo-form" onSubmit={handleSubmit} noValidate>
      <Combobox
        label="Country"
        name="country"
        required
        options={countries}
        value={country}
        onChange={setCountry}
        onBlur={() => setTouched(true)}
        error={error}
        helperText="Start typing to filter the list."
      />
      <div className="form-actions">
        <Button type="submit">Continue</Button>
      </div>
      <p className="action-log" role="status">
        {result}
      </p>
    </form>
  );
}

export function ComboboxPage() {
  return (
    <>
      <Example
        title="Filter as you type"
        description={
          <p>
            Type to narrow a long list, or press Down Arrow to browse it. The number of matches is announced to screen readers.
          </p>
        }
        layout="grid"
        code={`<Combobox label="Country" options={countries} placeholder="Search countries" />`}
      >
        <Combobox label="Country" options={countries} placeholder="Search countries" />
      </Example>

      <Example
        title="With a starting value"
        description={<p>Opening the list shows every option again, with the current one marked.</p>}
        layout="grid"
        code={`<Combobox label="Plan" options={plans} defaultValue="pro" />`}
      >
        <Combobox label="Plan" options={plans} defaultValue="pro" helperText="Enterprise is unavailable." />
      </Example>

      <Example
        title="No matches"
        description={<p>Try typing “zzz”. The message is shown and announced.</p>}
        layout="grid"
      >
        <Combobox label="Country" options={countries} emptyMessage="No countries match that search." />
      </Example>

      <Example
        title="Custom matching"
        description={<p>Match only the start of each option with the <code>filter</code> prop.</p>}
        layout="grid"
        code={`<Combobox filter={(option, query) => option.label.toLowerCase().startsWith(query.toLowerCase())} … />`}
      >
        <Combobox
          label="Country (starts with)"
          options={countries}
          filter={(option, query) => option.label.toLowerCase().startsWith(query.trim().toLowerCase())}
        />
      </Example>

      <Example title="Error and disabled" layout="grid">
        <Combobox label="Country" options={countries} error="Choose a country from the list." />
        <Combobox label="Region" options={countries} disabled placeholder="Unavailable" />
      </Example>

      <Example title="Controlled" layout="grid" code={`
const [value, setValue] = useState<string | null>('canada');
<Combobox label="Country" options={countries} value={value} onChange={setValue} />`}>
        <ControlledExample />
      </Example>

      <Example
        title="In a form"
        description={<p>With <code>name</code>, the chosen option's value is submitted. The field always holds a real option, never half-typed text.</p>}
        layout="stack"
      >
        <FormExample />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Typing'], action: 'Opens the list and filters it.' },
              { keys: ['Down Arrow'], action: 'Opens the list, or moves to the next option. Disabled options are skipped.' },
              { keys: ['Up Arrow'], action: 'Opens the list on the last option, or moves to the previous one.' },
              { keys: ['Enter'], action: 'Chooses the highlighted option.' },
              { keys: ['Escape'], action: 'Closes the list. Press again to clear the field.' },
              { keys: ['Tab'], action: 'Leaves the field. Text that matches an option exactly is chosen; other text is discarded.' },
            ],
          },
        ]}
      />

      <Notes title="Combobox or dropdown?">
        <ul>
          <li><strong>Dropdown:</strong> a short list (about 10 or fewer) where browsing is faster than typing.</li>
          <li><strong>Combobox:</strong> a long list, or one where people already know what they're looking for.</li>
          <li>Focus never leaves the input. The highlighted option is announced through <code>aria-activedescendant</code>.</li>
          <li>The value is always one of the options. If you need free text, use a text input with a datalist instead.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'options', type: 'ComboboxOption[]', description: '{ value, label, disabled? }' },
          { name: 'value / defaultValue', type: 'string | null', description: 'Controlled or initial value.' },
          { name: 'onChange', type: '(value: string | null) => void', description: 'Called when the choice changes or is cleared.' },
          { name: 'filter', type: '(option, query) => boolean', description: 'Custom matching. Defaults to case-insensitive contains.' },
          { name: 'emptyMessage', type: 'string', defaultValue: "'No matches'", description: 'Shown when nothing matches.' },
          { name: 'name', type: 'string', description: 'Submits the value with forms.' },
          { name: 'helperText / error / required / disabled', type: '…', description: 'Same as the other fields.' },
        ]}
      />
    </>
  );
}
