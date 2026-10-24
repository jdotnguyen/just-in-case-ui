import { Button, Tooltip } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

const PencilIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
    <path
      d="m4 16 .8-3.6L13.6 3.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1l-8.8 8.8z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

export function TooltipPage() {
  return (
    <>
      <Example
        title="Basic"
        description={
          <p>
            Hover the button, or Tab to it. The tooltip appears after a short delay on hover and straight away on focus.
            Press Escape to hide it.
          </p>
        }
        code={`
<Tooltip content="Saves a copy to your drafts">
  <Button variant="secondary">Save draft</Button>
</Tooltip>`}
      >
        <Tooltip content="Saves a copy to your drafts">
          <Button variant="secondary">Save draft</Button>
        </Tooltip>
      </Example>

      <Example
        title="Icon-only button"
        description={
          <p>
            Icon buttons still need an accessible name via <code>aria-label</code>. The tooltip shows the same name to sighted
            mouse users.
          </p>
        }
        code={`
<Tooltip content="Edit">
  <Button variant="tertiary" aria-label="Edit" icon={<PencilIcon />} />
</Tooltip>`}
      >
        <Tooltip content="Edit">
          <Button variant="tertiary" aria-label="Edit" icon={<PencilIcon />} />
        </Tooltip>
      </Example>

      <Example
        title="Placement"
        description={<p>The preferred side flips to the opposite one when there isn't room, and stays inside the window.</p>}
        code={`<Tooltip content="On the right" placement="right">…</Tooltip>`}
      >
        <Tooltip content="Above (default)" placement="top">
          <Button variant="secondary">Top</Button>
        </Tooltip>
        <Tooltip content="Below" placement="bottom">
          <Button variant="secondary">Bottom</Button>
        </Tooltip>
        <Tooltip content="To the left" placement="left">
          <Button variant="secondary">Left</Button>
        </Tooltip>
        <Tooltip content="To the right" placement="right">
          <Button variant="secondary">Right</Button>
        </Tooltip>
      </Example>

      <Example
        title="Longer text"
        description={<p>Text wraps at 280px. If you need more than a sentence, put it on the page instead.</p>}
      >
        <Tooltip content="Archived projects are hidden from search and can't be edited. You can restore them from Settings at any time.">
          <Button variant="secondary">Archive</Button>
        </Tooltip>
      </Example>

      <Example
        title="At the edge of the window"
        description={<p>This button sits against the left edge; the tooltip is nudged to stay on screen.</p>}
        layout="stack"
      >
        <div style={{ marginInlineStart: -8 }}>
          <Tooltip content="This tooltip is much wider than the space to the left of the button.">
            <Button variant="secondary" size="sm">
              Edge
            </Button>
          </Tooltip>
        </div>
      </Example>

      <Example
        title="Disabled buttons"
        description={
          <p>
            Disabled buttons can't be focused or hovered in most browsers, so they can't show a tooltip. Explain why in text next
            to the button instead.
          </p>
        }
      >
        <Button disabled>Publish</Button>
        <span className="muted">Add a title before you can publish.</span>
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Focusing the trigger shows its tooltip immediately.' },
              { keys: ['Escape'], action: 'Hides the tooltip. Focus stays where it is.' },
            ],
          },
        ]}
      />

      <Notes title="Accessibility notes">
        <ul>
          <li>The trigger gets <code>aria-describedby</code> pointing at a <code>role="tooltip"</code> element, so screen readers read it as a description after the name.</li>
          <li>WCAG 1.4.13: it is dismissible (Escape), hoverable (you can move the pointer onto it) and persistent (it stays until you leave, blur or dismiss).</li>
          <li>Touch devices never show it. Treat tooltips as extra help: never put essential information, links or buttons in one.</li>
          <li>Tooltips are for the control’s name or a short hint. For rich content you need to interact with, use a popover or dialog.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'content', type: 'ReactNode', description: 'Short, plain supporting text.' },
          { name: 'children', type: 'ReactElement', description: 'One focusable element. It receives aria-describedby.' },
          { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", defaultValue: "'top'", description: 'Preferred side; flips if there is no room.' },
          { name: 'openDelay', type: 'number', defaultValue: '400', description: 'Milliseconds before showing on hover. Focus is immediate.' },
          { name: 'closeDelay', type: 'number', defaultValue: '120', description: 'Milliseconds before hiding, so the pointer can reach the tooltip.' },
        ]}
      />
    </>
  );
}
