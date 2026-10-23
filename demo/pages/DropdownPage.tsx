import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Dropdown } from '../../src';
import type { DropdownOption } from '../../src';
import { Example } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const fruits: DropdownOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'blueberry', label: 'Blueberry' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'grape', label: 'Grape' },
  { value: 'mango', label: 'Mango' },
];

const provinces: DropdownOption[] = [
  { value: 'ab', label: 'Alberta' },
  { value: 'bc', label: 'British Columbia' },
  { value: 'mb', label: 'Manitoba' },
  { value: 'nb', label: 'New Brunswick' },
  { value: 'nl', label: 'Newfoundland and Labrador' },
  { value: 'nt', label: 'Northwest Territories' },
  { value: 'ns', label: 'Nova Scotia' },
  { value: 'nu', label: 'Nunavut' },
  { value: 'on', label: 'Ontario' },
  { value: 'pe', label: 'Prince Edward Island' },
  { value: 'qc', label: 'Quebec' },
  { value: 'sk', label: 'Saskatchewan' },
  { value: 'yt', label: 'Yukon' },
];

const shipping: DropdownOption[] = [
  { value: 'standard', label: 'Standard (5–7 days)' },
  { value: 'express', label: 'Express (2 days)' },
  { value: 'overnight', label: 'Overnight (sold out)', disabled: true },
  { value: 'pickup', label: 'Pick up in store' },
];

const teams: DropdownOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'research', label: 'Research' },
];

const sizes: DropdownOption[] = [
  { value: 'xs', label: 'Extra small' },
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
  { value: 'xl', label: 'Extra large' },
];

function ControlledExample() {
  const [value, setValue] = useState<string | null>('blueberry');
  return (
    <div className="stack-sm">
      <Dropdown label="Smoothie base" options={fruits} value={value} onChange={setValue} />
      <p className="muted">
        Current value: <output>{value ?? 'none'}</output>
      </p>
      <div>
        <Button variant="tertiary" size="sm" onClick={() => setValue(null)}>
          Clear selection
        </Button>
      </div>
    </div>
  );
}

function FormExample() {
  const [result, setResult] = useState('');
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setResult(`Submitted: ${JSON.stringify(data)}`);
  }
  return (
    <form className="demo-form" onSubmit={handleSubmit}>
      <Dropdown label="T-shirt size" name="size" options={sizes} required />
      <Dropdown label="Province or territory" name="province" options={provinces} defaultValue="on" />
      <div className="form-actions">
        <Button type="submit">Place order</Button>
      </div>
      <p className="action-log" role="status">
        {result}
      </p>
    </form>
  );
}

export function DropdownPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>Click it, or focus it and press Down Arrow. Type a letter to jump to a match.</p>}
        layout="grid"
        code={`<Dropdown label="Favourite fruit" options={fruits} />`}
      >
        <Dropdown label="Favourite fruit" options={fruits} />
      </Example>

      <Example
        title="Preselected, longer list"
        description={<p>The list scrolls so the active option is always in view. Try typing “n” several times to cycle through.</p>}
        layout="grid"
        code={`<Dropdown label="Province or territory" options={provinces} defaultValue="on" />`}
      >
        <Dropdown label="Province or territory" options={provinces} defaultValue="on" />
      </Example>

      <Example
        title="Disabled option"
        description={<p>Disabled options are announced as unavailable, and arrow keys skip over them.</p>}
        layout="grid"
        code={`<Dropdown label="Shipping speed" options={[…, { value: 'overnight', label: 'Overnight (sold out)', disabled: true }]} />`}
      >
        <Dropdown label="Shipping speed" options={shipping} defaultValue="standard" />
      </Example>

      <Example
        title="Helper text and error"
        layout="grid"
        code={`
<Dropdown label="Team" options={teams} helperText="You can change this later." />
<Dropdown label="Team" options={teams} error="Choose a team to continue." required />`}
      >
        <Dropdown label="Team" options={teams} helperText="You can change this later." />
        <Dropdown
          label="Reviewer team"
          options={teams}
          required
          helperText="Who signs off on this change."
          error="Choose a team to continue."
        />
      </Example>

      <Example
        title="Disabled"
        layout="grid"
        code={`<Dropdown label="Plan" options={…} defaultValue="pro" disabled />`}
      >
        <Dropdown
          label="Plan"
          options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
          ]}
          defaultValue="pro"
          disabled
          helperText="Contact your admin to change plans."
        />
      </Example>

      <Example
        title="Controlled"
        layout="grid"
        code={`
const [value, setValue] = useState<string | null>('blueberry');
<Dropdown label="Smoothie base" options={fruits} value={value} onChange={setValue} />`}
      >
        <ControlledExample />
      </Example>

      <Example
        title="In a form"
        description={
          <p>
            With a <code>name</code>, the value is submitted with the form. Submit without a size to see
            required validation.
          </p>
        }
        layout="stack"
        code={`
<form onSubmit={…}>
  <Dropdown label="T-shirt size" name="size" options={sizes} required />
  <Dropdown label="Province or territory" name="province" options={provinces} defaultValue="on" />
  <Button type="submit">Place order</Button>
</form>`}
      >
        <FormExample />
      </Example>

      <KeyboardTable
        groups={[
          {
            title: 'When closed (focus on the dropdown)',
            rows: [
              { keys: ['Down Arrow', 'Up Arrow', 'Enter', 'Space'], action: 'Opens the list with the selected option (or the first) active.' },
              { keys: ['Alt + Down Arrow'], action: 'Opens the list.' },
              { keys: ['Home', 'End'], action: 'Opens the list with the first / last option active.' },
              { keys: ['A–Z'], action: 'Opens the list and jumps to the first option that starts with what you type.' },
            ],
          },
          {
            title: 'When open',
            rows: [
              { keys: ['Down Arrow', 'Up Arrow'], action: 'Moves to the next / previous option. Disabled options are skipped and it stops at the ends.' },
              { keys: ['Home', 'End'], action: 'Moves to the first / last option.' },
              { keys: ['Page Down', 'Page Up'], action: 'Moves 10 options down / up.' },
              { keys: ['Enter', 'Space'], action: 'Selects the active option and closes the list.' },
              { keys: ['Tab'], action: 'Selects the active option, closes the list and moves to the next field.' },
              { keys: ['Alt + Up Arrow'], action: 'Selects the active option and closes the list.' },
              { keys: ['Escape'], action: 'Closes the list without changing the value.' },
              { keys: ['A–Z'], action: 'Jumps to a matching option. Type quickly to match more letters; repeat a letter to cycle.' },
            ],
          },
        ]}
      />

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'options', type: 'DropdownOption[]', description: '{ value, label, disabled? }' },
          { name: 'value / defaultValue', type: 'string | null', description: 'Controlled or initial value.' },
          { name: 'onChange', type: '(value: string) => void', description: 'Called only when the value changes.' },
          { name: 'placeholder', type: 'string', defaultValue: "'Select an option'", description: 'Shown when nothing is selected.' },
          { name: 'helperText / error', type: 'ReactNode', description: 'Linked with aria-describedby; error sets aria-invalid.' },
          { name: 'required', type: 'boolean', defaultValue: 'false', description: 'aria-required plus native form validation.' },
          { name: 'name', type: 'string', description: 'Submit the value with native forms.' },
          { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Removes it from the tab order and blocks opening.' },
        ]}
      />
    </>
  );
}
