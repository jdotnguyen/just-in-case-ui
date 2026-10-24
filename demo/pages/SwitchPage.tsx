import { useState } from 'react';
import { Switch } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

function ControlledExample() {
  const [on, setOn] = useState(false);
  return (
    <div className="stack-sm">
      <Switch
        label="Airplane mode"
        checked={on}
        onChange={(event) => setOn(event.target.checked)}
      />
      <p className="muted">
        Airplane mode is <output>{on ? 'on' : 'off'}</output>.
      </p>
    </div>
  );
}

function SettingsList() {
  const [settings, setSettings] = useState({ email: true, push: false, digest: true });
  const set = (key: keyof typeof settings) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setSettings((current) => ({ ...current, [key]: event.target.checked }));
  return (
    <div className="stack-md">
      <Switch
        label="Email notifications"
        description="Replies and mentions, sent to your inbox."
        checked={settings.email}
        onChange={set('email')}
      />
      <Switch
        label="Push notifications"
        description="Alerts on this device, even when the app is closed."
        checked={settings.push}
        onChange={set('push')}
      />
      <Switch
        label="Weekly digest"
        description="A Monday summary of everything you missed."
        checked={settings.digest}
        onChange={set('digest')}
      />
    </div>
  );
}

export function SwitchPage() {
  return (
    <>
      <Example
        title="Basic"
        description={<p>Press Space to toggle. The thumb slides, so state never relies on colour alone.</p>}
        layout="grid"
        code={`
<Switch label="Dark mode" />
<Switch label="Auto-save" defaultChecked />`}
      >
        <Switch label="Dark mode" />
        <Switch label="Auto-save" defaultChecked />
      </Example>

      <Example
        title="With description"
        description={<p>The description is read as part of the switch, and clicking it toggles too.</p>}
        layout="grid"
        code={`<Switch label="Location access" description="Used to show nearby results." />`}
      >
        <Switch label="Location access" description="Used to show nearby results." />
      </Example>

      <Example
        title="Disabled"
        layout="grid"
        code={`
<Switch label="Managed by your admin" disabled />
<Switch label="Managed by your admin" disabled defaultChecked />`}
      >
        <Switch label="Managed by your admin (off)" disabled />
        <Switch label="Managed by your admin (on)" disabled defaultChecked />
      </Example>

      <Example
        title="Required and error"
        description={<p>Use these only where a setting must be on to continue, such as accepting terms. Prefer a checkbox for that.</p>}
        layout="grid"
        code={`<Switch label="Share usage data" required error="Turn this on to continue." />`}
      >
        <Switch label="Share usage data" required error="Turn this on to continue." />
      </Example>

      <Example title="Controlled" layout="grid" code={`
const [on, setOn] = useState(false);
<Switch label="Airplane mode" checked={on} onChange={(e) => setOn(e.target.checked)} />`}>
        <ControlledExample />
      </Example>

      <Example
        title="A settings list"
        description={<p>Each switch applies the moment you flip it, with no Save button.</p>}
        layout="stack"
      >
        <SettingsList />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves focus to the next switch. Each switch is its own Tab stop.' },
              { keys: ['Space'], action: 'Turns the focused switch on or off.' },
            ],
          },
        ]}
      />

      <Notes title="Switch or checkbox?">
        <ul>
          <li><strong>Switch:</strong> a setting that takes effect immediately, like “Dark mode” or “Notifications”.</li>
          <li><strong>Checkbox:</strong> a choice that is submitted later with a form, or “pick any” lists.</li>
          <li>It is a native checkbox with <code>role="switch"</code>, so form values, <code>checked</code> and Space come from the browser.</li>
          <li>In Windows High Contrast mode, the track and thumb use system colours.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'label', type: 'ReactNode', description: 'Required visible label.' },
          { name: 'description', type: 'ReactNode', description: 'Extra detail; becomes the accessible description.' },
          { name: 'error', type: 'ReactNode', description: 'Error message; sets aria-invalid.' },
          { name: 'checked / defaultChecked', type: 'boolean', description: 'Controlled or initial state.' },
          { name: 'required / disabled', type: 'boolean', defaultValue: 'false', description: 'Native attributes.' },
          { name: '…input props', type: 'InputHTMLAttributes', description: 'onChange, name, value and the rest.' },
        ]}
      />
    </>
  );
}
