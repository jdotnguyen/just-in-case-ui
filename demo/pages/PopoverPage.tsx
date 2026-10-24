import { useState } from 'react';
import { Button, Checkbox, Popover, TextInput } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

function FilterPopover() {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      trigger={<Button variant="secondary">Filters</Button>}
      label="Filters"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="stack-md">
        <Checkbox label="In stock only" />
        <Checkbox label="On sale" />
        <TextInput label="Max price" type="number" />
        <div className="form-actions">
          <Button size="sm" onClick={() => setOpen(false)}>
            Apply
          </Button>
          <Button size="sm" variant="tertiary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Popover>
  );
}

export function PopoverPage() {
  return (
    <>
      <Example
        title="Basic"
        description={
          <p>
            A floating panel for a small task. Unlike a dialog, the rest of the page stays usable. Focus moves in when it opens;
            Escape closes it and puts you back on the button.
          </p>
        }
        code={`
<Popover trigger={<Button variant="secondary">Share</Button>} label="Share this page">
  <p>Anyone with the link can view.</p>
</Popover>`}
      >
        <Popover trigger={<Button variant="secondary">Share</Button>} label="Share this page">
          <div className="stack-sm">
            <p style={{ margin: 0 }}>Anyone with the link can view this page.</p>
            <TextInput label="Link" readOnly defaultValue="https://example.com/share/abc123" />
          </div>
        </Popover>
      </Example>

      <Example
        title="A small form, controlled"
        description={<p>Use <code>open</code> and <code>onOpenChange</code> to close the panel from its own buttons.</p>}
        code={`
const [open, setOpen] = useState(false);
<Popover trigger={<Button>Filters</Button>} label="Filters" open={open} onOpenChange={setOpen}>
  …
  <Button onClick={() => setOpen(false)}>Apply</Button>
</Popover>`}
      >
        <FilterPopover />
      </Example>

      <Example
        title="Placement"
        description={<p>The panel opens on the preferred side and flips when it doesn't fit.</p>}
        code={`<Popover placement="right" … />`}
      >
        <Popover trigger={<Button variant="secondary">Bottom (default)</Button>} label="Bottom example">
          <p style={{ margin: 0 }}>Opens below.</p>
        </Popover>
        <Popover
          trigger={<Button variant="secondary">Top</Button>}
          label="Top example"
          placement="top"
        >
          <p style={{ margin: 0 }}>Opens above.</p>
        </Popover>
        <Popover
          trigger={<Button variant="secondary">Right</Button>}
          label="Right example"
          placement="right"
        >
          <p style={{ margin: 0 }}>Opens to the right.</p>
        </Popover>
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Enter', 'Space'], action: 'Opens or closes the popover from its button.' },
              { keys: ['Tab'], action: 'Moves through the panel. Tabbing out of it closes it.' },
              { keys: ['Escape'], action: 'Closes the popover and returns focus to the button.' },
            ],
          },
        ]}
      />

      <Notes title="Popover, tooltip, menu or dialog?">
        <ul>
          <li><strong>Tooltip:</strong> a short, read-only hint. Nothing to click.</li>
          <li><strong>Popover:</strong> something small the person can interact with, such as options or a short form.</li>
          <li><strong>Menu:</strong> a list of actions.</li>
          <li><strong>Dialog:</strong> something that needs full attention and blocks the page.</li>
          <li>The panel sits right after its button in the page, so Tab order and reading order match what you see.</li>
          <li>The button gets <code>aria-expanded</code> and the panel is a labelled, non-modal dialog.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'trigger', type: 'ReactElement', description: 'The button that opens it. It receives aria-expanded and aria-controls.' },
          { name: 'label', type: 'string', description: 'Required accessible name for the panel.' },
          { name: 'children', type: 'ReactNode', description: 'Panel content.' },
          { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", defaultValue: "'bottom'", description: 'Preferred side; flips if there is no room.' },
          { name: 'open / defaultOpen', type: 'boolean', description: 'Controlled or initial state.' },
          { name: 'onOpenChange', type: '(open: boolean) => void', description: 'Called when it opens or closes.' },
        ]}
      />
    </>
  );
}
