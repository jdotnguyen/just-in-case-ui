import { useState } from 'react';
import { Accordion, Button } from '../../src';
import type { AccordionItem } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const shipping: AccordionItem[] = [
  {
    id: 'standard',
    title: 'Standard shipping',
    content: <p>Arrives in 5–7 business days and is free on orders over $50.</p>,
  },
  {
    id: 'express',
    title: 'Express shipping',
    content: <p>Arrives in 2 business days for a flat $12.</p>,
  },
  {
    id: 'pickup',
    title: 'Pick up in store',
    content: <p>Ready in about an hour. Bring your order number and photo ID.</p>,
  },
];

const alerts: AccordionItem[] = [
  { id: 'email', title: 'Email alerts', content: <p>Replies and mentions, sent to your inbox.</p> },
  { id: 'sms', title: 'Text alerts', content: <p>Short messages for urgent issues only.</p> },
  { id: 'push', title: 'Push alerts', content: <p>Notifications on this device, even when the app is closed.</p> },
];

const plans: AccordionItem[] = [
  { id: 'basic', title: 'Basic plan', content: <p>Free for one person, with the essentials.</p> },
  { id: 'plus', title: 'Plus plan', content: <p>Unlimited projects and priority support.</p> },
  { id: 'max', title: 'Max plan', content: <p>Everything in Plus, with single sign-on and audit logs.</p> },
];

const withDisabled: AccordionItem[] = [
  { id: 'a', title: 'Account', content: <p>Change your name, email and password.</p> },
  { id: 'b', title: 'Billing', content: <p>Update your card and download invoices.</p> },
  {
    id: 'c',
    title: 'Team (Enterprise only)',
    content: <p>Invite teammates and set roles.</p>,
    disabled: true,
  },
  { id: 'd', title: 'Privacy', content: <p>Export or delete your data.</p> },
];

const faq: AccordionItem[] = [
  {
    id: 'what',
    title: 'What is Just In Case UI?',
    content: (
      <p>
        A small React component library where accessibility comes first: native elements, full
        keyboard support and AA colour contrast.
      </p>
    ),
  },
  {
    id: 'screen-readers',
    title: 'Which screen readers do you test with?',
    content: <p>VoiceOver with Safari, and NVDA with Firefox, plus automated checks with axe.</p>,
  },
  {
    id: 'themes',
    title: 'Can I change the colours?',
    content: (
      <p>
        Yes. Every value is a <code>--jic-*</code> CSS variable. Keep text pairs at 4.5:1 contrast or
        better.
      </p>
    ),
  },
  {
    id: 'motion',
    title: 'What about reduced motion?',
    content: <p>Transitions switch off when your system asks for reduced motion.</p>,
  },
];

function ControlledExample() {
  const [open, setOpen] = useState<string[]>(['plus']);
  return (
    <div className="stack-sm">
      <Accordion items={plans} type="multiple" value={open} onChange={setOpen} />
      <p className="muted">
        Open: <output>{open.length ? open.join(', ') : 'none'}</output>
      </p>
      <div className="form-actions">
        <Button size="sm" variant="secondary" onClick={() => setOpen(plans.map((i) => i.id))}>
          Expand all
        </Button>
        <Button size="sm" variant="tertiary" onClick={() => setOpen([])}>
          Collapse all
        </Button>
      </div>
    </div>
  );
}

export function AccordionPage() {
  return (
    <>
      <Example
        title="Single (default)"
        description={<p>Opening one section closes the others. Click the open one again to close it.</p>}
        layout="stack"
        code={`<Accordion items={items} defaultValue={['standard']} />`}
      >
        <Accordion items={shipping} defaultValue={['standard']} />
      </Example>

      <Example
        title="Multiple"
        description={<p>Any number of sections can be open at once.</p>}
        layout="stack"
        code={`<Accordion items={items} type="multiple" defaultValue={['email', 'push']} />`}
      >
        <Accordion items={alerts} type="multiple" defaultValue={['email', 'push']} />
      </Example>

      <Example
        title="Not collapsible"
        description={<p>One section is always open, like a set of tabs.</p>}
        layout="stack"
        code={`<Accordion items={items} collapsible={false} defaultValue={['express']} />`}
      >
        <Accordion items={shipping} collapsible={false} defaultValue={['express']} />
      </Example>

      <Example
        title="Disabled item"
        description={<p>Disabled sections can't be opened, and the arrow keys skip over them.</p>}
        layout="stack"
        code={`items = [..., { id: 'c', title: 'Team (Enterprise only)', content: …, disabled: true }]`}
      >
        <Accordion items={withDisabled} defaultValue={['a']} />
      </Example>

      <Example title="Controlled" layout="stack" code={`
const [open, setOpen] = useState(['plus']);
<Accordion items={items} type="multiple" value={open} onChange={setOpen} />`}>
        <ControlledExample />
      </Example>

      <Example
        title="FAQ with a custom heading level"
        description={<p>Titles are real headings. Pick a level that fits your page's outline.</p>}
        layout="stack"
        code={`<Accordion items={faq} headingLevel={3} />`}
      >
        <Accordion items={faq} type="multiple" headingLevel={3} />
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves between section headers (and into any open content).' },
              { keys: ['Enter', 'Space'], action: 'Opens or closes the focused section.' },
              { keys: ['Down Arrow'], action: 'Moves focus to the next header, wrapping to the first.' },
              { keys: ['Up Arrow'], action: 'Moves focus to the previous header, wrapping to the last.' },
              { keys: ['Home', 'End'], action: 'Moves focus to the first / last header.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>Each title is a heading containing a real <code>&lt;button&gt;</code> with <code>aria-expanded</code> and <code>aria-controls</code>.</li>
          <li>Open panels are labelled regions. With more than six sections they drop the region role, so the landmark list doesn't get cluttered.</li>
          <li>Use accordions for content people may skip. Don't hide things everyone needs.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'items', type: 'AccordionItem[]', description: '{ id, title, content, disabled? }' },
          { name: 'type', type: "'single' | 'multiple'", defaultValue: "'single'", description: 'One open at a time, or any number.' },
          { name: 'collapsible', type: 'boolean', defaultValue: 'true', description: 'In single mode, whether the open item can be closed.' },
          { name: 'headingLevel', type: '2 | 3 | 4 | 5 | 6', defaultValue: '3', description: 'Heading level for titles.' },
          { name: 'value / defaultValue', type: 'string[]', description: 'Controlled or initial open item ids.' },
          { name: 'onChange', type: '(value: string[]) => void', description: 'Called with the new open ids.' },
        ]}
      />
    </>
  );
}
