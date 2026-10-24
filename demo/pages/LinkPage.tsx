import { Link } from '../../src';
import { Example, Notes } from '../components/Example';
import { KeyboardTable, PropsTable } from '../components/KeyboardTable';

export function LinkPage() {
  return (
    <>
      <Example
        title="In text"
        description={<p>Links are always underlined, so people don't have to tell colours apart to find them.</p>}
        layout="stack"
        code={`<p>Read the <Link href="#/overview">overview</Link> first.</p>`}
      >
        <p style={{ margin: 0 }}>
          Read the <Link href="#/overview">overview</Link> first, then try the <Link href="#/button">button</Link> page.
        </p>
      </Example>

      <Example
        title="External"
        description={
          <p>
            External links open in a new tab, show an icon, and tell screen reader users with hidden text. They also get{' '}
            <code>rel="noopener noreferrer"</code>.
          </p>
        }
        code={`<Link href="https://www.w3.org/WAI/ARIA/apg/" external>ARIA Authoring Practices</Link>`}
      >
        <Link href="https://www.w3.org/WAI/ARIA/apg/" external>
          ARIA Authoring Practices
        </Link>
      </Example>

      <KeyboardTable
        groups={[
          {
            rows: [
              { keys: ['Tab'], action: 'Moves focus to the link.' },
              { keys: ['Enter'], action: 'Follows the link.' },
            ],
          },
        ]}
      />

      <Notes title="Link or button?">
        <ul>
          <li><strong>Link:</strong> goes somewhere (another page, a section, a file).</li>
          <li><strong>Button:</strong> does something (submits, opens a dialog, deletes).</li>
          <li>Link text should make sense out of context: "Read the pricing guide", not "Click here".</li>
          <li>Opening a new tab is a surprise. Use <code>external</code> only when you must, and it will say so.</li>
        </ul>
      </Notes>

      <PropsTable
        rows={[
          { name: 'href', type: 'string', description: 'Where it goes.' },
          { name: 'external', type: 'boolean', defaultValue: 'false', description: 'Opens in a new tab, with an icon and hidden text.' },
          { name: '…anchor props', type: 'AnchorHTMLAttributes', description: 'Everything a native <a> accepts.' },
        ]}
      />
    </>
  );
}
