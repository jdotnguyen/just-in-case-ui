import { useState } from 'react';
import { Button, Tabs, TextInput } from '../../src';
import type { TabItem } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const account: TabItem[] = [
  { id: 'profile', label: 'Profile', content: <p>Your name, photo and public details.</p> },
  { id: 'security', label: 'Security', content: <p>Password, two-step verification and active sessions.</p> },
  { id: 'billing', label: 'Billing', content: <p>Plan, payment method and invoices.</p> },
];

const withDisabled: TabItem[] = [
  { id: 'overview', label: 'Overview', content: <p>A summary of the project.</p> },
  { id: 'activity', label: 'Activity', content: <p>Recent changes by your team.</p> },
  { id: 'reports', label: 'Reports', content: <p>Available on the Pro plan.</p>, disabled: true },
  { id: 'settings', label: 'Settings', content: <p>Rename, archive or delete the project.</p> },
];

const withFields: TabItem[] = [
  {
    id: 'contact',
    label: 'Contact',
    content: (
      <div className="stack-sm">
        <TextInput label="Email" type="email" />
        <p className="muted">Because this panel has a field in it, Tab goes straight to the field.</p>
      </div>
    ),
  },
  { id: 'notes', label: 'Notes', content: <p>This panel has no focusable content, so the panel itself becomes a Tab stop.</p> },
];

const many: TabItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `t${i + 1}`,
  label: `Section ${i + 1}`,
  content: <p>Content for section {i + 1}.</p>,
}));

function ControlledExample() {
  const [value, setValue] = useState('security');
  return (
    <div className="stack-sm">
      <Tabs label="Controlled account settings" tabs={account} value={value} onChange={setValue} />
      <div className="form-actions">
        <Button size="sm" variant="secondary" onClick={() => setValue('billing')}>
          Jump to Billing
        </Button>
      </div>
      <p className="muted">
        Selected: <output>{value}</output>
      </p>
    </div>
  );
}

export function TabsPage() {
  return (
    <>
      <Example
        title="Automatic activation (default)"
        description={<p>Moving focus with the arrow keys also shows the panel. Best when panels are quick to show.</p>}
        layout="stack"
        code={`<Tabs label="Account settings" tabs={tabs} />`}
      >
        <Tabs label="Account settings" tabs={account} />
      </Example>

      <Example
        title="Manual activation"
        description={<p>Arrow keys move focus only; press Enter or Space to show the panel. Use it when panels are slow to load or expensive.</p>}
        layout="stack"
        code={`<Tabs label="Account settings, manual" tabs={tabs} activation="manual" />`}
      >
        <Tabs label="Account settings, manual" tabs={account} activation="manual" />
      </Example>

      <Example
        title="Vertical"
        description={<p>Up and Down Arrow replace Left and Right. Good for many sections or settings pages.</p>}
        layout="stack"
        code={`<Tabs label="Settings sections" tabs={tabs} orientation="vertical" />`}
      >
        <Tabs label="Settings sections" tabs={account} orientation="vertical" />
      </Example>

      <Example
        title="Disabled tab"
        description={<p>Disabled tabs are skipped by the arrow keys.</p>}
        layout="stack"
        code={`tabs = [..., { id: 'reports', label: 'Reports', content: …, disabled: true }]`}
      >
        <Tabs label="Project" tabs={withDisabled} />
      </Example>

      <Example
        title="Panels with and without fields"
        description={<p>A panel with nothing focusable in it is reachable with Tab, so keyboard users can read it with scrolling keys.</p>}
        layout="stack"
      >
        <Tabs label="Contact details" tabs={withFields} />
      </Example>

      <Example
        title="Many tabs on a narrow screen"
        description={<p>The tab list scrolls sideways instead of wrapping, so the bar stays one line.</p>}
        layout="stack"
      >
        <div style={{ maxWidth: 360, width: '100%' }}>
          <Tabs label="Sections" tabs={many} />
        </div>
      </Example>

      <Example title="Controlled" layout="stack" code={`
const [value, setValue] = useState('security');
<Tabs label="Account" tabs={tabs} value={value} onChange={setValue} />`}>
        <ControlledExample />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves focus into the tab list (to the selected tab), then on to the panel.' },
              { keys: ['Right Arrow', 'Left Arrow'], action: 'Moves to the next / previous tab, wrapping around and skipping disabled tabs.' },
              { keys: ['Down Arrow', 'Up Arrow'], action: 'Same, when the tabs are vertical.' },
              { keys: ['Home', 'End'], action: 'Moves to the first / last tab.' },
              { keys: ['Enter', 'Space'], action: 'Shows the focused tab’s panel (manual activation only).' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>Only the selected tab is in the Tab order (roving tabindex), so people don't have to Tab through every tab to reach the content.</li>
          <li>The selected tab shows a bar and semi-bold text, so it does not rely on colour alone.</li>
          <li>Tabs switch content on one page. If each tab is a different page, use links in a navigation landmark instead.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'string', description: 'Required accessible name for the tab list.' },
          { name: 'tabs', type: 'TabItem[]', description: '{ id, label, content, disabled? }' },
          { name: 'value / defaultValue', type: 'string', description: 'Controlled or initial selected tab id. Defaults to the first enabled tab.' },
          { name: 'onChange', type: '(id: string) => void', description: 'Called when the selected tab changes.' },
          { name: 'activation', type: "'automatic' | 'manual'", defaultValue: "'automatic'", description: 'Select on focus, or wait for Enter or Space.' },
          { name: 'orientation', type: "'horizontal' | 'vertical'", defaultValue: "'horizontal'", description: 'Direction of the tab list.' },
        ]}
      />
    </>
  );
}
