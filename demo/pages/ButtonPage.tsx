import { Button } from '../../src';
import type { ButtonTone, ButtonVariant } from '../../src';
import { useActionLog } from '../components/ActionLog';
import { Example, Notes } from '../components/Example';
import {
  ArrowRightIcon,
  CloseIcon,
  PlusIcon,
  SettingsIcon,
  TrashIcon,
} from '../components/icons';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const variants: Array<{ variant: ButtonVariant; name: string }> = [
  { variant: 'primary', name: 'Primary (solid)' },
  { variant: 'secondary', name: 'Secondary (outlined)' },
  { variant: 'tertiary', name: 'Tertiary (text)' },
];

const labels: Record<ButtonTone, Record<ButtonVariant, string>> = {
  default: { primary: 'Save changes', secondary: 'Save draft', tertiary: 'Cancel' },
  destructive: { primary: 'Delete project', secondary: 'Remove member', tertiary: 'Discard' },
};

export function ButtonPage() {
  const [log, say] = useActionLog('Press any button and it will be reported here.');
  const press = (label: string) => () => say(`You pressed “${label}”.`);

  return (
    <>
      {log}

      <Example
        title="Variants and tones"
        description={
          <p>
            Hierarchy comes from the variant, and danger from the tone. Use one primary action per
            view.
          </p>
        }
        layout="stack"
        code={`
<Button>Save changes</Button>
<Button variant="secondary">Save draft</Button>
<Button variant="tertiary">Cancel</Button>

<Button tone="destructive">Delete project</Button>
<Button variant="secondary" tone="destructive">Remove member</Button>
<Button variant="tertiary" tone="destructive">Discard</Button>`}
      >
        <div className="table-wrap">
          <table className="matrix">
            <thead>
              <tr>
                <td />
                {variants.map((v) => (
                  <th scope="col" key={v.variant}>
                    {v.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(['default', 'destructive'] as const).map((tone) => (
                <tr key={tone}>
                  <th scope="row">{tone === 'default' ? 'Default (blue)' : 'Destructive (red)'}</th>
                  {variants.map(({ variant }) => (
                    <td key={variant}>
                      <Button variant={variant} tone={tone} onClick={press(labels[tone][variant])}>
                        {labels[tone][variant]}
                      </Button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Example>

      <Example
        title="Sizes"
        description={<p>Small is 32px tall, medium 40px (default) and large 48px. Every size keeps at least a 24×24px target.</p>}
        code={`
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>`}
      >
        <Button size="sm" onClick={press('Small')}>Small</Button>
        <Button size="md" onClick={press('Medium')}>Medium</Button>
        <Button size="lg" onClick={press('Large')}>Large</Button>
        <Button size="sm" variant="secondary" onClick={press('Small outlined')}>Small outlined</Button>
        <Button size="lg" variant="secondary" onClick={press('Large outlined')}>Large outlined</Button>
      </Example>

      <Example
        title="With icons"
        description={<p>Icons next to a label are decorative and hidden from screen readers. The label does the talking.</p>}
        code={`
<Button startIcon={<PlusIcon />}>Add item</Button>
<Button variant="secondary" endIcon={<ArrowRightIcon />}>Next step</Button>
<Button tone="destructive" startIcon={<TrashIcon />}>Delete file</Button>`}
      >
        <Button startIcon={<PlusIcon />} onClick={press('Add item')}>Add item</Button>
        <Button variant="secondary" endIcon={<ArrowRightIcon />} onClick={press('Next step')}>
          Next step
        </Button>
        <Button tone="destructive" startIcon={<TrashIcon />} onClick={press('Delete file')}>
          Delete file
        </Button>
      </Example>

      <Example
        title="Icon-only"
        description={
          <p>
            An icon-only button must have an <code>aria-label</code>. TypeScript reports an error if
            it's missing.
          </p>
        }
        code={`
<Button icon={<SettingsIcon />} aria-label="Settings" />
<Button variant="secondary" icon={<CloseIcon />} aria-label="Close" />
<Button variant="tertiary" tone="destructive" icon={<TrashIcon />} aria-label="Delete row" />`}
      >
        <Button icon={<SettingsIcon />} aria-label="Settings" onClick={press('Settings')} />
        <Button variant="secondary" icon={<CloseIcon />} aria-label="Close" onClick={press('Close')} />
        <Button
          variant="tertiary"
          tone="destructive"
          icon={<TrashIcon />}
          aria-label="Delete row"
          onClick={press('Delete row')}
        />
        <Button size="sm" variant="secondary" icon={<PlusIcon />} aria-label="Add (small)" onClick={press('Add (small)')} />
      </Example>

      <Example
        title="Disabled"
        description={
          <p>
            By default a disabled button is skipped by Tab. With <code>focusableWhenDisabled</code> it
            stays reachable, so keyboard and screen reader users can find it and learn it's
            unavailable. Try tabbing through this row.
          </p>
        }
        code={`
<Button disabled>Native disabled</Button>
<Button disabled focusableWhenDisabled>Focusable disabled</Button>`}
      >
        <Button disabled onClick={press('Native disabled')}>Native disabled</Button>
        <Button variant="secondary" disabled>Outlined disabled</Button>
        <Button variant="tertiary" disabled>Text disabled</Button>
        <Button disabled focusableWhenDisabled onClick={press('Focusable disabled')}>
          Focusable disabled
        </Button>
      </Example>

      <Notes title="Destructive actions">
        <ul>
          <li>
            Name the action and the thing in the label: “Delete project”, not “OK”. Red is a hint,
            not the message.
          </li>
          <li>Ask for confirmation before anything that can't be undone, or offer an undo.</li>
          <li>Don't make a destructive action the only primary button on a page by accident.</li>
        </ul>
      </Notes>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves focus to the button (and Shift+Tab moves back).' },
              { keys: ['Enter', 'Space'], action: 'Activates the button.' },
            ],
          },
        ]}
      />

      <PropsTable
        rows={[
          { name: 'variant', type: "'primary' | 'secondary' | 'tertiary'", defaultValue: "'primary'", description: 'Solid, outlined or text-only.' },
          { name: 'tone', type: "'default' | 'destructive'", defaultValue: "'default'", description: 'Destructive turns any variant red.' },
          { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: '32, 40 or 48px tall.' },
          { name: 'startIcon / endIcon', type: 'ReactNode', description: 'Decorative icons around the label.' },
          { name: 'icon', type: 'ReactNode', description: 'Icon-only content; requires aria-label.' },
          { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Native disabled.' },
          { name: 'focusableWhenDisabled', type: 'boolean', defaultValue: 'false', description: 'Keep a disabled button in the tab order using aria-disabled.' },
          { name: 'type', type: "'button' | 'submit' | 'reset'", defaultValue: "'button'", description: "Won't submit forms unless you ask it to." },
        ]}
      />
    </>
  );
}
