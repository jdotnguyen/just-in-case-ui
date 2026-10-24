import { Button, Menu, useToast } from '../../src';
import type { MenuItem } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const icon = (path: string) => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path d={path} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const editIcon = icon('m4 16 .8-3.6L13.6 3.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1l-8.8 8.8z');
const copyIcon = icon('M7 7h8v9H7zM5 13V4h8');
const trashIcon = icon('M4 6h12M8 6V4h4v2m-6 0 .7 10h6.6L14 6');

function BasicMenu() {
  const { toast } = useToast();
  const say = (title: string) => () => toast({ title, duration: 2500 });
  const items: MenuItem[] = [
    { id: 'edit', label: 'Edit', icon: editIcon, onSelect: say('Edit chosen') },
    { id: 'duplicate', label: 'Duplicate', icon: copyIcon, onSelect: say('Duplicate chosen') },
    { id: 'archive', label: 'Archive (not available)', disabled: true },
    {
      id: 'delete',
      label: 'Delete',
      icon: trashIcon,
      destructive: true,
      separatorBefore: true,
      onSelect: say('Delete chosen'),
    },
  ];
  return <Menu trigger={<Button variant="secondary">Actions</Button>} items={items} />;
}

function IconMenu() {
  const { toast } = useToast();
  const items: MenuItem[] = ['Rename', 'Move', 'Share'].map((label) => ({
    id: label.toLowerCase(),
    label,
    onSelect: () => toast({ title: `${label} chosen`, duration: 2500 }),
  }));
  return (
    <Menu
      trigger={
        <Button
          variant="tertiary"
          aria-label="More options"
          icon={
            <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <circle cx="4.5" cy="10" r="1.6" fill="currentColor" />
              <circle cx="10" cy="10" r="1.6" fill="currentColor" />
              <circle cx="15.5" cy="10" r="1.6" fill="currentColor" />
            </svg>
          }
        />
      }
      items={items}
      placement="bottom"
    />
  );
}

export function MenuPage() {
  return (
    <>
      <Example
        title="Actions menu"
        description={
          <p>
            Use the mouse, or focus the button and press Enter, Space or Down Arrow. Choosing an item runs it and returns focus to
            the button.
          </p>
        }
        code={`
<Menu
  trigger={<Button variant="secondary">Actions</Button>}
  items={[
    { id: 'edit', label: 'Edit', onSelect: edit },
    { id: 'archive', label: 'Archive', disabled: true },
    { id: 'delete', label: 'Delete', destructive: true, separatorBefore: true, onSelect: remove },
  ]}
/>`}
      >
        <BasicMenu />
      </Example>

      <Example
        title="Icon-only trigger"
        description={<p>The button needs an <code>aria-label</code>, because an icon alone has no name.</p>}
        code={`<Menu trigger={<Button variant="tertiary" aria-label="More options" icon={<DotsIcon />} />} items={items} />`}
      >
        <IconMenu />
      </Example>

      <KeyboardTable
        groups={[
          {
            title: 'On the button',
            rows: [
              { keys: ['Enter', 'Space', 'Down Arrow'], action: 'Opens the menu on the first item.' },
              { keys: ['Up Arrow'], action: 'Opens the menu on the last item.' },
            ],
          },
          {
            title: 'In the menu',
            rows: [
              { keys: ['Down Arrow', 'Up Arrow'], action: 'Moves to the next / previous item, wrapping around.' },
              { keys: ['Home', 'End'], action: 'Moves to the first / last item.' },
              { keys: ['A–Z'], action: 'Jumps to the next item starting with that letter.' },
              { keys: ['Enter', 'Space'], action: 'Runs the item, closes the menu and returns to the button.' },
              { keys: ['Escape'], action: 'Closes the menu and returns to the button.' },
              { keys: ['Tab'], action: 'Closes the menu and moves on.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>It follows the WAI-ARIA Menu Button pattern: focus moves onto the items, and only one item is in the Tab order at a time.</li>
          <li>Disabled items are skipped by the arrow keys and announced as unavailable.</li>
          <li>Destructive items are red and also named for what they do (Delete), so colour is never the only clue.</li>
          <li><code>role="menu"</code> is for actions only. For navigation, use a list of links; to choose a value, use Dropdown.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'trigger', type: 'ReactElement', description: 'The button that opens the menu.' },
          { name: 'items', type: 'MenuItem[]', description: '{ id, label, onSelect?, disabled?, destructive?, icon?, separatorBefore? }' },
          { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", defaultValue: "'bottom'", description: 'Preferred side; flips if there is no room.' },
        ]}
      />
    </>
  );
}
